"use client";

import { useState, useEffect } from "react";
import VariantManager from "./VariantManager";
import ImageUploader from "./ImageUploader";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

/* ================= MAIN COMPONENT ================= */

export default function ProductForm({ product }: any) {
  /* ================= STATE ================= */

  const [name, setName] = useState(product?.name || "");
  const [technicalName, setTechnicalName] = useState(
    product?.technicalName || ""
  );
  const [categoryId, setCategoryId] = useState(product?.categoryId || "");
  const [brandId, setBrandId] = useState(product?.brandId || "");
  const [description, setDescription] = useState(product?.description || "");

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [variants, setVariants] = useState(product?.variants || []);
  const [images, setImages] = useState(
    product?.images?.map((i: any) => i.url) || []
  );

  const [loading, setLoading] = useState(false);

  function ToolbarButton({ children, onClick, active }: any) {
    return (
      <button
        onClick={onClick}
        className={`px-3 py-1 rounded-md text-sm border 
          ${active ? "bg-black text-white" : "bg-white hover:bg-gray-100"}`}
      >
        {children}
      </button>
    );
  }

  /* ================= EDITOR ================= */

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setDescription(editor.getHTML());
    },
  });

  // ✅ Load existing description safely (NO LOOP)
  useEffect(() => {
    if (editor && description) {
      editor.commands.setContent(description);
    }
  }, [editor]);

  /* ================= FETCH CATEGORY & BRAND ================= */

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch("/api/products/category"),
          fetch("/api/products/brand"),
        ]);

        const cats = await catRes.json();
        const brs = await brandRes.json();

        setCategories(cats);
        setBrands(brs);
      } catch (err) {
        console.error("Failed to load categories/brands", err);
      }
    }

    fetchData();
  }, []);

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!name.trim()) return alert("Product name required");

    setLoading(true);

    const res = await fetch("/api/products", {
      method: product ? "PATCH" : "POST",
      body: JSON.stringify({
        name: name.trim(),
        technicalName: technicalName.trim(),
        categoryId: categoryId ? Number(categoryId) : null,
        brandId: brandId ? Number(brandId) : null,
        description,
        variants,
        images,
      }),
    });

    setLoading(false);

    if (res.ok) alert("✅ Product Saved");
    else alert("❌ Failed");
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">
          {product ? "Edit Product" : "Create Product"}
        </h2>
        <p className="text-sm opacity-90">
          Manage product details, pricing and images
        </p>
      </div>

      {/* PRODUCT INFO */}
      <Section title="Product Information">
        <div className="grid md:grid-cols-2 gap-6">

          <Field label="Title">
            <Input value={name} onChange={setName} placeholder="Enter Product Name" />
          </Field>

          <Field label="Technical Name">
            <Input value={technicalName} onChange={setTechnicalName} placeholder="Enter SKU / Technical Name" />
          </Field>

          <Field label="Category">
            <SelectWithAdd
              label="Category"
              value={categoryId}
              onChange={setCategoryId}
              options={categories}
              setOptions={setCategories}
              endpoint="/api/category"
            />
          </Field>

          <Field label="Brand">
            <SelectWithAdd
              label="Brand"
              value={brandId}
              onChange={setBrandId}
              options={brands}
              setOptions={setBrands}
              endpoint="/api/products/brand"
            />
          </Field>

        </div>
      </Section>

      {/* DESCRIPTION (PRO EDITOR) */}

<Section title="Product Description">

  {/* TOOLBAR */}
  <div className="flex flex-wrap gap-2 border border-gray-300 rounded-t-xl p-2 bg-gray-50">

    <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")}>
      B
    </ToolbarButton>

    <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")}>
      I
    </ToolbarButton>

    <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>
      H1
    </ToolbarButton>

    <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
      H2
    </ToolbarButton>

    <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()}>
      • List
    </ToolbarButton>

    <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
      1. List
    </ToolbarButton>

  </div>

  {/* EDITOR */}
  <div className="border border-t-0 border-gray-300 rounded-b-xl bg-white min-h-[250px] p-4">
    <EditorContent editor={editor} />
  </div>

</Section>

      {/* VARIANTS */}
      <Section title="Product Variants">
        <VariantManager variants={variants} setVariants={setVariants} />
      </Section>

      {/* IMAGES */}
      <Section title="Product Images">
        <ImageUploader images={images} setImages={setImages} />
      </Section>

      {/* FOOTER */}
      <div className="flex justify-between items-center pt-6">
        <p className="text-sm text-gray-500">
          Make sure all fields are correct before saving
        </p>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg shadow hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </div>

    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function Section({ title, children }: any) {
  return (
    <div className="bg-gray-100 rounded-2xl p-6 space-y-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <div>
      <label className="block text-sm mb-2">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }: any) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black"
    />
  );
}

/* ================= TOOLBAR BUTTON ================= */

function ToolbarButton({ children, onClick, active }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded border text-sm ${
        active ? "bg-black text-white" : "bg-white hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

/* ================= SELECT WITH MODAL ================= */

function SelectWithAdd({
  value,
  onChange,
  options,
  setOptions,
  endpoint,
  label,
}: any) {
  const [open, setOpen] = useState(false);

  async function handleCreate(name: string) {
    const res = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (res.ok) {
      setOptions((prev: any) => [...prev, data]);
      onChange(data.id);
    } else {
      alert(data.error || "Failed");
    }
  }

  return (
    <>
      <div className="flex border-2 border-gray-300 rounded-xl overflow-hidden">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-3 bg-white outline-none"
        >
          <option value="">Select</option>
          {options.map((o: any) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setOpen(true)}
          className="px-4 border-l bg-white hover:bg-gray-50 font-bold"
        >
          +
        </button>
      </div>

      <AddModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleCreate}
        title={label}
      />
    </>
  );
}

/* ================= MODAL ================= */

function AddModal({ open, onClose, onSave, title }: any) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSave() {
    if (!name.trim()) return;

    setLoading(true);
    await onSave(name.trim());
    setLoading(false);
    setName("");
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">

        <h3 className="text-lg font-semibold">Add {title}</h3>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Enter ${title} name`}
          className="w-full border-2 border-gray-300 rounded-xl px-4 py-2 outline-none focus:border-black"
        />

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-500">
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

      </div>
    </div>
  );
}