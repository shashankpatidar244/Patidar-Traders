"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { toast } from "react-hot-toast";
import { UploadCloud, RefreshCcw } from "lucide-react";

import SampleCsvDownloader from "./components/SampleCsvDownloader";
import FileDropZone from "./components/FileDropZone";
import CsvPreviewTable from "./components/CsvPreviewTable";
import ErrorBox from "./components/ErrorBox";
import ImportSummary from "./components/ImportSummary";

// ================= DATA TYPES =================
const DATA_TYPES = [
  "User",
  "AdminLog",
  "Brand",
  "Product",
  "ProductVariant",
  "ProductImage",
  "Category",
  "InventoryLog",
  "Order",
  "OrderItem",
  "CartItem",
  "WishlistItem",
  "Address",
] as const;

type DataType = (typeof DATA_TYPES)[number];

// ================= REQUIRED FIELDS =================
const REQUIRED_FIELDS: Record<DataType, string[]> = {
  User: ["phone"],
  AdminLog: ["action", "entity", "entityid"],
  Brand: ["name"],
  Product: ["name"],
  ProductVariant: ["productid", "name", "value"],
  ProductImage: ["url", "productid"],
  Category: ["name"],
  InventoryLog: ["variantid", "oldstock", "newstock", "action"],
  Order: [
    "userid",
    "total",

    "shippingname",
    "shippingphone",

    "shippingline1",

    "shippingcity",
    "shippingstate",
    "shippingpincode",
  ],
  OrderItem: ["orderid", "productid", "quantity", "price"],
  CartItem: ["userid", "productid"],
  WishlistItem: ["userid", "productid", "variantid"],
  Address: ["userid", "fullname", "phone", "line1", "city", "state", "pincode"],
};

// ================= VALIDATION =================
const validateCsvType = (row: Record<string, unknown>, type: DataType) => {
  const required = REQUIRED_FIELDS[type];

  // convert all CSV columns to lowercase
  const keys = Object.keys(row).map((k) => k.trim().toLowerCase());

  // check all required fields exist
  return required.every((field) => keys.includes(field.toLowerCase()));
};

// ================= COMPONENT =================
export default function CsvImport() {
  // ================= STATES =================
  const [file, setFile] = useState<File | null>(null);

  const [type, setType] = useState<DataType>("User");

  const [loading, setLoading] = useState(false);

  const [dragActive, setDragActive] = useState(false);

  const [previewData, setPreviewData] = useState<any[]>([]);

  const [errors, setErrors] = useState<string[]>([]);

  const [summary, setSummary] = useState({
    success: 0,
    failed: 0,
    total: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // ================= PARSE FILE =================
  const parseFile = (file: File) => {
    setFile(file);

    // reset
    setErrors([]);

    setSummary({
      success: 0,
      failed: 0,
      total: 0,
    });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,

      // only first row for validation
      preview: 1,

      complete: (res) => {
        const firstRow = res.data?.[0] as Record<string, unknown> | undefined;

        // ================= EMPTY CSV =================
        if (!firstRow) {
          toast.error("Empty CSV file ❌");

          setFile(null);

          return;
        }

        // ================= INVALID TYPE =================
        if (!validateCsvType(firstRow, type)) {
          toast.error("Wrong file type selected ❌");

          setErrors([
            `Invalid CSV for "${type}"`,
            `Expected columns: ${REQUIRED_FIELDS[type].join(", ")}`,
            `Found columns: ${Object.keys(firstRow).join(", ")}`,
          ]);

          setFile(null);

          setPreviewData([]);

          return;
        }

        // ================= LOAD PREVIEW =================
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,

          // first 10 rows
          preview: 10,

          complete: (res) => {
            setPreviewData((res.data as any[]) || []);

            toast.success("CSV loaded successfully ✅");
          },

          error: () => {
            toast.error("CSV parsing failed ❌");
          },
        });
      },

      error: () => {
        toast.error("CSV parsing failed ❌");
      },
    });
  };

  // ================= UPLOAD =================
  const handleUpload = async () => {
    if (!file) {
      return toast.error("Please select a file");
    }

    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,

      complete: async (res) => {
        try {
          const response = await fetch("/api/csv-import", {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              type,
              data: res.data,
            }),
          });

          const data = await response.json();

          // ================= SUMMARY =================
          setSummary({
            success: data.success || 0,
            failed: data.failed || 0,
            total: data.total || 0,
          });

          // ================= ERRORS =================
          if (data.errors && Array.isArray(data.errors)) {
            setErrors(data.errors.map((e: any) => `Row ${e.row}: ${e.error}`));
          } else {
            setErrors([]);
          }

          // ================= TOAST =================
          if (data.success > 0) {
            toast.success("Import completed 🎉");
          } else {
            toast.error("Import failed ❌");
          }
        } catch (error) {
          console.error(error);

          toast.error("Something went wrong ❌");
        } finally {
          setLoading(false);
        }
      },

      error: () => {
        toast.error("CSV parsing failed ❌");

        setLoading(false);
      },
    });
  };

  // ================= RESET =================
  const handleReset = () => {
    setFile(null);

    setPreviewData([]);

    setErrors([]);

    setSummary({
      success: 0,
      failed: 0,
      total: 0,
    });
  };

  // ================= UI =================
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          CSV Import
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Upload CSV files to bulk import data into your system
        </p>
      </div>

      {/* ================= TYPE SELECT ================= */}
      <div className="bg-white dark:bg-gray-800 border rounded-xl p-4 shadow-sm">
        <label className="text-sm font-medium text-gray-600">
          Select Data Type
        </label>

        <select
          value={type}
          onChange={(e) => setType(e.target.value as DataType)}
          className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {DATA_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* ================= SAMPLE CSV ================= */}
      <SampleCsvDownloader type={type} />

      {/* ================= FILE DROP ================= */}
      <FileDropZone
        file={file}
        inputRef={inputRef}
        dragActive={dragActive}
        setDragActive={setDragActive}
        onFileSelect={parseFile}
      />

      {/* ================= PREVIEW ================= */}
      {previewData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold mb-3 text-gray-700">
            CSV Preview (First 10 rows)
          </h2>

          <CsvPreviewTable data={previewData} />
        </div>
      )}

      {/* ================= SUMMARY ================= */}
      <ImportSummary summary={summary} />

      {/* ================= ERRORS ================= */}
      <ErrorBox errors={errors} />

      {/* ================= ACTIONS ================= */}
      <div className="flex gap-3">
        {/* IMPORT BUTTON */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 active:scale-95 transition disabled:opacity-60"
        >
          <UploadCloud size={18} />

          {loading ? "Importing..." : "Start Import"}
        </button>

        {/* RESET BUTTON */}
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 w-full bg-gray-200 dark:bg-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 active:scale-95 transition"
        >
          <RefreshCcw size={16} />
          Reset
        </button>
      </div>
    </div>
  );
}
