import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { db } from "@/drizzle/db"
import * as schema from "@/drizzle/schema"

export const auth = betterAuth({
 database: drizzleAdapter(db, {
  provider: "pg",
  schema
 }),
 emailAndPassword: {
  enabled: true,
  requireEmailVerification: false
 },
 socialProviders: {
  google: {
   clientId: process.env.GOOGLE_CLIENT_ID as string,
   clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
  }
 },
 trustedOrigins: [
  "http://localhost:3000",
  "https://lawn-app-three.vercel.app"
 ],
 plugins: [nextCookies()]
})