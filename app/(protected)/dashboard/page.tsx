import { getDashboardData } from "@/lib/utils/data-fetch";
import DashboardClient from "@/components/dashboard/client";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const { user } = await getAuthenticatedUser();


  if (!user) {
    return <div>Please log in to view your dashboard</div>;
  }


  const dashboardData = await getDashboardData(user.id);

  return (

    <DashboardClient dashboardData={dashboardData} />

  )

}