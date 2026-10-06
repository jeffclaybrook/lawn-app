"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"
import { db } from "@/drizzle/db"
import { customers, mowings } from "@/drizzle/schema"
import { getSession } from "@/lib/get-session"
import { mowingSchema, type MowingInput } from "@/schema/mowing"

async function assertCustomerOwnership(
 customerId: string,
 userId: string
) {
 const customer = await db.query.customers.findFirst({
  where: and(eq(customers.id, customerId), eq(customers.userId, userId))
 })

 if (!customer) {
  throw new Error("Customer not found")
 }
}

export async function createMowing(input: MowingInput) {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id
 const data = mowingSchema.parse(input)

 await assertCustomerOwnership(data.customerId, userId)

 const [mowing] = await db
  .insert(mowings)
  .values({
   userId,
   customerId: data.customerId,
   amount: data.amount.toFixed(2),
   date: data.date
  })
  .returning()

 revalidatePath("/")
 revalidatePath("/mowings")
 revalidatePath(`/customers/${data.customerId}`)

 return mowing
}

export async function updateMowing(
 mowingId: string,
 input: MowingInput
) {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id
 const data = mowingSchema.parse(input)

 await assertCustomerOwnership(data.customerId, userId)

 const [mowing] = await db
  .update(mowings)
  .set({
   customerId: data.customerId,
   amount: data.amount.toFixed(2),
   date: data.date,
   updatedAt: new Date()
  })
  .where(and(eq(mowings.id, mowingId), eq(mowings.userId, userId)))
  .returning()

 if (!mowing) {
  throw new Error("Mowing not found")
 }

 revalidatePath("/")
 revalidatePath("/mowings")
 revalidatePath(`/mowings/${mowingId}`)
 revalidatePath(`/customers/${data.customerId}`)

 return mowing
}

export async function deleteMowing(mowingId: string) {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id
 
 await db
  .delete(mowings)
  .where(and(eq(mowings.id, mowingId), eq(mowings.userId, userId)))

 revalidatePath("/")
 revalidatePath("/mowings")
}