import type { Metadata } from "next";
import { share } from "@/lib/og";
import { Templates } from "@/components/Templates";

export const metadata: Metadata = { ...share("templates"), title: "Templates" };

export default function Page() {
  return <Templates />;
}
