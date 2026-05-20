"use client";

import { UploadCloud } from "lucide-react";
import { DragEvent, RefObject } from "react";

type Props = {
  file: File | null;
  inputRef: RefObject<HTMLInputElement | null>;
  dragActive: boolean;
  setDragActive: (v: boolean) => void;
  onFileSelect: (file: File) => void;
};

export default function FileDropZone({
  file,
  inputRef,
  dragActive,
  setDragActive,
  onFileSelect,
}: Props) {
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (["dragenter", "dragover"].includes(e.type)) {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition ${
        dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) =>
          e.target.files?.[0] && onFileSelect(e.target.files[0])
        }
      />
      <UploadCloud className="mx-auto mb-2" />
      <p>{file ? file.name : "Drag & Drop CSV or Click"}</p>
    </div>
  );
}