import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import bcrypt from "bcryptjs";
import { z } from "zod";

// ================= HELPERS =================

function notNull<T>(value: T | null): value is T {
  return value !== null;
}

const normalizeRow = (row: Record<string, any>) => {
  const newRow: Record<string, any> = {};

  Object.keys(row).forEach((key) => {
    newRow[key.trim().toLowerCase()] = row[key];
  });

  return newRow;
};

const toBool = (val: any) => String(val).toLowerCase() === "true";

const toInt = (val: any) => {
  const num = parseInt(val);

  return isNaN(num) ? null : num;
};

const toFloat = (val: any) => {
  const num = parseFloat(val);

  return isNaN(num) ? null : num;
};

// ================= ENUMS =================

const RoleEnum = z.enum(["ADMIN", "USER"]);

const OrderStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "COMPLETED",
  "CANCELLED",
]);

const PaymentStatusEnum = z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]);

const PaymentMethodEnum = z.enum(["COD", "UPI", "CARD"]);

const DeliveryStatusEnum = z.enum([
  "PENDING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
]);

const InventoryActionEnum = z.enum(["ADD", "REDUCE", "SET"]);

const UnitEnum = z.enum(["GM", "KG", "ML", "L", "PCS"]);

// ================= SCHEMAS =================

const schemas = {
  // ================= USER =================
  User: z.object({
    username: z.string().optional(),

    phone: z.union([z.string(), z.number()]).transform((v) => String(v)),

    password: z
      .union([z.string(), z.number(), z.undefined()])
      .optional()
      .transform((v) => (v ? String(v) : undefined)),

    role: z.string().optional(),

    isverified: z.any().optional(),

    isblocked: z.any().optional(),
  }),

  // ================= ADMIN LOG =================
  AdminLog: z.object({
    action: z.string(),

    entity: z.string(),

    entityid: z.union([z.string(), z.number()]).transform(Number),
  }),

  // ================= BRAND =================
  Brand: z.object({
    name: z.string().min(1),
  }),

  // ================= CATEGORY =================
  Category: z.object({
    name: z.string().min(1),
  }),

  // ================= PRODUCT =================
  Product: z.object({
    name: z.string().min(1),

    description: z.string().optional(),

    technicalname: z.string().optional(),

    brandid: z
      .union([z.string(), z.number(), z.undefined()])
      .optional()
      .transform((v) => (v != null ? Number(v) : undefined)),

    categoryid: z
      .union([z.string(), z.number(), z.undefined()])
      .optional()
      .transform((v) => (v != null ? Number(v) : undefined)),

    isactive: z.any().optional(),
  }),

  // ================= PRODUCT VARIANT =================
  ProductVariant: z.object({
    productid: z.union([z.string(), z.number()]).transform(Number),

    name: z.union([z.string(), z.null()]).transform((v) => v ?? ""),

    value: z.union([z.string(), z.null()]).transform((v) => v ?? ""),

    mrp: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .transform((v) => (v != null ? Number(v) : undefined)),

    sellingprice: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .transform((v) => (v != null ? Number(v) : undefined)),

    stock: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .transform((v) => (v != null ? Number(v) : 0)),

    unit: z.string().optional(),
  }),

  // ================= PRODUCT IMAGE =================
  ProductImage: z.object({
    productid: z.union([z.string(), z.number()]).transform(Number),

    url: z.string().url(),
  }),

  // ================= INVENTORY LOG =================
  InventoryLog: z.object({
    variantid: z.union([z.string(), z.number()]).transform(Number),

    oldstock: z
      .union([z.string(), z.number(), z.undefined()])
      .optional()
      .transform((v) => (v != null ? Number(v) : 0)),

    newstock: z
      .union([z.string(), z.number(), z.undefined()])
      .optional()
      .transform((v) => (v != null ? Number(v) : 0)),

    action: z.string(),

    adminid: z
      .union([z.string(), z.number(), z.undefined()])
      .optional()
      .transform((v) => (v != null ? Number(v) : null)),
  }),

  // ================= ORDER =================
  Order: z.object({
    userid: z.union([z.string(), z.number()]).transform(Number),

    total: z.union([z.string(), z.number()]).transform(Number),

    status: z.string().optional(),

    paymentmethod: z.string().optional(),

    paymentstatus: z.string().optional(),

    razorpayorderid: z.union([z.string(), z.null()]).optional(),

    razorpaypaymentid: z.union([z.string(), z.null()]).optional(),

    razorpaysignature: z.union([z.string(), z.null()]).optional(),

    paidat: z.union([z.string(), z.date(), z.null()]).optional(),

    expiresat: z.union([z.string(), z.date(), z.null()]).optional(),

    deliverystatus: z.string().optional(),

    trackingid: z.string().optional(),

    shippingname: z.string(),

    shippingphone: z.union([z.string(), z.number()]).transform(String),

    shippingline1: z.string(),

    shippingline2: z.string().optional(),

    shippingcity: z.string(),

    shippingstate: z.string(),

    shippingpincode: z.union([z.string(), z.number()]).transform(String),
  }),

  // ================= ORDER ITEM =================
  OrderItem: z.object({
    orderid: z.union([z.string(), z.number()]).transform(Number),

    productid: z.union([z.string(), z.number()]).transform(Number),

    variantid: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((v) => (v != null ? Number(v) : null)),

    quantity: z.union([z.string(), z.number()]).transform(Number),

    price: z.union([z.string(), z.number()]).transform(Number),
  }),

  // ================= CART ITEM =================
  CartItem: z.object({
    userid: z.union([z.string(), z.number()]).transform(Number),

    productid: z.union([z.string(), z.number()]).transform(Number),

    variantid: z
      .union([z.string(), z.number(), z.undefined()])
      .optional()
      .transform((v) => (v != null ? Number(v) : undefined)),

    quantity: z
      .union([z.string(), z.number(), z.undefined()])
      .optional()
      .transform((v) => (v != null ? Number(v) : 1)),
  }),

  // ================= WISHLIST ITEM =================
  WishlistItem: z.object({
    userid: z.union([z.string(), z.number()]).transform(Number),

    productid: z.union([z.string(), z.number()]).transform(Number),

    variantid: z.union([z.string(), z.number()]).transform(Number),
  }),

  // ================= ADDRESS =================
  Address: z.object({
    userid: z.union([z.string(), z.number()]).transform(Number),

    fullname: z.string(),

    phone: z.union([z.string(), z.number()]).transform(String),

    line1: z.string(),

    line2: z.string().optional(),

    city: z.string(),

    state: z.string(),

    pincode: z.union([z.string(), z.number()]).transform(String),

    isdefault: z.any().optional(),
  }),
} as const;

