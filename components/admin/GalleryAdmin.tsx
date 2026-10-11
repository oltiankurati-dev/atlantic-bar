"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Span = "normal" | "wide" | "large";

interface GalleryItem {
  id: string;
  label: string;
  imageUrl: string;
  span: Span;
  order: number;
}

const BLANK: { label: string; imageUrl: string; span: Span; order: number } = {
  label: "",
  imageUrl: "",
  span: "normal",
  order: 0,
};

export default function GalleryAdmin() {
  const { t } = useLanguage();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/admin/gallery", { cache: "no-store" });
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(item: GalleryItem) {
    setEditingId(item.id);
    setForm({ label: item.label, imageUrl: item.imageUrl, span: item.span, order: item.order });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(BLANK);
  }

  async function uploadImage(file: File) {
    setUploadingImage(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", "gallery");
      const res = await fetch("/api/admin/upload-image", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.admin.gallery.errorUploadFailed);
      setForm((current) => ({ ...current, imageUrl: data.imageUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.gallery.errorUploadFailed);
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.imageUrl) {
      setError(t.admin.gallery.errorNeedImage);
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/admin/gallery/${editingId}` : "/api/admin/gallery";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error ?? t.admin.gallery.errorSaveFailed);
      }
      cancelEdit();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.gallery.errorGeneric);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t.admin.gallery.deleteConfirm)) return;
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    if (editingId === id) cancelEdit();
    await load();
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="bg-charcoal/70 border border-gold/25 p-6 md:p-8 mb-10"
      >
        <h2 className="font-display text-lg text-cream uppercase tracking-wide mb-6">
          {editingId ? t.admin.gallery.editTitle : t.admin.gallery.addTitle}
        </h2>
        <label className="block mb-5">
          <span className="text-[11px] tracking-[0.2em] uppercase text-smoke">{t.admin.gallery.labelField}</span>
          <input
            required
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder={t.admin.gallery.labelPlaceholder}
            className="mt-2 w-full bg-transparent border-b border-cream/25 focus:border-gold py-2 text-cream outline-none"
          />
        </label>

        <div className="mb-6">
          <span className="text-[11px] tracking-[0.2em] uppercase text-smoke block mb-3">{t.admin.gallery.imageField}</span>
          {form.imageUrl ? (
            <div className="relative h-40 w-full max-w-md mb-3 border border-cream/10 overflow-hidden">
              <Image src={form.imageUrl} alt="Preview" fill unoptimized className="object-cover" />
            </div>
          ) : null}
          <label className="inline-flex border border-cream/20 px-4 py-2 text-[10px] tracking-[0.16em] uppercase text-smoke hover:text-cream cursor-pointer">
            {uploadingImage ? t.admin.gallery.uploading : form.imageUrl ? t.admin.gallery.replaceImage : t.admin.gallery.uploadImage}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              disabled={uploadingImage}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) uploadImage(file);
              }}
            />
          </label>
          {!form.imageUrl && (
            <p className="mt-2 text-xs text-smoke">{t.admin.gallery.uploadHint}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-6">
          <label className="block">
            <span className="text-[11px] tracking-[0.2em] uppercase text-smoke">{t.admin.gallery.tileSize}</span>
            <select
              value={form.span}
              onChange={(e) => setForm({ ...form, span: e.target.value as Span })}
              className="mt-2 w-full bg-transparent border-b border-cream/25 focus:border-gold py-2 text-cream outline-none"
            >
              <option value="normal" className="bg-charcoal">{t.admin.gallery.sizeNormal}</option>
              <option value="wide" className="bg-charcoal">{t.admin.gallery.sizeWide}</option>
              <option value="large" className="bg-charcoal">{t.admin.gallery.sizeLarge}</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] tracking-[0.2em] uppercase text-smoke">{t.admin.gallery.order}</span>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className="mt-2 w-full bg-transparent border-b border-cream/25 focus:border-gold py-2 text-cream outline-none"
            />
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || uploadingImage}
            className="border border-gold px-8 py-3 text-xs tracking-[0.2em] uppercase text-obsidian bg-gold disabled:opacity-60"
          >
            {saving ? t.admin.gallery.save : editingId ? t.admin.gallery.saveChanges : t.admin.gallery.addTitle}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="border border-cream/20 px-8 py-3 text-xs tracking-[0.2em] uppercase text-smoke hover:text-cream"
            >
              {t.admin.gallery.cancel}
            </button>
          )}
        </div>
        {error && <p className="mt-4 text-xs text-red-400">{error}</p>}
      </form>

      {loading ? (
        <p className="text-smoke text-sm">{t.admin.gallery.loading}</p>
      ) : items.length === 0 ? (
        <p className="text-smoke text-sm">{t.admin.gallery.empty}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div key={item.id} className="border border-gold/20 bg-charcoal/50">
              <div className="relative h-40 w-full">
                <Image src={item.imageUrl} alt={item.label} fill unoptimized className="object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-cream text-sm font-medium">{item.label}</h3>
                <p className="text-smoke text-xs mt-1 capitalize">{item.span}</p>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-xs text-gold-bright hover:text-cream"
                  >
                    {t.admin.gallery.edit}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    {t.admin.gallery.delete}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}