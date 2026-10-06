"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { signInSchema, type SignInInput } from "@/schema/sign-in"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field"
import { Input } from "./ui/input"
import { Separator } from "./ui/separator"
import { GoogleIcon } from "./Icons"
import Link from "next/link"

export function SignInForm() {
 const [isPending, startTransition] = useTransition()
 const router = useRouter()

 const form = useForm<SignInInput>({
  resolver: zodResolver(signInSchema),
  defaultValues: {
   email: "",
   password: ""
  }
 })

 const onSubmit = (values: SignInInput) => {
  startTransition(async () => {
   try {
    await authClient.signIn.email(
     {
      email: values.email,
      password: values.password,
      callbackURL: "/"
     },
     {
      onSuccess: () => {
       router.push("/")
      },
      onError: (ctx) => {
       toast.error(ctx.error.message)
      }
     }
    )
   } catch (error) {
    form.setError("root", {
     message:
      error instanceof Error
       ? error.message
       : "Something went wrong. Please try again."
    })

    toast.error("Something went wrong. Please try again.")
   }
  })
 }

 const signInWithGoogle = async () => {
  await authClient.signIn.social({
   provider: "google",
   callbackURL: "/"
  })
 }

 return (
  <Card className="max-w-md w-full">
   <CardHeader className="text-center">
    <CardTitle className="text-xl">Welcome back</CardTitle>
    <CardDescription>Sign in to your account</CardDescription>
   </CardHeader>
   <CardContent className="space-y-4">
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
     <FieldGroup>
      <Controller
       control={form.control}
       name="email"
       render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-1.5">
         <FieldLabel htmlFor={field.name}>Email</FieldLabel>
         <Input
          type="email"
          id={field.name}
          placeholder="Email"
          aria-invalid = {fieldState.invalid}
          {...field}
         />
         {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
       )}
      />
      <Controller
       control={form.control}
       name="password"
       render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-1.5">
         <FieldLabel htmlFor={field.name}>Password</FieldLabel>
         <Input
          type="password"
          id={field.name}
          placeholder="Password"
          aria-invalid = {fieldState.invalid}
          {...field}
         />
         {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
       )}
      />
     </FieldGroup>
     {form.formState.errors.root && (
      <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
     )}
     <Button
      type="submit"
      disabled={isPending}
      className="h-11 w-full"
     >
      {isPending && <Loader2 className="size-4 animate-spin" />}
      Sign in
     </Button>
    </form>
    <div className="flex flex-col items-stretch gap-6">
     <div className="relative">
      <Separator />
      <div className="absolute top-1/2 left-1/2 -translate-y-[50%] -translate-x-[50%] bg-background p-2 z-50">or</div>
     </div>
     <Button
      type="button"
      variant="outline"
      onClick={signInWithGoogle}
      className="h-11"
     >
      <GoogleIcon className="size-4" />
      Continue with Google
     </Button>
     <p className="text-center">
      Don&apos;t have an account?{" "}
      <Link href={"/auth/sign-up"} className="text-blue-900 underline">Sign up</Link>
     </p>
    </div>
   </CardContent>
  </Card>
 )
}