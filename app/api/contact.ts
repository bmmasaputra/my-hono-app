import { factory } from "./factory";
import { nanoid } from "nanoid";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

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

const ContactSchema = z.object({
  avatar: z
    .instanceof(File)
    .refine(
      (file) =>
        ["image/jpeg", "image/jpg"].includes(file.type) &&
        file.size < 5 * 1024 * 1024,
      {
        message: "Avatar must be a JPG/JPEG file under 5MB",
      }
    )
    .optional(),
  name: z.string().min(1).max(255),
  phoneNumber: z.string().min(11).max(15),
});

contactApp.post("/", zValidator( 'form', ContactSchema), async (c) => {
  const { name, phoneNumber, avatar } = c.req.valid("form");
  const supabase = c.get("supabase");
  const id = nanoid();
  let img_url = process.env.DEFAULT_AVATAR!;

  if (avatar) {
    const { data, error } = await supabase.storage
      .from(process.env.BUCKET_NAME!)
      .upload(`avatar/${id}.jpg`, avatar, {
        contentType: "image/jpeg",
      });

      if (error) {
        return c.json({ error: error.message }, 400);
      }

    img_url = `${process.env.FILE_URL!}/${data.fullPath}`;
  }
  
  const payload = c.get("jwtPayload");
  const newContact = await c.get("prisma").contacts.create({
    data: {
      id: nanoid(),
      name,
      number: phoneNumber,
      img_url,
      user_id: payload.id,
    },
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
