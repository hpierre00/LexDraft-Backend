import { redirect } from "next/navigation";
import { DashboardPage } from "@/components/dashboard/dashboard-page";

export default function Home() {
  const isAuthenticated = false;
  // if (!isAuthenticated) {
  //   redirect("/login");
  // }

  return <DashboardPage />;
}