// ================= TRANSFORMERS =================

const transformers = {
  // ================= USER =================
  User: async (r: any) => ({
    username: r.username ?? null,

    phone: r.phone,

    isVerified: toBool(r.isverified),

    isBlocked: toBool(r.isblocked),

    role: RoleEnum.safeParse(r.role).success ? r.role : "USER",

    password: r.password ? await bcrypt.hash(r.password, 10) : null,
  }),

  // ================= ADMIN LOG =================
  AdminLog: async (r: any) => ({
    action: r.action,

    entity: r.entity,

    entityId: r.entityid,
  }),

  // ================= BRAND =================
  Brand: async (r: any) => ({
    name: r.name.trim(),
  }),

  // ================= CATEGORY =================
  Category: async (r: any) => ({
    name: r.name.trim(),
  }),

  // ================= PRODUCT =================
  Product: async (r: any) => ({
    name: r.name.trim(),

    description: r.description ?? null,

    technicalName: r.technicalname ?? null,

    brandId: r.brandid ?? null,

    categoryId: r.categoryid ?? null,

    isActive: r.isactive !== "false",
  }),

  // ================= PRODUCT VARIANT =================
  ProductVariant: async (r: any) => ({
    productId: r.productid,

    name: r.name || "Default Variant",

    value: r.value || "",

    mrp: r.mrp ?? null,

    sellingPrice: r.sellingprice ?? r.mrp ?? null,

    stock: r.stock ?? 0,

    unit: UnitEnum.safeParse(r.unit).success ? r.unit : null,
  }),

  // ================= PRODUCT IMAGE =================
  ProductImage: async (r: any) => ({
    productId: r.productid,

    url: r.url,
  }),

  // ================= INVENTORY LOG =================
  InventoryLog: async (r: any) => ({
    variantId: r.variantid,

    oldStock: r.oldstock ?? 0,

    newStock: r.newstock ?? 0,

    action: InventoryActionEnum.safeParse(r.action).success ? r.action : "SET",

    adminId: r.adminid ?? null,
  }),

  // ================= ORDER =================
  Order: async (r: any) => ({
    userId: r.userid,

    total: r.total ?? 0,

    status: OrderStatusEnum.safeParse(r.status).success ? r.status : "PENDING",

    paymentMethod: PaymentMethodEnum.safeParse(r.paymentmethod).success
      ? r.paymentmethod
      : "COD",

    paymentStatus: PaymentStatusEnum.safeParse(r.paymentstatus).success
      ? r.paymentstatus
      : "PENDING",

    razorpayOrderId: r.razorpayorderid ?? null,

    razorpayPaymentId: r.razorpaypaymentid ?? null,

    razorpaySignature: r.razorpaysignature ?? null,

    paidAt: r.paidat ? new Date(r.paidat) : null,

    expiresAt: r.expiresat ? new Date(r.expiresat) : null,

    deliveryStatus: DeliveryStatusEnum.safeParse(r.deliverystatus).success
      ? r.deliverystatus
      : "PENDING",

    trackingId: r.trackingid ?? null,

    shippingName: r.shippingname,

    shippingPhone: r.shippingphone,

    shippingLine1: r.shippingline1,

    shippingLine2: r.shippingline2 ?? null,

    shippingCity: r.shippingcity,

    shippingState: r.shippingstate,

    shippingPincode: r.shippingpincode,
  }),

  // ================= ORDER ITEM =================
  OrderItem: async (r: any) => ({
    orderId: r.orderid,

    productId: r.productid,

    variantId: r.variantid ?? null,

    quantity: r.quantity,

    price: r.price,
  }),

  // ================= CART ITEM =================
  CartItem: async (r: any) => ({
    userId: r.userid,

    productId: r.productid,

    variantId: r.variantid,

    quantity: r.quantity ?? 1,
  }),

  // ================= WISHLIST ITEM =================
  WishlistItem: async (r: any) => ({
    userId: r.userid,

    productId: r.productid,

    variantId: r.variantid,
  }),

  // ================= ADDRESS =================
  Address: async (r: any) => ({
    userId: r.userid,

    fullName: r.fullname,

    phone: r.phone,

    line1: r.line1,

    line2: r.line2 ?? null,

    city: r.city,

    state: r.state,

    pincode: r.pincode,

    isDefault: r.isdefault === true || r.isdefault === "true",
  }),
} as const;

