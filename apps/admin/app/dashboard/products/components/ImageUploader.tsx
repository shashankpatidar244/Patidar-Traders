"use client"

import { useState } from "react"
import Image from "next/image"

export default function ImageUploader({ images, setImages }: any) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [viewer, setViewer] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ [key: number]: number }>({})

  /* ================= UPLOAD ================= */

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return

    setLoading(true)

    const fileArray = Array.from(files)

    const previewUrls = fileArray.map((file) =>
      URL.createObjectURL(file)
    )
    setPreview(previewUrls)

    try {
      const uploadedUrls: string[] = []

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        if (!file) continue

        const formData = new FormData()
        formData.append("file", file)

        setProgress((p) => ({ ...p, [i]: 20 }))

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        setProgress((p) => ({ ...p, [i]: 80 }))

        const data = await res.json()

        if (!res.ok || !data.url) throw new Error("Upload failed")

        uploadedUrls.push(data.url)

        setProgress((p) => ({ ...p, [i]: 100 }))
      }

      setImages((prev: string[]) => [...prev, ...uploadedUrls])
      setPreview([])
      setProgress({})
    } catch (err) {
      console.error(err)
      alert("Upload failed ❌")
    } finally {
      setLoading(false)
    }
  }

  /* ================= REMOVE ================= */

  function removeImage(index: number) {
    setImages((prev: string[]) =>
      prev.filter((_: any, i: number) => i !== index)
    )
  }

  /* ================= DRAG ================= */

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragEnter(index: number) {
    if (dragIndex === null || dragIndex === index) return

    const updated = [...images]
    const item = updated[dragIndex]

    updated.splice(dragIndex, 1)
    updated.splice(index, 0, item)

    setDragIndex(index)
    setImages(updated)
  }

  function handleDragEnd() {
    setDragIndex(null)
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div>
        <p className="text-sm text-gray-500">
          Upload multiple images. Drag to reorder. First image = thumbnail.
        </p>
      </div>

      {/* UPLOAD AREA */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-500 transition bg-white"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleUpload(e.dataTransfer.files)
        }}
      >
        <p className="text-gray-600 mb-2">
          Drag & drop images here
        </p>

        <p className="text-sm text-gray-400 mb-4">
          PNG, JPG up to 5MB
        </p>

        <label className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700">
          Upload Images
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
        </label>

        {loading && (
          <p className="text-blue-600 text-sm mt-3">
            Uploading...
          </p>
        )}
      </div>

      {/* PREVIEW */}
      {preview.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-2">
            Uploading Preview
          </p>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {preview.map((img, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden">
                <img
                  src={img}
                  className="w-full h-24 object-cover opacity-70"
                />

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className="h-1 bg-blue-600 transition-all"
                    style={{ width: `${progress[i] || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FINAL IMAGES */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {images.map((img: string, i: number) => (
          <div
            key={i}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragEnter={() => handleDragEnter(i)}
            onDragEnd={handleDragEnd}
            className={`relative group rounded-xl overflow-hidden border bg-white cursor-move shadow-sm hover:shadow-md transition ${
              dragIndex === i ? "opacity-50 scale-95" : ""
            }`}
          >
            <Image
              src={img}
              alt="product"
              width={200}
              height={200}
              className="w-full h-28 object-cover"
              onClick={() => setViewer(img)}
            />

            {/* PRIMARY BADGE */}
            {i === 0 && (
              <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                Thumbnail
              </span>
            )}

            {/* HOVER ACTIONS */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-2 transition">
              <button
                onClick={() => setViewer(img)}
                className="bg-white px-3 py-1 text-xs rounded"
              >
                View
              </button>

              <button
                onClick={() => removeImage(i)}
                className="bg-red-500 text-white px-3 py-1 text-xs rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {images.length === 0 && !preview.length && (
        <p className="text-sm text-gray-400 text-center">
          No images uploaded yet
        </p>
      )}

      {/* IMAGE VIEWER */}
      {viewer && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setViewer(null)}
        >
          <img
            src={viewer}
            className="max-h-[90%] max-w-[90%] rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  )
}