"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SiteSettings } from "../lib/content/types";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/albums", label: "Albums" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

type FooterProps = {
  settings: SiteSettings;
};

export function Footer({ settings }: FooterProps) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }
  return (
    <footer className="site-footer">
      <div className="site-shell footer-row">
        <span>
          Copyright &copy; {new Date().getFullYear()} {settings.siteName}. All
          rights reserved.
        </span>
        <nav className="footer-links" aria-label="Footer navigation">
          {footerLinks.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
