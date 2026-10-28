import type { Metadata } from "next";
import { share } from "@/lib/og";
import { Suspense } from "react";
import { TasksPage } from "@/components/TasksPage";

export const metadata: Metadata = { ...share("tasks"), title: "Tasks" };

export default function Page() {
  return <Suspense><TasksPage /></Suspense>;
}
