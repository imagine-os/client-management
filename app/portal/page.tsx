import type { Metadata } from "next";
import { share } from "@/lib/og";
import { Suspense } from "react";
import { ClientPortal } from "@/components/ClientPortal";

export const metadata: Metadata = { ...share("portal"), title: { absolute: "Client portal" } };

export default function Page() {
  return <Suspense><ClientPortal /></Suspense>;
}
