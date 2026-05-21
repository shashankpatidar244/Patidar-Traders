"use client";

import Papa from "papaparse";
import { Download, FileText } from "lucide-react";

// ================= TYPES =================
export type DataType =
  | "User"
  | "AdminLog"
  | "Brand"
  | "Product"
  | "ProductVariant"
  | "ProductImage"
  | "Category"
  | "InventoryLog"
  | "Order"
  | "OrderItem"
  | "CartItem"
  | "WishlistItem"
  | "Address";

type Props = {
  type: DataType;
};

// ================= HEADERS =================
const SAMPLE_HEADERS: Record<DataType, string[]> = {
  User: ["username", "phone", "password", "role", "isverified", "isblocked"],
  AdminLog: ["action", "entity", "entityid"],
  Brand: ["brandname"],
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
    "unit",
    "mrp",
    "sellingprice",
    "stock",
  ],
  ProductImage: ["productid", "url"],
  Category: ["categoryname"],
  InventoryLog: ["variantid", "oldstock", "newstock", "action", "adminid"],
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
  OrderItem: ["orderid", "productid", "variantid", "quantity", "price"],
  CartItem: ["userid", "productid", "variantid", "quantity"],
  WishlistItem: ["userid", "productid", "variantid"],
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

// ================= SAMPLE DATA =================
const SAMPLE_DATA: Record<DataType, Record<string, unknown>[]> = {
  User: [
    {
      username: "Parth",
      phone: "9999999999",
      password: "123456",
      role: "USER",
      isverified: true,
      isblocked: false,
    },
    {
      username: "Rahul",
      phone: "8888888888",
      password: "654321",
      role: "ADMIN",
      isverified: true,
      isblocked: false,
    },
  ],

  AdminLog: [
    {
      action: "CREATE_PRODUCT",
      entity: "Product",
      entityid: 1,
    },
    {
      action: "UPDATE_PRODUCT",
      entity: "Product",
      entityid: 2,
    },
  ],

  Brand: [
    {
      brandname: "UPL Agro",
    },
    {
      brandname: "Bayer Cropscience",
    },
  ],

  Product: [
    {
      name: "Organic Wheat Seeds",
      description: "Premium quality wheat seeds for farming",
      technicalname: "WHEAT-SEED-25KG",
      brandid: 1,
      categoryid: 1,
      isactive: true,
    },
    {
      name: "Bio Fertilizer",
      description: "Natural fertilizer for healthy crop growth",
      technicalname: "BIO-FERT-10KG",
      brandid: 2,
      categoryid: 2,
      isactive: true,
    },
  ],

  ProductVariant: [
    {
      productid: 1,
      name: "Weight",
      value: "1 kg",
      unit: "KG",
      mrp: 1000,
      sellingprice: 850,
      stock: 10,
    },
    {
      productid: 1,
      name: "Weight",
      value: "500 gm",
      unit: "GM",
      mrp: 600,
      sellingprice: 520,
      stock: 20,
    },
    {
      productid: 2,
      name: "Volume",
      value: "5 l",
      unit: "L",
      mrp: 600,
      sellingprice: 520,
      stock: 20,
    },
  ],

  ProductImage: [
    {
      productid: 1,
      url: "https://example.com/wheat.jpg",
    },
    {
      productid: 2,
      url: "https://example.com/fertilizer.jpg",
    },
  ],

  Category: [
    {
      categoryname: "Seeds",
    },
    {
      categoryname: "Fertilizers",
    },
  ],

  InventoryLog: [
    {
      variantid: 1,
      oldstock: 10,
      newstock: 8,
      action: "REDUCE",
      adminid: 1,
    },
    {
      variantid: 2,
      oldstock: 20,
      newstock: 30,
      action: "ADD",
      adminid: 2,
    },
  ],

  Order: [
    {
      userid: 1,
      total: 1500,
      status: "PENDING",
      paymentmethod: "COD",
      paymentstatus: "PENDING",
      razorpayorderid: "",
      razorpaypaymentid: "",
      razorpaysignature: "",
      paidat: "",
      expiresat: "",
      deliverystatus: "PENDING",
      trackingid: "",
      shippingname: "Parth Patidar",
      shippingphone: "9999999999",
      shippingline1: "Kolar Road",
      shippingline2: "Near Lake",
      shippingcity: "Bhopal",
      shippingstate: "MP",
      shippingpincode: "462042",
    },
    {
      userid: 2,
      total: 2200,
      status: "CONFIRMED",
      paymentmethod: "UPI",
      paymentstatus: "PAID",
      razorpayorderid: "razor_123",
      razorpaypaymentid: "pay_123",
      razorpaysignature: "sign_123",
      paidat: "2026-05-20",
      expiresat: "",
      deliverystatus: "PACKED",
      trackingid: "TRK123456",
      shippingname: "Rahul Sharma",
      shippingphone: "8888888888",
      shippingline1: "MP Nagar",
      shippingline2: "",
      shippingcity: "Indore",
      shippingstate: "MP",
      shippingpincode: "452001",
    },
  ],

  OrderItem: [
    {
      orderid: 1,
      productid: 1,
      variantid: 1,
      quantity: 2,
      price: 500,
    },
    {
      orderid: 2,
      productid: 2,
      variantid: 2,
      quantity: 1,
      price: 1200,
    },
  ],

  CartItem: [
    {
      userid: 1,
      productid: 1,
      variantid: 1,
      quantity: 1,
    },
    {
      userid: 2,
      productid: 2,
      variantid: 2,
      quantity: 3,
    },
  ],

  WishlistItem: [
    {
      userid: 1,
      productid: 1,
      variantid: 1,
    },
    {
      userid: 2,
      productid: 2,
      variantid: 2,
    },
  ],

  Address: [
    {
      userid: 1,
      fullname: "John Doe",
      phone: "9999999999",
      line1: "Street 1",
      line2: "Near Mall",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      isdefault: true,
    },
    {
      userid: 2,
      fullname: "Rahul Sharma",
      phone: "8888888888",
      line1: "MG Road",
      line2: "Near Bus Stand",
      city: "Indore",
      state: "MP",
      pincode: "452001",
      isdefault: false,
    },
  ],
};

// ================= COMPONENT =================
export default function SampleCsvDownloader({ type }: Props) {
  const handleDownload = () => {
    const headers = SAMPLE_HEADERS[type];
    const rows = SAMPLE_DATA[type];

    const csv = Papa.unparse({
      fields: headers,
      data: rows,
    });

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${type}_sample.csv`;

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <FileText
            className="text-indigo-600 dark:text-indigo-400"
            size={18}
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {type} Sample CSV
          </p>

          <p className="text-xs text-gray-500">
            Includes headers + example rows
          </p>
        </div>
      </div>

      {/* BUTTON */}
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition"
      >
        <Download size={16} />
        Download
      </button>
    </div>
  );
}
