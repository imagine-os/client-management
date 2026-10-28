import type { Metadata } from "next";
import { Suspense } from "react";
import { Clients } from "@/components/Clients";

export const metadata: Metadata = { title: "Clients" };

export default function Page() {
  return <Suspense><Clients /></Suspense>;
}
