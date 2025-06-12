import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { sign } from 'hono/jwt'
import { nanoid } from 'nanoid'

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
    const user = await prisma.user.create({ data: { id: nanoid(), username, password } })
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
    const user = await prisma.user.findFirst({ where: { username } })
    if (!user || user.password !== password) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    const now = Math.floor(Date.now() / 1000)
    const payload = { id: String(user.id), iat: now }
    const token = await sign(payload, process.env.JWT_SECRET!)
    return c.json({ message: 'Logged in' })
  }
)

export default authApp
