import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { factory } from '../factory'
import authApp from '../auth'
import contactApp from '../contact'

const api = factory.createApp()
  .route('/auth', authApp)
  .route('/contacts', contactApp)

export const runtime = 'edge'
export const GET = handle(api)
export const POST = handle(api)
export const PUT = handle(api)
export const DELETE = handle(api)
export const PATCH = handle(api)