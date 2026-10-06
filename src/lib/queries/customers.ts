import { and, eq, desc, max } from "drizzle-orm"
import { db } from "@/drizzle/db"
import { customers, mowings } from "@/drizzle/schema"
import { getSession } from "../get-session"

export async function getCustomers() {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id

 return db
  .select({
   id: customers.id,
   name: customers.name,
   address: customers.address,
   lastMowedAt: max(mowings.date)
  })
  .from(customers)
  .leftJoin(mowings, eq(mowings.customerId, customers.id))
  .where(eq(customers.userId, userId))
  .groupBy(customers.id)
  .orderBy(customers.name)
}

export async function getCustomer(customerId: string) {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id

 const customer = await db.query.customers.findFirst({
  where: and(eq(customers.id, customerId), eq(customers.userId, userId)),
  with: {
   mowings: {
    orderBy: desc(mowings.date)
   }
  }
 })

 if (!customer) {
  throw new Error("Customer not found")
 }

 return customer
}

export type CustomerListItem = Awaited<ReturnType<typeof getCustomers>>[number]