import type { Metadata } from "next";
import { Suspense } from "react";
import { ClientPortal } from "@/components/ClientPortal";

export const metadata: Metadata = { title: { absolute: "Client portal" } };

export default function Page() {
  return <Suspense><ClientPortal /></Suspense>;
}
