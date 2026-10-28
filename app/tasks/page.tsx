import type { Metadata } from "next";
import { Suspense } from "react";
import { TasksPage } from "@/components/TasksPage";

export const metadata: Metadata = { title: "Tasks" };

export default function Page() {
  return <Suspense><TasksPage /></Suspense>;
}
