import { getPrisma } from "../../lib/db";
import {
  attachGalleryItem,
  createEvent,
  deleteEvent,
  removeGalleryItem,
  updateEvent,
} from "../actions";
import { AdminForm } from "../admin-form";
import { AdminShell } from "../admin-shell";
import { requireAdmin } from "../guard";
import { ImageUploadInput } from "../image-upload-input";

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 16);
}

export default async function AdminEventsPage() {
  await requireAdmin();
  const prisma = getPrisma();
  const [events, media] = await Promise.all([
    prisma.event.findMany({
      include: {
        galleryItems: {
          include: { media: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { date: "desc" },
    }),
    prisma.media.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <AdminShell
      description="Manage events, publishing status, and event galleries."
      title="Events"
    >
      <AdminForm
        action={createEvent}
        className="admin-form compact"
        resetOnSuccess
        successMessage="Event created successfully!"
      >
        <h2>New Event</h2>
        <label>
          Title
          <input name="title" required />
        </label>
        <label>
          Date
          <input name="date" required type="datetime-local" />
        </label>
        <label>
          Display date
          <input
            name="displayDate"
            required
            placeholder="March 29, 2026 at 4:00 PM"
          />
        </label>
        <label>
          Location
          <input name="location" required />
        </label>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput renders input natively */}
        <label>
          Cover image URL
          <ImageUploadInput name="coverImageSrc" required />
        </label>
        <label>
          Status
          <select name="status" defaultValue="upcoming">
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </label>
        <label>
          Description
          <textarea name="description" required rows={5} />
        </label>
        <label className="checkbox-row">
          <input name="published" type="checkbox" defaultChecked /> Published
        </label>
        <button className="primary-button" type="submit">
          Create Event
        </button>
      </AdminForm>

      <div className="admin-list">
        {events.map((event) => (
          <article className="admin-item" key={event.id}>
            <AdminForm
              action={updateEvent}
              className="admin-form compact"
              successMessage="Event saved successfully!"
            >
              <input name="id" type="hidden" value={event.id} />
              <label>
                Title
                <input name="title" required defaultValue={event.title} />
              </label>
              <label>
                Date
                <input
                  name="date"
                  required
                  type="datetime-local"
                  defaultValue={dateInputValue(event.date)}
                />
              </label>
              <label>
                Display date
                <input
                  name="displayDate"
                  required
                  defaultValue={event.displayDate}
                />
              </label>
              <label>
                Location
                <input name="location" required defaultValue={event.location} />
              </label>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput renders input natively */}
              <label>
                Cover image URL
                <ImageUploadInput
                  name="coverImageSrc"
                  required
                  defaultValue={event.coverImageSrc}
                />
              </label>
              <label>
                Status
                <select name="status" defaultValue={event.status}>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </label>
              <label>
                Description
                <textarea
                  name="description"
                  required
                  rows={5}
                  defaultValue={event.description}
                />
              </label>
              <label className="checkbox-row">
                <input
                  name="published"
                  type="checkbox"
                  defaultChecked={event.published}
                />{" "}
                Published
              </label>
              <button className="primary-button" type="submit">
                Save Event
              </button>
            </AdminForm>

            <div className="gallery-admin">
              <h3>Gallery</h3>
              <AdminForm
                action={attachGalleryItem}
                className="inline-form"
                resetOnSuccess
                successMessage="Image attached to gallery!"
              >
                <input name="eventId" type="hidden" value={event.id} />
                <select name="mediaId" required>
                  <option value="">Select media</option>
                  {media.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.filename ?? item.url}
                    </option>
                  ))}
                </select>
                <input name="caption" placeholder="Caption" />
                <input name="order" type="number" defaultValue="0" />
                <button className="secondary-button" type="submit">
                  Attach
                </button>
              </AdminForm>
              <div className="gallery-admin-list">
                {event.galleryItems.map((item) => (
                  <AdminForm
                    action={removeGalleryItem}
                    className="inline-form"
                    key={item.id}
                    successMessage="Gallery item removed."
                  >
                    <input name="id" type="hidden" value={item.id} />
                    <span>{item.media.filename ?? item.media.url}</span>
                    <button className="danger-button" type="submit">
                      Remove
                    </button>
                  </AdminForm>
                ))}
              </div>
            </div>

            <AdminForm action={deleteEvent} successMessage="Event deleted.">
              <input name="id" type="hidden" value={event.id} />
              <button className="danger-button" type="submit">
                Delete Event
              </button>
            </AdminForm>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
