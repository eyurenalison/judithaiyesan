import Link from "next/link";
import { getPrisma } from "../lib/db";
import { markMessageRead } from "./actions";
import { AdminForm } from "./admin-form";
import { AdminShell } from "./admin-shell";
import {
  IconAlbums,
  IconEvents,
  IconHeroSlides,
  IconLyrics,
  IconMedia,
  IconMessages,
  IconPlus,
  IconSettings,
} from "./components/icons";
import { requireAdmin } from "./guard";

export default async function AdminPage() {
  await requireAdmin();
  const prisma = getPrisma();

  const [
    slidesCount,
    albumsCount,
    lyricsCount,
    eventsCount,
    mediaCount,
    unreadMessagesCount,
    recentMessages,
    upcomingEvents,
  ] = await Promise.all([
    prisma.heroSlide.count(),
    prisma.album.count(),
    prisma.lyric.count(),
    prisma.event.count(),
    prisma.media.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.event.findMany({
      orderBy: { date: "asc" },
      take: 4,
    }),
  ]);

  const statCards = [
    {
      title: "Hero Slides",
      count: slidesCount,
      href: "/admin/hero-slides",
      Icon: IconHeroSlides,
      color: "emerald",
      desc: "Homepage banners",
    },
    {
      title: "Albums",
      count: albumsCount,
      href: "/admin/albums",
      Icon: IconAlbums,
      color: "blue",
      desc: "Music discography",
    },
    {
      title: "Lyrics",
      count: lyricsCount,
      href: "/admin/lyrics",
      Icon: IconLyrics,
      color: "purple",
      desc: "Song lyrics & chords",
    },
    {
      title: "Events",
      count: eventsCount,
      href: "/admin/events",
      Icon: IconEvents,
      color: "amber",
      desc: "Concerts & programs",
    },
    {
      title: "Media Library",
      count: mediaCount,
      href: "/admin/media",
      Icon: IconMedia,
      color: "cyan",
      desc: "Cloud assets",
    },
    {
      title: "Unread Messages",
      count: unreadMessagesCount,
      href: "/admin/messages",
      Icon: IconMessages,
      color: unreadMessagesCount > 0 ? "rose" : "slate",
      desc: "Inquiries & booking",
    },
  ];

  return (
    <AdminShell
      description="Overview of your site content, publishing status, and incoming messages."
      title="Dashboard"
    >
      {/* Quick Action Shortcuts */}
      <div className="admin-quick-actions-bar">
        <span className="admin-quick-actions-label">Quick Actions:</span>
        <div className="admin-quick-actions-list">
          <Link className="admin-action-chip" href="/admin/albums">
            <IconPlus /> Add Album
          </Link>
          <Link className="admin-action-chip" href="/admin/events">
            <IconPlus /> Create Event
          </Link>
          <Link className="admin-action-chip" href="/admin/media">
            <IconPlus /> Upload Media
          </Link>
          <Link className="admin-action-chip" href="/admin/hero-slides">
            <IconPlus /> New Slide
          </Link>
          <Link className="admin-action-chip secondary" href="/admin/settings">
            <IconSettings /> Site Settings
          </Link>
        </div>
      </div>

      {/* Modern Stat Grid */}
      <div className="admin-metrics-grid">
        {statCards.map(({ title, count, href, Icon, color, desc }) => (
          <Link
            className={`admin-metric-card color-${color}`}
            href={href}
            key={title}
          >
            <div className="admin-metric-top">
              <span className={`admin-metric-icon-box bg-${color}`}>
                <Icon />
              </span>
              <span className="admin-metric-badge">Manage &rarr;</span>
            </div>
            <div className="admin-metric-body">
              <span className="admin-metric-value">{count}</span>
              <h2 className="admin-metric-title">{title}</h2>
              <p className="admin-metric-desc">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Two Column Grid for Live Previews */}
      <div className="admin-dashboard-two-col">
        {/* Recent Messages Card */}
        <section className="admin-card-section">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Recent Inquiries</h2>
              <p className="admin-card-subtitle">
                Latest messages from the contact form
              </p>
            </div>
            <Link className="admin-card-link" href="/admin/messages">
              View All ({unreadMessagesCount} unread) &rarr;
            </Link>
          </div>

          {recentMessages.length === 0 ? (
            <div className="admin-empty-state-mini">
              <IconMessages />
              <p>No messages received yet.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-modern-table">
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMessages.map((msg) => (
                    <tr key={msg.id}>
                      <td>
                        <div className="admin-table-user">
                          <span className="admin-table-avatar">
                            {msg.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <span className="admin-table-user-name">
                              {msg.name}
                            </span>
                            <span className="admin-table-user-email">
                              {msg.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="admin-table-subject-snippet"
                          title={msg.message}
                        >
                          {msg.subject || "(No subject)"}
                        </span>
                      </td>
                      <td>
                        <span className="admin-table-date">
                          {new Date(msg.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-status-pill ${msg.read ? "read" : "unread"}`}
                        >
                          {msg.read ? "Read" : "New"}
                        </span>
                      </td>
                      <td>
                        {!msg.read ? (
                          <AdminForm
                            action={markMessageRead}
                            successMessage="Marked as read"
                          >
                            <input name="id" type="hidden" value={msg.id} />
                            <button
                              className="admin-table-action-btn"
                              type="submit"
                            >
                              Mark Read
                            </button>
                          </AdminForm>
                        ) : (
                          <span className="admin-table-checked">&mdash;</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Upcoming Events Card */}
        <section className="admin-card-section">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Upcoming Schedule</h2>
              <p className="admin-card-subtitle">
                Events and concerts on the calendar
              </p>
            </div>
            <Link className="admin-card-link" href="/admin/events">
              Manage Events &rarr;
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="admin-empty-state-mini">
              <IconEvents />
              <p>No events scheduled.</p>
            </div>
          ) : (
            <div className="admin-events-preview-list">
              {upcomingEvents.map((ev) => (
                <div className="admin-event-preview-item" key={ev.id}>
                  <div className="admin-event-date-badge">
                    <span className="month">
                      {new Date(ev.date).toLocaleDateString(undefined, {
                        month: "short",
                      })}
                    </span>
                    <span className="day">{new Date(ev.date).getDate()}</span>
                  </div>
                  <div className="admin-event-preview-content">
                    <h3 className="admin-event-preview-title">{ev.title}</h3>
                    <p className="admin-event-preview-location">
                      {ev.location}
                    </p>
                  </div>
                  <div className="admin-event-preview-meta">
                    <span
                      className={`admin-status-pill ${ev.published ? "published" : "draft"}`}
                    >
                      {ev.published ? "Live" : "Draft"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
