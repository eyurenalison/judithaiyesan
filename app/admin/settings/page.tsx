import { siteSettings as fallbackSettings } from "../../lib/content/seed-content";
import { getPrisma } from "../../lib/db";
import { saveSettings } from "../actions";
import { AdminForm } from "../admin-form";
import { AdminShell } from "../admin-shell";
import { requireAdmin } from "../guard";
import { ImageUploadInput } from "../image-upload-input";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const prisma = getPrisma();
  const settings = await prisma.siteSettings.findFirst();

  return (
    <AdminShell
      description="Configure global branding, official contact details, and social media links."
      title="Site Settings"
    >
      <AdminForm
        action={saveSettings}
        className="admin-settings-container"
        successMessage="Settings saved successfully!"
      >
        <input name="id" type="hidden" value={settings?.id ?? ""} />

        {/* Brand & Identity Card */}
        <section className="admin-card-section">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Brand Identity</h2>
              <p className="admin-card-subtitle">
                Public name, header logo, and browser favicon
              </p>
            </div>
          </div>
          <div className="admin-card-body">
            <label className="admin-form-label">
              <span>Site Name *</span>
              <input
                defaultValue={settings?.siteName ?? fallbackSettings.siteName}
                name="siteName"
                required
                type="text"
              />
            </label>

            <div className="admin-form-grid-2">
              {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput renders internal input */}
              <label className="admin-form-label">
                <span>Header Logo *</span>
                <ImageUploadInput
                  defaultValue={settings?.logoSrc ?? fallbackSettings.logoSrc}
                  name="logoSrc"
                  required
                />
              </label>

              {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput renders internal input */}
              <label className="admin-form-label">
                <span>Browser Favicon *</span>
                <ImageUploadInput
                  defaultValue={
                    settings?.faviconSrc ?? fallbackSettings.faviconSrc
                  }
                  name="faviconSrc"
                  required
                />
              </label>
            </div>
          </div>
        </section>

        {/* Contact Details Card */}
        <section className="admin-card-section">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">
                Contact & Booking Information
              </h2>
              <p className="admin-card-subtitle">
                Displayed across footer, booking forms, and header
              </p>
            </div>
          </div>
          <div className="admin-card-body">
            <div className="admin-form-grid-2">
              <label className="admin-form-label">
                <span>Official Contact Email *</span>
                <input
                  defaultValue={
                    settings?.contactEmail ?? fallbackSettings.contactEmail
                  }
                  name="contactEmail"
                  required
                  type="email"
                />
              </label>
              <label className="admin-form-label">
                <span>Booking Phone Number *</span>
                <input
                  defaultValue={
                    settings?.contactPhone ?? fallbackSettings.contactPhone
                  }
                  name="contactPhone"
                  required
                  type="text"
                />
              </label>
            </div>

            <label className="admin-form-label">
              <span>Physical Contact Address *</span>
              <textarea
                defaultValue={
                  settings?.contactAddress ?? fallbackSettings.contactAddress
                }
                name="contactAddress"
                required
                rows={3}
              />
            </label>
          </div>
        </section>

        {/* Social Media Card */}
        <section className="admin-card-section">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Social Media Links</h2>
              <p className="admin-card-subtitle">
                Connect your audience to official channels
              </p>
            </div>
          </div>
          <div className="admin-card-body">
            <div className="admin-form-grid-2">
              <label className="admin-form-label">
                <span>Facebook Profile URL</span>
                <input
                  defaultValue={settings?.facebookUrl ?? ""}
                  name="facebookUrl"
                  placeholder="https://facebook.com/..."
                  type="url"
                />
              </label>
              <label className="admin-form-label">
                <span>Instagram Profile URL</span>
                <input
                  defaultValue={settings?.instagramUrl ?? ""}
                  name="instagramUrl"
                  placeholder="https://instagram.com/..."
                  type="url"
                />
              </label>
            </div>
          </div>
        </section>

        {/* Save Bar */}
        <div className="admin-settings-save-bar">
          <p className="admin-save-hint">
            Changes will be revalidated across all public pages immediately.
          </p>
          <button className="primary-button" type="submit">
            Save All Settings
          </button>
        </div>
      </AdminForm>
    </AdminShell>
  );
}
