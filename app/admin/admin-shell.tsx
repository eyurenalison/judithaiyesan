"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ToastProvider } from "../components/toast";
import { adminSignOut } from "./actions";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: "⊞" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
  { href: "/admin/hero-slides", label: "Hero Slides", icon: "⊟" },
  { href: "/admin/albums", label: "Albums", icon: "♫" },
  { href: "/admin/lyrics", label: "Lyrics", icon: "♪" },
  { href: "/admin/events", label: "Events", icon: "◈" },
  { href: "/admin/media", label: "Media", icon: "⊡" },
  { href: "/admin/messages", label: "Messages", icon: "✉" },
];

type AdminShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AdminShell({ title, description, children }: AdminShellProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <ToastProvider>
      <section className="admin-page">
        <div className="site-shell admin-layout">
          <aside className="admin-sidebar">
            <div className="admin-sidebar-brand">
              <span className="admin-sidebar-logo">JA</span>
              <div>
                <p className="eyebrow">Admin</p>
                <h2>Manage Site</h2>
              </div>
            </div>
            <nav className="admin-nav" aria-label="Admin navigation">
              {adminLinks.map((link) => (
                <Link
                  className={isActive(link.href) ? "active" : ""}
                  href={link.href}
                  key={link.href}
                >
                  <span className="admin-nav-icon">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>
            <form action={adminSignOut}>
              <button
                className="secondary-button admin-signout-btn"
                type="submit"
              >
                ↗ Sign Out
              </button>
            </form>
          </aside>
          <div className="admin-content">
            <div className="admin-heading">
              <p className="eyebrow">Dashboard</p>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
            {children}
          </div>
        </div>
      </section>
    </ToastProvider>
  );
}
