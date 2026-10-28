import type { Metadata } from "next";
import { share } from "@/lib/og";
import { Suspense } from "react";
import { Clients } from "@/components/Clients";

export const metadata: Metadata = { ...share("home"), title: "Clients" };

export default function Page() {
  return <Suspense><Clients /></Suspense>;
}
