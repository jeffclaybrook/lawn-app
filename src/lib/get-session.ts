"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/drizzle/db"
import { user } from "@/drizzle/schema"
import { auth } from "./auth"

export async function getSession() {
 const session = await auth.api.getSession({
  headers: await headers()
 })

 if (!session) {
  redirect("/auth/sign-in")
 }

 const currentUser = await db.query.user.findFirst({
  where: eq(user.id, session.user.id)
 })

 if (!currentUser) {
  redirect("/auth/sign-in")
 }

 return {
  ...session,
  currentUser
 }
}

export async function getOptionalSession() {
 return auth.api.getSession({
  headers: await headers()
 })
}