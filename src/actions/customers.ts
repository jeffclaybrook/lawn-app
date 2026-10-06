"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"
import { db } from "@/drizzle/db"
import { customers } from "@/drizzle/schema"
import { getSession } from "@/lib/get-session"
import { customerSchema, type CustomerInput } from "@/schema/customer"

export async function createCustomer(input: CustomerInput) {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id
 const data = customerSchema.parse(input)

 const [customer] = await db
  .insert(customers)
  .values({ userId, ...data })
  .returning()

 revalidatePath("/customers")

 return customer
}

export async function updateCustomer(
 customerId: string,
 input: CustomerInput
) {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id
 const data = customerSchema.parse(input)

 const [customer] = await db
  .update(customers)
  .set({ ...data, updatedAt: new Date() })
  .where(and(eq(customers.id, customerId), eq(customers.userId, userId)))
  .returning()

 if (!customer) {
  throw new Error("Customer not found")
 }

 revalidatePath("/customers")
 revalidatePath(`/customers/${customerId}`)

 return customer
}

export async function deleteCustomer(customerId: string) {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id
 
 await db
  .delete(customers)
  .where(and(eq(customers.id, customerId), eq(customers.userId, userId)))

 revalidatePath("/customers")
}