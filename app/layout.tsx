import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ToastHost } from "@/components/ui/ToastHost";
import { AGENCY } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: `${AGENCY.name} — ${AGENCY.tagline}`,
    template: `%s · ${AGENCY.name}`,
  },
  description:
    "Kamora Tech builds business websites, e-commerce stores, custom software, dashboards, and web systems engineered for speed, security, and growth.",
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  openGraph: {
    title: `${AGENCY.name} — ${AGENCY.tagline}`,
    description:
      "Websites, e-commerce, custom software, and digital systems built properly.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-vh-100 d-flex flex-column">
        <Providers>
          {children}
          <ToastHost />
        </Providers>
      </body>
    </html>
  );
}