// ================= PRISMA MAP =================

const prismaMap = {
  User: prisma.user,

  AdminLog: prisma.adminLog,

  Brand: prisma.brand,

  Category: prisma.category,

  Product: prisma.product,

  ProductVariant: prisma.productVariant,

  ProductImage: prisma.productImage,

  InventoryLog: prisma.inventoryLog,

  Order: prisma.order,

  OrderItem: prisma.orderItem,

  CartItem: prisma.cartItem,

  WishlistItem: prisma.wishlistItem,

  Address: prisma.address,
} as const;

// ================= TYPES =================

type ImportType = keyof typeof schemas;

function isValidType(type: string): type is ImportType {
  return type in schemas;
}

// ================= MAIN API =================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { type, data } = body;

    // ================= VALIDATION =================
    if (!type || !Array.isArray(data)) {
      return NextResponse.json(
        {
          error: "Invalid request",
        },
        { status: 400 }
      );
    }

    if (!isValidType(type)) {
      return NextResponse.json(
        {
          error: "Unsupported type",
        },
        { status: 400 }
      );
    }

    const schema = schemas[type];

    const transformer = transformers[type];

    const model = prismaMap[type] as any;

    const errors: {
      row: number;
      error: string;
    }[] = [];

    // ================= PREPARE DATA =================
    const preparedData = await Promise.all(
      data.map(async (row, index) => {
        try {
          const normalized = normalizeRow(row);

          const parsed = schema.safeParse(normalized);

          // ================= ZOD ERROR =================
          if (!parsed.success) {
            errors.push({
              row: index + 1,
              error: parsed.error.issues.map((i) => i.message).join(", "),
            });

            return null;
          }

          const transformed = await transformer(parsed.data);

          return transformed;
        } catch (err: any) {
          errors.push({
            row: index + 1,
            error: err.message ?? "Unknown error",
          });

          return null;
        }
      })
    );

    const finalData = preparedData.filter(notNull);

    // ================= NO VALID DATA =================
    if (finalData.length === 0) {
      return NextResponse.json({
        message: "No valid rows",

        success: 0,

        failed: data.length,

        total: data.length,

        errors,
      });
    }

    // ================= INSERT =================
    const result = await model.createMany({
      data: finalData,

      skipDuplicates: true,
    });

    // ================= RESPONSE =================
    return NextResponse.json({
      message: "Import completed",

      success: result.count,

      failed: data.length - result.count,

      total: data.length,

      errors,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Import failed",

        details: err.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
