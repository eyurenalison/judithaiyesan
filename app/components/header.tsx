"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { SiteSettings } from "../lib/content/types";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/albums", label: "Albums" },
  { href: "/lyrics", label: "Lyrics" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

type HeaderProps = {
  settings: SiteSettings;
};

export function Header({ settings }: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const updateScrolled = () => {
      setIsScrolled(window.scrollY > 20);
    };

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header
      className={`site-header${isScrolled ? " scrolled" : ""}${
        isMenuOpen ? " menu-open" : ""
      }`}
    >
      <div className="site-shell">
        <nav className="site-nav" aria-label="Main navigation">
          <Link className="brand" href="/">
            <Image
              src={settings.logoSrc}
              alt={settings.siteName}
              width={160}
              height={66}
              priority
            />
          </Link>
          <button
            aria-controls="main-navigation"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
            className="menu-toggle"
            onClick={() => setIsMenuOpen((current) => !current)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
          <div className="nav-links" id="main-navigation">
            {navItems.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
