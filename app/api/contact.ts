import { factory } from "./factory";
import { nanoid } from "nanoid";

const contactApp = factory.createApp();

contactApp.get("/", async (c) => {
  const contacts = await c.get("prisma").contacts.findMany({
    where: { user_id: c.get("jwtPayload").id },
    orderBy: { name: "asc" },
  });
  return contacts ? c.json(contacts) : c.notFound();
});

contactApp.get("/:id", async (c) => {
  const id = c.req.param("id");
  const contact = await c.get("prisma").contacts.findUnique({ where: { id } });
  return contact ? c.json(contact) : c.notFound();
});

contactApp.post("/", async (c) => {
  
  const { name, phoneNumber } = await c.req.json();
  const payload = c.get("jwtPayload");
  const newContact = await c.get("prisma").contacts.create({
    data: { id: nanoid(), name, number: phoneNumber, user_id: payload.id },
  });
  return c.json(newContact, 201);
});

contactApp.put("/:id", async (c) => {
  const id = c.req.param("id");
  const { name, phoneNumber } = await c.req.json();
  const updatedContact = await c.get("prisma").contacts.update({
    where: { id },
    data: { name, number: phoneNumber },
  });
  return updatedContact ? c.json(updatedContact) : c.notFound();
});

contactApp.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const deletedContact = await c
    .get("prisma")
    .contacts.delete({ where: { id } });
  return deletedContact ? c.json(deletedContact) : c.notFound();
});

export default contactApp;
