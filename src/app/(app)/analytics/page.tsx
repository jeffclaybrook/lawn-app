import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { toChartData } from "@/lib/helpers"
import { getRevenueVsExpenses, getTopCustomersByRevenue, getMostMowedLawns } from "@/lib/queries/analytics"
import type { MostMowedData, TopCustomersData } from "@/types"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Header } from "@/components/Header"
import { MostMowedTable } from "@/components/MostMowedTable"
import { TopCustomersTable } from "@/components/TopCustomersTable"
import { TransactionsChart } from "@/components/TransactionsChart"

export default async function Analytics() {
 const session = await getSession()

 if (!session) {
  redirect("/auth/sign-in")
 }

 const [weekly, monthly, quarterly, yearly, topCustomers, mostMowed] = await Promise.all([
  getRevenueVsExpenses("week"),
  getRevenueVsExpenses("month"),
  getRevenueVsExpenses("quarter"),
  getRevenueVsExpenses("year"),
  getTopCustomersByRevenue(),
  getMostMowedLawns()
 ])

 const topCustomersData: TopCustomersData[] = topCustomers.map((customer) => ({
  id: customer.customerId,
  name: customer.customerName,
  revenue: Number(customer.totalRevenue)
 }))

 const mostMowedData: MostMowedData[] = mostMowed.map((lawn) => ({
  id: lawn.customerId,
  name: lawn.customerName,
  address: lawn.customerAddress,
  mowingCount: lawn.mowingCount
 }))

 return (
  <>
   <Header
    userName={session?.user.name}
    userImage={session?.user.image || undefined}
   >
    <Breadcrumb>
     <BreadcrumbList>
      <BreadcrumbItem>
       <BreadcrumbPage>Analytics</BreadcrumbPage>
      </BreadcrumbItem>
     </BreadcrumbList>
    </Breadcrumb>
   </Header>
   <div className="flex flex-1">
    <AppSidebar />
    <SidebarInset className="flex flex-col gap-4 flex-1 pb-4 md:px-4 pt-[--header-height:calc(--spacing(14))] overflow-y-auto">
     <div className="flex flex-col items-stretch gap-4 pt-4 h-full">
      <TransactionsChart
       weekly={toChartData(weekly, "week")}
       monthly={toChartData(monthly, "month")}
       quarterly={toChartData(quarterly, "quarter")}
       yearly={toChartData(yearly, "year")}
      />
      <TopCustomersTable customers={topCustomersData} />
      <MostMowedTable mowings={mostMowedData} />
     </div>
    </SidebarInset>
   </div>
  </>
 )
}