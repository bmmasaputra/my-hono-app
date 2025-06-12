import { createFactory } from 'hono/factory'
import { jwt } from 'hono/jwt'
import prisma from './prisma'
import { jwtPayload } from './type'
import supabase from './supabase'

declare module 'hono' {
  interface ContextVariableMap {
    prisma: typeof prisma
    jwtPayload: jwtPayload
    supabase: typeof supabase
  }
}

export const factory = createFactory({
  initApp: app => {
    // 1. Inject Prisma & Supabase into every request
    app.use('*', async (c, next) => {
      c.set('prisma', prisma)
      c.set('supabase', supabase)
      await next()
    })

    // 2. Apply JWT middleware to protect "/authors" & "/books" routes
    app.use(
      '/contact/*',
      (c, next) => jwt({ secret: process.env.JWT_SECRET! })(c, next)
    )
  }
})
