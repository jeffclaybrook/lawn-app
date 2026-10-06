import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { mowings } from "./mowings"
import { user } from "./user"

export const customers = pgTable("customers", {
 id: uuid("id").primaryKey().defaultRandom(),
 userId: text("user_id")
  .notNull()
  .references(() => user.id, { onDelete: "cascade" }),
 name: text("name").notNull(),
 address: text("address").notNull(),
 createdAt: timestamp("created_at").notNull().defaultNow(),
 updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (table) => [
 index("customers_user_id_idx").on(table.userId),
 index("customers_name_idx").on(table.name)
])

export const customersRelations = relations(
 customers,
 ({ one, many }) => ({
  user: one(user, {
   fields: [customers.userId],
   references: [user.id]
  }),
  mowings: many(mowings)
 })
)

export type CustomersType = typeof customers.$inferSelect