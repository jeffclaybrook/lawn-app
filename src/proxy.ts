import { NextResponse, type NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

const PROTECTED_ROUTES = [
 "/analytics",
 "/customers",
 "/expenses",
 "/mowings"
]

export async function proxy(req: NextRequest) {
 const sessionCookie = getSessionCookie(req)
 const { pathname } = req.nextUrl

 const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))

 if (isProtected && !sessionCookie) {
  const signInUrl = new URL("/auth/sign-in", req.url)
  signInUrl.searchParams.set("redirect", pathname)
  return NextResponse.redirect(signInUrl)
 }

 return NextResponse.next()
}

export const config = {
 matcher: [
  "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  "/((?!api|_next/static|_next/image|favicon.ico).*)",
  "/(api|trpc)(.*)",
  "/"
 ]
}