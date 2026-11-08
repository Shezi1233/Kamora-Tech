import { SiteNavbar } from "@/components/site/SiteNavbar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { getCurrentUser } from "@/lib/session";
import { cartCount } from "@/lib/cart";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, count] = await Promise.all([getCurrentUser(), cartCount()]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteNavbar user={user} cartCount={count} />
      <main id="main-content" className="flex-grow-1">
        {children}
      </main>
      <SiteFooter user={user} />
      <ChatWidget user={user ? { full_name: user.full_name } : null} />
    </>
  );
}
