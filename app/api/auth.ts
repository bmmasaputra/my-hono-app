import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { sign } from 'hono/jwt'
import { setCookie, deleteCookie } from 'hono/cookie'

const authApp = new Hono()

const SignupSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8)
})

authApp.post(
  '/signup',
  zValidator('json', SignupSchema),
  async c => {
    const { username, password } = c.req.valid('json')
    const prisma = c.get('prisma')
    const user = await prisma.user.create({ data: { username, password } })
    return c.json({ user }, 201)
  }
)

const LoginSchema = z.object({
  username: z.string(),
  password: z.string()
})

authApp.post(
  '/login',
  zValidator('json', LoginSchema),
  async c => {
    const { username, password } = c.req.valid('json')
    const prisma = c.get('prisma')
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user || user.password !== password) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    const now = Math.floor(Date.now() / 1000)
    const payload = { sub: String(user.id), iat: now }
    const token = await sign(payload, c.env.JWT_SECRET)
    setCookie(c, 'token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24
    })
    return c.json({ message: 'Logged in' })
  }
)

authApp.post('/logout', c => {
  deleteCookie(c, 'token', { path: '/' })
  return c.json({ message: 'Logged out' })
})

export default authApp
