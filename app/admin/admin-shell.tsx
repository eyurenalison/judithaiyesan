"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { adminSignOut } from "./actions";
import {
  IconAlbums,
  IconClose,
  IconDashboard,
  IconEvents,
  IconExternalLink,
  IconHeroSlides,
  IconLyrics,
  IconMedia,
  IconMenu,
  IconMessages,
  IconSettings,
  IconSignOut,
} from "./components/icons";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", Icon: IconDashboard },
  { href: "/admin/settings", label: "Settings", Icon: IconSettings },
  { href: "/admin/hero-slides", label: "Hero Slides", Icon: IconHeroSlides },
  { href: "/admin/albums", label: "Albums", Icon: IconAlbums },
  { href: "/admin/lyrics", label: "Lyrics", Icon: IconLyrics },
  { href: "/admin/events", label: "Events", Icon: IconEvents },
  { href: "/admin/media", label: "Media Library", Icon: IconMedia },
  { href: "/admin/messages", label: "Messages", Icon: IconMessages },
];

type AdminShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function AdminShell({
  title,
  description,
  children,
  actions,
}: AdminShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className="admin-root">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <button
          aria-label="Close mobile menu"
          className="admin-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          type="button"
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar-modern ${mobileMenuOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <Link className="admin-brand-link" href="/admin">
            <span className="admin-brand-avatar">JA</span>
            <div className="admin-brand-text">
              <span className="admin-brand-title">Judith Aiyesan</span>
              <span className="admin-brand-badge">Admin Portal</span>
            </div>
          </Link>
          <button
            aria-label="Close menu"
            className="admin-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            type="button"
          >
            <IconClose />
          </button>
        </div>

        <nav className="admin-nav-modern" aria-label="Admin Navigation">
          <div className="admin-nav-section-label">Management</div>
          {adminNavItems.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                className={`admin-nav-link ${active ? "active" : ""}`}
                href={href}
                key={href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="admin-nav-icon-wrap">
                  <Icon />
                </span>
                <span className="admin-nav-label">{label}</span>
                {active && <span className="admin-nav-indicator" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Workspace */}
      <div className="admin-workspace">
        {/* Admin Header / Top Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              aria-label="Open navigation menu"
              className="admin-hamburger-btn"
              onClick={() => setMobileMenuOpen(true)}
              type="button"
            >
              <IconMenu />
            </button>

            <div className="admin-header-brand-mini">
              <span className="admin-header-brand-avatar">JA</span>
              <span className="admin-header-brand-text">Admin</span>
            </div>

            <div className="admin-breadcrumbs">
              <Link
                className="admin-crumb-home"
                href="/admin"
                title="Dashboard"
              >
                <IconDashboard />
                <span>Admin</span>
              </Link>
              <span className="admin-crumb-sep">/</span>
              <span className="admin-crumb-active">{title}</span>
            </div>
          </div>

          <div className="admin-topbar-right">
            <Link
              className="admin-header-link"
              href="/admin/messages"
              title="View contact messages"
            >
              <IconMessages />
              <span className="admin-header-link-label">Messages</span>
            </Link>

            <a
              className="admin-live-site-btn"
              href="/"
              rel="noreferrer"
              target="_blank"
              title="Open live website in new tab"
            >
              <span>Live Site</span>
              <IconExternalLink />
            </a>

            <div className="admin-header-divider" />

            <div className="admin-header-user">
              <div className="admin-user-avatar mini">
                <span>A</span>
                <span className="admin-user-status" />
              </div>
              <div className="admin-header-user-meta">
                <span className="admin-header-user-name">Administrator</span>
                <span className="admin-header-user-role">Super Admin</span>
              </div>
            </div>

            <form action={adminSignOut} className="admin-header-signout-form">
              <button
                className="admin-header-signout-btn"
                title="Sign out of admin session"
                type="submit"
              >
                <IconSignOut />
                <span className="admin-header-signout-label">Sign Out</span>
              </button>
            </form>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-main">
          <div className="admin-page-header">
            <div className="admin-page-header-text">
              <h1 className="admin-page-title">{title}</h1>
              <p className="admin-page-desc">{description}</p>
            </div>
            {actions && (
              <div className="admin-page-header-actions">{actions}</div>
            )}
          </div>

          <div className="admin-page-body">{children}</div>
        </main>
      </div>
    </div>
  );
}
