import type { Metadata } from "next";
import { Templates } from "@/components/Templates";

export const metadata: Metadata = { title: "Templates" };

export default function Page() {
  return <Templates />;
}
