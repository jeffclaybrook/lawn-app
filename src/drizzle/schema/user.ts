import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { customers } from "./customers"
import { expenses } from "./expenses"
import { mowings } from "./mowings"

export const user = pgTable("user", {
 id: text("id").primaryKey(),
 name: text("name").notNull(),
 email: text("email").notNull().unique(),
 emailVerified: boolean("email_verified").notNull().default(false),
 image: text("image"),
 createdAt: timestamp("created_at").notNull().defaultNow(),
 updatedAt: timestamp("updated_at").notNull().defaultNow()
})

export const userRelations = relations(
 user,
 ({ many }) => ({
  customers: many(customers),
  expenses: many(expenses),
  mowings: many(mowings)
 })
)