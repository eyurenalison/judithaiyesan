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
      description="Update the global site identity and contact details."
      title="Site Settings"
    >
      <AdminForm
        action={saveSettings}
        className="admin-form"
        successMessage="Settings saved successfully!"
      >
        <input name="id" type="hidden" value={settings?.id ?? ""} />
        <label>
          Site name
          <input
            name="siteName"
            required
            defaultValue={settings?.siteName ?? fallbackSettings.siteName}
          />
        </label>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput renders input natively */}
        <label>
          Logo URL
          <ImageUploadInput
            name="logoSrc"
            required
            defaultValue={settings?.logoSrc ?? fallbackSettings.logoSrc}
          />
        </label>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput renders input natively */}
        <label>
          Favicon URL
          <ImageUploadInput
            name="faviconSrc"
            required
            defaultValue={settings?.faviconSrc ?? fallbackSettings.faviconSrc}
          />
        </label>
        <label>
          Email
          <input
            name="contactEmail"
            required
            type="email"
            defaultValue={
              settings?.contactEmail ?? fallbackSettings.contactEmail
            }
          />
        </label>
        <label>
          Phone
          <input
            name="contactPhone"
            required
            defaultValue={
              settings?.contactPhone ?? fallbackSettings.contactPhone
            }
          />
        </label>
        <label>
          Address
          <textarea
            name="contactAddress"
            required
            defaultValue={
              settings?.contactAddress ?? fallbackSettings.contactAddress
            }
          />
        </label>
        <label>
          Facebook URL
          <input
            name="facebookUrl"
            defaultValue={settings?.facebookUrl ?? ""}
          />
        </label>
        <label>
          Instagram URL
          <input
            name="instagramUrl"
            defaultValue={settings?.instagramUrl ?? ""}
          />
        </label>
        <button className="primary-button" type="submit">
          Save Settings
        </button>
      </AdminForm>
    </AdminShell>
  );
}
