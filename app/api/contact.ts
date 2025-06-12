import { factory } from './factory'
import { nanoid } from 'nanoid'

const contactApp = factory.createApp()

contactApp.get('/', async c => {
  const contacts = await c.get('prisma').contacts.findMany()
  return c.json(contacts)
})

contactApp.get('/:id', async c => {
  const id = c.req.param('id')
  const contact = await c.get('prisma').contacts.findUnique({ where: { id } })
  return contact
    ? c.json(contact)
    : c.notFound()
})

contactApp.post('/', async c => {
  const { name, phoneNumber } = await c.req.json()
  const payload = c.get('jwtPayload')
  const newContact = await c.get('prisma').contacts.create({
    data: { id: nanoid(), name, number:phoneNumber, user_id: payload.id }
  })
  return c.json(newContact, 201)
})

export default contactApp
