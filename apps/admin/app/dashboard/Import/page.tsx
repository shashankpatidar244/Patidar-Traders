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

type CsvRow = Record<string, string>;

// ================= REQUIRED FIELDS =================


const CSV_FIELDS: Record<DataType, string[]> = {
  User: [
    "username",
    "phone",
    "password",
    "role",
    "isverified",
    "isblocked",
  ],

  AdminLog: [
    "action",
    "entity",
    "entityid",
  ],

  Brand: [
    "brandname",
  ],
  
  Category: [
    "categoryname",
  ],


  Product: [
    "name",
    "description",
    "technicalname",
    "brandid",
    "categoryid",
    "isactive",
  ],

  ProductVariant: [
    "productid",
    "name",
    "value",
    "mrp",
    "sellingprice",
    "stock",
    "unit",
  ],

  ProductImage: [
    "productid",
    "url",
  ],

  InventoryLog: [
    "variantid",
    "oldstock",
    "newstock",
    "action",
    "adminid",
  ],

  Order: [
    "userid",
    "total",
    "status",
    "paymentmethod",
    "paymentstatus",
    "razorpayorderid",
    "razorpaypaymentid",
    "razorpaysignature",
    "paidat",
    "expiresat",
    "deliverystatus",
    "trackingid",
    "shippingname",
    "shippingphone",
    "shippingline1",
    "shippingline2",
    "shippingcity",
    "shippingstate",
    "shippingpincode",
  ],

  OrderItem: [
    "orderid",
    "productid",
    "variantid",
    "quantity",
    "price",
  ],

  CartItem: [
    "userid",
    "productid",
    "variantid",
    "quantity",
  ],

  WishlistItem: [
    "userid",
    "productid",
    "variantid",
  ],

  Address: [
    "userid",
    "fullname",
    "phone",
    "line1",
    "line2",
    "city",
    "state",
    "pincode",
    "isdefault",
  ],
};

// ================= VALIDATION =================
const validateCsvType = (
  row: Record<string, unknown>,
  type: DataType
) => {
  const keys = Object.keys(row).map((k) =>
    k.trim().toLowerCase()
  );

  const required = CSV_FIELDS[type].map((f) =>
    f.toLowerCase()
  );

  const validFields = CSV_FIELDS[type].map((f) =>
    f.toLowerCase()
  );

  const hasAllRequired = required.every((field) =>
    keys.includes(field)
  );

  if (!hasAllRequired) {
    return false;
  }

  const invalidFields = keys.filter(
    (key) => !validFields.includes(key)
  );

  if (invalidFields.length > 0) {
    return false;
  }

  return true;
};
// ================= COMPONENT =================
export default function CsvImport() {
  // ================= STATES =================
  const [file, setFile] = useState<File | null>(null);

  const [type, setType] = useState<DataType>("User");

  const [loading, setLoading] = useState(false);

  const [dragActive, setDragActive] = useState(false);

  const [previewData, setPreviewData] = useState<CsvRow[]>([]);

  const [errors, setErrors] = useState<string[]>([]);

  const [summary, setSummary] = useState({
    success: 0,
    failed: 0,
    total: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // ================= RESET =================
  const resetState = () => {
    setFile(null);

    setPreviewData([]);

    setErrors([]);

    setSummary({
      success: 0,
      failed: 0,
      total: 0,
    });

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // ================= PARSE FILE =================
  const parseFile = (selectedFile: File) => {
    // ================= FILE TYPE CHECK =================
    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      toast.error("Only CSV files allowed ❌");
      return;
    }

    setFile(selectedFile);

    setErrors([]);

    setSummary({
      success: 0,
      failed: 0,
      total: 0,
    });

    // ================= VALIDATE FIRST ROW =================
    Papa.parse(selectedFile, {
      header: true,

      skipEmptyLines: true,

      dynamicTyping: false,

      worker: true,

      preview: 1,

      complete: (res) => {
        const firstRow = res.data?.[0] as
          | Record<string, unknown>
          | undefined;

        // ================= EMPTY CSV =================
        if (!firstRow) {
          toast.error("Empty CSV file ❌");

          resetState();

          return;
        }

        // ================= INVALID CSV TYPE =================
        if (!validateCsvType(firstRow, type)) {
          toast.error("Wrong file type selected ❌");

          setErrors([
            `Invalid CSV for "${type}"`,
            `Expected columns: ${CSV_FIELDS[type].join(", ")}`,
            `Found columns: ${Object.keys(firstRow).join(", ")}`,
          ]);

          setFile(null);

          setPreviewData([]);

          return;
        }

        // ================= LOAD PREVIEW =================
        Papa.parse(selectedFile, {
          header: true,

          skipEmptyLines: true,

          dynamicTyping: false,

          worker: true,

          preview: 10,

          complete: (previewRes) => {
            setPreviewData(
              (previewRes.data as CsvRow[]) || []
            );

            toast.success("CSV loaded successfully ✅");
          },

          error: () => {
            toast.error("CSV preview failed ❌");
          },
        });
      },

      error: () => {
        toast.error("CSV parsing failed ❌");

        resetState();
      },
    });
  };

  // ================= UPLOAD =================
  const handleUpload = async () => {
    if (!file) {
      return toast.error("Please select a CSV file");
    }

    setLoading(true);

    Papa.parse(file, {
      header: true,

      skipEmptyLines: true,

      dynamicTyping: false,

      worker: true,

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

          // ================= HTTP ERROR =================
          if (!response.ok) {
            throw new Error("Import request failed");
          }

          const data = await response.json();

          // ================= SUMMARY =================
          setSummary({
            success: data.success || 0,
            failed: data.failed || 0,
            total: data.total || 0,
          });

          // ================= ERRORS =================
          if (
            data.errors &&
            Array.isArray(data.errors)
          ) {
            setErrors(
              data.errors.map(
                (e: {
                  row: number;
                  error: string;
                }) => `Row ${e.row}: ${e.error}`
              )
            );
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

  // ================= UI =================
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          CSV Import
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Upload CSV files to bulk import data into your
          system
        </p>
      </div>

      {/* ================= TYPE SELECT ================= */}
      <div className="bg-white dark:bg-gray-800 border rounded-xl p-4 shadow-sm">
        <label className="text-sm font-medium text-gray-600">
          Select Data Type
        </label>

        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as DataType);

            resetState();
          }}
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
        {/* ================= IMPORT BUTTON ================= */}
        <button
          onClick={handleUpload}
          disabled={
            loading || previewData.length === 0
          }
          className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <UploadCloud size={18} />

          {loading ? "Importing..." : "Start Import"}
        </button>

        {/* ================= RESET BUTTON ================= */}
        <button
          onClick={resetState}
          className="flex items-center justify-center gap-2 w-full bg-gray-200 dark:bg-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 active:scale-95 transition"
        >
          <RefreshCcw size={16} />

          Reset
        </button>
      </div>
    </div>
  );
}