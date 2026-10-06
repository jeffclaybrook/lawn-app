"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createMowing, updateMowing } from "@/actions/mowings"
import type { CustomersType, MowingsType } from "@/drizzle/schema"
import { formatDate } from "@/lib/helpers"
import { mowingSchema, type MowingInput } from "@/schema/mowing"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field"
import { Input } from "./ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

type MowingFormProps = {
 mowing?: MowingsType
 customers: Pick<CustomersType, "id" | "name">[]
}

export function MowingForm({
 mowing,
 customers
}: MowingFormProps) {
 const [open, setOpen] = useState<boolean>(false)
 const [isPending, startTransition] = useTransition()
 const router = useRouter()
 const isEditing = !!mowing

 const form = useForm<z.input<typeof mowingSchema>, unknown, MowingInput>({
  resolver: zodResolver(mowingSchema),
  defaultValues: {
   customerId: mowing?.customerId ?? "",
   amount: mowing ? Number(mowing.amount) : undefined,
   date: mowing ? new Date(mowing.date) : new Date()
  }
 })

 const onSubmit = (values: MowingInput) => {
  startTransition(async () => {
   try {
    if (isEditing) {
     await updateMowing(mowing.id, values)
    } else {
     await createMowing(values)
    }

    router.push("/mowings")
    router.refresh()
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

 return (
  <Card className="max-w-md w-full mx-auto">
   <CardHeader className="text-center">
    <CardTitle className="text-xl">{isEditing ? "Update mowing" : "Create mowing"}</CardTitle>
   </CardHeader>
   <CardContent>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
     <FieldGroup>
      <Controller
       control={form.control}
       name="customerId"
       render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-1.5">
         <FieldLabel htmlFor={field.name}>Customer</FieldLabel>
         <Select
          name={field.name}
          value={field.value}
          onValueChange={field.onChange}
         >
          <SelectTrigger className="!h-11">
           <SelectValue placeholder="Select a customer..." />
          </SelectTrigger>
          <SelectContent position="popper">
           {customers.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">No customers yet.</div>
           ) : (
            customers.map((customer) => (
             <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
            ))
           )}
          </SelectContent>
         </Select>
         {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
       )}
      />
      <Controller
       control={form.control}
       name="amount"
       render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-1.5">
         <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
         <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
           type="number"
           inputMode="decimal"
           step="0.01"
           min="0"
           id={field.name}
           name={field.name}
           ref={field.ref}
           onBlur={field.onBlur}
           value={(field.value as number | undefined) ?? ""}
           onChange={(e) => field.onChange(e.target.valueAsNumber)}
           placeholder="0.00"
           aria-invalid={fieldState.invalid}
           className="pl-6"
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
         </div>
        </Field>
       )}
      />
      <Controller
       control={form.control}
       name="date"
       render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-1.5">
         <FieldLabel htmlFor={field.name}>Date mowed</FieldLabel>
         <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
           <Button
            type="button"
            variant="outline"
            id={field.name}
            className="justify-start text-start w-full font-normal h-11"
           >
            <CalendarIcon className="size-4 mr-2" />
            {field.value ? formatDate(field.value as Date) : "Select a date..."}
           </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
           <Calendar
            mode="single"
            selected={field.value as Date | undefined}
            onSelect={(date) => {
             field.onChange(date)
             setOpen(false)
            }}
            disabled={(date) => date > new Date()}
           />
          </PopoverContent>
         </Popover>
         {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
       )}
      />
     </FieldGroup>
     {form.formState.errors.root && (
      <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
     )}
     <div className="flex justify-end gap-2">
      <Button
       type="button"
       variant="outline"
       onClick={() => router.back()}
       disabled={isPending}
       className="h-11"
      >
       Cancel
      </Button>
      <Button
       type="submit"
       disabled={isPending}
       className="h-11"
      >
       {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
       {isEditing ? "Save changes" : "Create mowing"}
      </Button>
     </div>
    </form>
   </CardContent>
  </Card>
 )
}