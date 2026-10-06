import { pgTable, uuid, text, numeric, timestamp, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { customers } from "./customers"
import { user } from "./user"

export const mowings = pgTable("mowings", {
 id: uuid("id").primaryKey().defaultRandom(),
 userId: text("user_id")
  .notNull()
  .references(() => user.id, { onDelete: "cascade" }),
 customerId: uuid("customer_id")
  .notNull()
  .references(() => customers.id, { onDelete: "cascade" }),
 amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
 date: timestamp("date", { withTimezone: true }).notNull(),
 createdAt: timestamp("created_at").notNull().defaultNow(),
 updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (table) => [
 index("mowings_user_id_idx").on(table.userId),
 index("mowings_customer_id_idx").on(table.customerId),
 index("mowings_date_idx").on(table.date)
])

export const mowingsRelations = relations(
 mowings,
 ({ one }) => ({
  user: one(user, {
   fields: [mowings.userId],
   references: [user.id]
  }),
  customer: one(customers, {
   fields: [mowings.customerId],
   references: [customers.id]
  })
 })
)

export type MowingsType = typeof mowings.$inferSelect