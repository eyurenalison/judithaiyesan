import { getPrisma } from "../../lib/db";
import { createHeroSlide, deleteHeroSlide, updateHeroSlide } from "../actions";
import { AdminForm } from "../admin-form";
import { AdminShell } from "../admin-shell";
import { requireAdmin } from "../guard";
import { ImageUploadInput } from "../image-upload-input";

export default async function AdminHeroSlidesPage() {
  await requireAdmin();
  const slides = await getPrisma().heroSlide.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <AdminShell
      description="Create, publish, unpublish, and reorder homepage carousel slides."
      title="Hero Slides"
    >
      <AdminForm
        action={createHeroSlide}
        className="admin-form compact"
        resetOnSuccess
        successMessage="Slide created successfully!"
      >
        <h2>New Slide</h2>
        <label>
          Title
          <input name="title" required />
        </label>
        <label>
          Subtitle
          <input name="subtitle" />
        </label>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput renders input natively */}
        <label>
          Image URL
          <ImageUploadInput name="imageSrc" required />
        </label>
        <label>
          Button label
          <input name="buttonLabel" />
        </label>
        <label>
          Button URL
          <input name="buttonUrl" />
        </label>
        <label>
          Order
          <input name="order" type="number" defaultValue="0" />
        </label>
        <label className="checkbox-row">
          <input name="published" type="checkbox" defaultChecked /> Published
        </label>
        <button className="primary-button" type="submit">
          Create Slide
        </button>
      </AdminForm>

      <div className="admin-list">
        {slides.map((slide) => (
          <article className="admin-item" key={slide.id}>
            <AdminForm
              action={updateHeroSlide}
              className="admin-form compact"
              successMessage="Slide saved successfully!"
            >
              <input name="id" type="hidden" value={slide.id} />
              <label>
                Title
                <input name="title" required defaultValue={slide.title} />
              </label>
              <label>
                Subtitle
                <input name="subtitle" defaultValue={slide.subtitle ?? ""} />
              </label>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput renders input natively */}
              <label>
                Image URL
                <ImageUploadInput
                  name="imageSrc"
                  required
                  defaultValue={slide.imageSrc}
                />
              </label>
              <label>
                Button label
                <input
                  name="buttonLabel"
                  defaultValue={slide.buttonLabel ?? ""}
                />
              </label>
              <label>
                Button URL
                <input name="buttonUrl" defaultValue={slide.buttonUrl ?? ""} />
              </label>
              <label>
                Order
                <input name="order" type="number" defaultValue={slide.order} />
              </label>
              <label className="checkbox-row">
                <input
                  name="published"
                  type="checkbox"
                  defaultChecked={slide.published}
                />{" "}
                Published
              </label>
              <button className="primary-button" type="submit">
                Save Slide
              </button>
            </AdminForm>
            <AdminForm action={deleteHeroSlide} successMessage="Slide deleted.">
              <input name="id" type="hidden" value={slide.id} />
              <button className="danger-button" type="submit">
                Delete
              </button>
            </AdminForm>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
