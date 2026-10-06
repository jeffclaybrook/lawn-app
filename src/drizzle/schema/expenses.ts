import { pgTable, uuid, text, numeric, timestamp, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { user } from "./user"

export const expenses = pgTable("expenses", {
 id: uuid("id").primaryKey().defaultRandom(),
 userId: text("user_id")
  .notNull()
  .references(() => user.id, { onDelete: "cascade" }),
 description: text("description").notNull(),
 amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
 date: timestamp("date", { withTimezone: true }).notNull(),
 createdAt: timestamp("created_at").notNull().defaultNow(),
 updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (table) => [
 index("expenses_user_id_idx").on(table.userId),
 index("expenses_date_idx").on(table.date)
])

export const expensesRelations = relations(
 expenses,
 ({ one }) => ({
  user: one(user, {
   fields: [expenses.userId],
   references: [user.id]
  })
 })
)

export type ExpensesType = typeof expenses.$inferSelect