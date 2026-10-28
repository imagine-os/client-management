import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/site/Providers";
import { share, siteUrl } from "@/lib/og";
import "./globals.css";

export const metadata: Metadata = {
  // Pages without their own share image use the clients one.
  ...share("home"),
  metadataBase: new URL(siteUrl),
  title: { default: "JAM Studio · Client management", template: "%s · JAM Studio" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/* Before first paint: restores the saved theme, so a dark-mode visitor gets no light flash. */
const themeScript = `(function(){try{var t=localStorage.getItem("bg-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-bg text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
