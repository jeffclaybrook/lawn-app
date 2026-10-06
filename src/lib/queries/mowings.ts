import { and, eq, desc } from "drizzle-orm"
import { db } from "@/drizzle/db"
import { customers, mowings } from "@/drizzle/schema"
import { getSession } from "../get-session"

export async function getMowings() {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id

 return db
  .select({
   id: mowings.id,
   amount: mowings.amount,
   date: mowings.date,
   customerId: mowings.customerId,
   customerName: customers.name
  })
  .from(mowings)
  .innerJoin(customers, eq(mowings.customerId, customers.id))
  .where(eq(mowings.userId, userId))
  .orderBy(desc(mowings.date))
}

export async function getMowing(mowingId: string) {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id

 const mowing = await db.query.mowings.findFirst({
  where: and(eq(mowings.id, mowingId), eq(mowings.userId, userId)),
  with: {
   customer: true
  }
 })

 if (!mowing) {
  throw new Error("Mowing not found")
 }

 return mowing
}

export type MowingListItem = Awaited<ReturnType<typeof getMowings>>[number]