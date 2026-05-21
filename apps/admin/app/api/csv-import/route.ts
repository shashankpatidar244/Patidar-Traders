import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma } from "@prisma/client";

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

const toBool = (val: any) => {
  if (typeof val === "boolean") {
    return val;
  }

  const normalized = String(val).trim().toLowerCase();

  return ["true", "1", "yes"].includes(normalized);
};

const toInt = (val: any) => {
  if (val === null || val === undefined || val === "") {
    return null;
  }

  const num = parseInt(val);

  return isNaN(num) ? null : num;
};

const toFloat = (val: any) => {
  if (val === null || val === undefined || val === "") {
    return null;
  }

  const num = parseFloat(val);

  return isNaN(num) ? null : num;
};

const toDate = (val: any) => {
  if (!val || val === "null" || val === "") {
    return null;
  }

  const date = new Date(val);

  return isNaN(date.getTime()) ? null : date;
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

const PaymentStatusEnum = z.enum([
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
]);

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
  User: z.object({
    username: z.string().optional(),

    phone: z.union([z.string(), z.number()]).transform(String),

    password: z
      .union([z.string(), z.number(), z.undefined()])
      .optional()
      .transform((v) => (v ? String(v) : undefined)),

    role: z.string().optional(),

    isverified: z.any().optional(),

    isblocked: z.any().optional(),
  }),

  AdminLog: z.object({
    action: z.string(),

    entity: z.string(),

    entityid: z.union([z.string(), z.number()]).transform(Number),
  }),

  Brand: z.object({
    brandname: z.string().min(1),
  }),

  Category: z.object({
    categoryname: z.string().min(1),
  }),

  Product: z.object({
    name: z.string().min(1),

    description: z.string().optional(),

    technicalname: z.string().optional(),

    brandid: z
      .union([z.string(), z.number(), z.undefined()])
      .optional()
      .transform((v) => (v != null ? Number(v) : null)),

    categoryid: z
      .union([z.string(), z.number(), z.undefined()])
      .optional()
      .transform((v) => (v != null ? Number(v) : null)),

    isactive: z.any().optional(),
  }),

  ProductVariant: z.object({
    productid: z.union([z.string(), z.number()]).transform(Number),

    name: z.union([z.string(), z.null()]).transform((v) => v ?? ""),

    value: z.union([z.string(), z.null()]).transform((v) => v ?? ""),

    mrp: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .transform((v) => (v != null ? Number(v) : null)),

    sellingprice: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .transform((v) => (v != null ? Number(v) : null)),

    stock: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .transform((v) => (v != null ? Number(v) : 0)),

    unit: z.string().optional(),
  }),

  ProductImage: z.object({
    productid: z.union([z.string(), z.number()]).transform(Number),

    url: z.string().url(),
  }),

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

  Order: z.object({
    userid: z.union([z.string(), z.number()]).transform(Number),

    total: z.union([z.string(), z.number()]).transform(Number),

    status: z.union([z.string(), z.null()]).optional(),

    paymentmethod: z.union([z.string(), z.null()]).optional(),

    paymentstatus: z.union([z.string(), z.null()]).optional(),

    razorpayorderid: z.union([z.string(), z.null()]).optional(),

    razorpaypaymentid: z.union([z.string(), z.null()]).optional(),

    razorpaysignature: z.union([z.string(), z.null()]).optional(),

    paidat: z.any().optional(),

    expiresat: z.any().optional(),

    deliverystatus: z.union([z.string(), z.null()]).optional(),

    trackingid: z.union([z.string(), z.null()]).optional(),

    shippingname: z.string(),

    shippingphone: z.union([z.string(), z.number()]).transform(String),

    shippingline1: z.string(),

    shippingline2: z.union([z.string(), z.null()]).optional(),

    shippingcity: z.string(),

    shippingstate: z.string(),

    shippingpincode: z.union([z.string(), z.number()]).transform(String),
  }),

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

  CartItem: z.object({
    userid: z.union([z.string(), z.number()]).transform(Number),

    productid: z.union([z.string(), z.number()]).transform(Number),

    variantid: z
      .union([z.string(), z.number(), z.undefined()])
      .optional()
      .transform((v) => (v != null ? Number(v) : null)),

    quantity: z
      .union([z.string(), z.number(), z.undefined()])
      .optional()
      .transform((v) => (v != null ? Number(v) : 1)),
  }),

  WishlistItem: z.object({
    userid: z.union([z.string(), z.number()]).transform(Number),

    productid: z.union([z.string(), z.number()]).transform(Number),

    variantid: z.union([z.string(), z.number()]).transform(Number),
  }),

  Address: z.object({
    userid: z.union([z.string(), z.number()]).transform(Number),

    fullname: z.string(),

    phone: z.union([z.string(), z.number()]).transform(String),

    line1: z.string(),

    line2: z.union([z.string(), z.null()]).optional(),

    city: z.string(),

    state: z.string(),

    pincode: z.union([z.string(), z.number()]).transform(String),

    isdefault: z.any().optional(),
  }),
} as const;

// ================= TRANSFORMERS =================

const transformers = {
  User: async (r: any) => ({
    username: r.username ?? null,

    phone: r.phone,

    isVerified: toBool(r.isverified),

    isBlocked: toBool(r.isblocked),

    role: RoleEnum.safeParse(r.role).success ? r.role : "USER",

    password: r.password
      ? await bcrypt.hash(r.password, 10)
      : null,
  }),

  AdminLog: async (r: any) => ({
    action: r.action,

    entity: r.entity,

    entityId: r.entityid,
  }),

  Brand: async (r: any) => ({
    name: r.brandname.trim(),
  }),

  Category: async (r: any) => ({
    name: r.categoryname.trim(),
  }),

  Product: async (r: any) => ({
    name: r.name.trim(),

    description: r.description ?? null,

    technicalName: r.technicalname ?? null,

    brandId: r.brandid ?? null,

    categoryId: r.categoryid ?? null,

    isActive: r.isactive !== "false",
  }),

  ProductVariant: async (r: any) => ({
    productId: r.productid,

    name: r.name || "Default Variant",

    value: r.value || "",

    mrp: r.mrp != null ? new Prisma.Decimal(r.mrp) : null,

    sellingPrice:
      r.sellingprice != null
        ? new Prisma.Decimal(r.sellingprice)
        : r.mrp != null
        ? new Prisma.Decimal(r.mrp)
        : null,

    stock: r.stock ?? 0,

    unit: UnitEnum.safeParse(r.unit).success ? r.unit : null,
  }),

  ProductImage: async (r: any) => ({
    productId: r.productid,

    url: r.url,
  }),

  InventoryLog: async (r: any) => ({
    variantId: r.variantid,

    oldStock: r.oldstock ?? 0,

    newStock: r.newstock ?? 0,

    action: InventoryActionEnum.safeParse(r.action).success
      ? r.action
      : "SET",

    adminId: r.adminid ?? null,
  }),

  Order: async (r: any) => ({
    userId: r.userid,

    total: new Prisma.Decimal(r.total ?? 0),

    status: OrderStatusEnum.safeParse(r.status).success
      ? r.status
      : "PENDING",

    paymentMethod: PaymentMethodEnum.safeParse(r.paymentmethod).success
      ? r.paymentmethod
      : "COD",

    paymentStatus: PaymentStatusEnum.safeParse(r.paymentstatus).success
      ? r.paymentstatus
      : "PENDING",

    razorpayOrderId: r.razorpayorderid ?? null,

    razorpayPaymentId: r.razorpaypaymentid ?? null,

    razorpaySignature: r.razorpaysignature ?? null,

    paidAt: toDate(r.paidat),

    expiresAt: toDate(r.expiresat),

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

  OrderItem: async (r: any) => ({
    orderId: r.orderid,

    productId: r.productid,

    variantId: r.variantid ?? null,

    quantity: r.quantity,

    price: new Prisma.Decimal(r.price),
  }),

  CartItem: async (r: any) => ({
    userId: r.userid,

    productId: r.productid,

    variantId: r.variantid,

    quantity: r.quantity ?? 1,
  }),

  WishlistItem: async (r: any) => ({
    userId: r.userid,

    productId: r.productid,

    variantId: r.variantid,
  }),

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

// ================= MAIN =================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { type, data } = body;

    if (!type || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    if (!isValidType(type)) {
      return NextResponse.json(
        { error: "Unsupported type" },
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

    // ================= PREPARE =================

    const preparedData = await Promise.all(
      data.map(async (row, index) => {
        try {
          const normalized = normalizeRow(row);

          const parsed = schema.safeParse(normalized);

          if (!parsed.success) {
            errors.push({
              row: index + 1,
              error: parsed.error.issues
                .map((i) => i.message)
                .join(", "),
            });

            return null;
          }

          const transformed = await transformer(parsed.data);

          return {
            __row: index + 1,
            ...transformed,
          };
        } catch (err: any) {
          errors.push({
            row: index + 1,
            error: err.message ?? "Unknown error",
          });

          return null;
        }
      })
    );

    const finalData = preparedData.filter(notNull).filter(Boolean);

    if (finalData.length === 0) {
      return NextResponse.json({
        message: "No valid rows",
        success: 0,
        failed: data.length,
        total: data.length,
        errors,
      });
    }

    // ================= FK VALIDATION =================

    async function validateForeignKeys(rows: any[]) {
      const validRows: any[] = [];

      const checkExists = async (
        ids: number[],
        model: any
      ) => {
        const items = await model.findMany({
          where: {
            id: {
              in: ids,
            },
          },
          select: {
            id: true,
          },
        });

        return new Set(items.map((i: any) => i.id));
      };

      for (const row of rows) {
        try {
          // PRODUCT
          if (type === "Product") {
            if (row.brandId) {
              const brands = await checkExists(
                [row.brandId],
                prisma.brand
              );

              if (!brands.has(row.brandId)) {
                errors.push({
                  row: row.__row,
                  error: `Brand not found: ${row.brandId}`,
                });

                continue;
              }
            }

            if (row.categoryId) {
              const categories = await checkExists(
                [row.categoryId],
                prisma.category
              );

              if (!categories.has(row.categoryId)) {
                errors.push({
                  row: row.__row,
                  error: `Category not found: ${row.categoryId}`,
                });

                continue;
              }
            }
          }

          // PRODUCT VARIANT
          if (type === "ProductVariant") {
            const products = await checkExists(
              [row.productId],
              prisma.product
            );

            if (!products.has(row.productId)) {
              errors.push({
                row: row.__row,
                error: `Product not found: ${row.productId}`,
              });

              continue;
            }
          }

          // PRODUCT IMAGE
          if (type === "ProductImage") {
            const products = await checkExists(
              [row.productId],
              prisma.product
            );

            if (!products.has(row.productId)) {
              errors.push({
                row: row.__row,
                error: `Product not found: ${row.productId}`,
              });

              continue;
            }
          }

          // INVENTORY LOG
          if (type === "InventoryLog") {
            const variants = await checkExists(
              [row.variantId],
              prisma.productVariant
            );

            if (!variants.has(row.variantId)) {
              errors.push({
                row: row.__row,
                error: `Variant not found: ${row.variantId}`,
              });

              continue;
            }
          }

          validRows.push(row);
        } catch (err: any) {
          errors.push({
            row: row.__row,
            error: err.message ?? "FK validation failed",
          });
        }
      }

      return validRows;
    }

    const validRows = await validateForeignKeys(finalData);

    if (validRows.length === 0) {
      return NextResponse.json({
        message: "No valid rows",
        success: 0,
        failed: data.length,
        total: data.length,
        errors,
      });
    }

    const cleanedRows = validRows.map((r) => {
      const { __row, ...rest } = r;

      return rest;
    });

    // ================= RELATIONAL =================

    const relationalModels = [
      "Address",
      "WishlistItem",
      "CartItem",
      "Order",
      "OrderItem",
      "Product",
      "ProductVariant",
      "ProductImage",
      "InventoryLog",
    ];

    let success = 0;

    // ================= SAFE INSERT =================

    if (relationalModels.includes(type)) {
      const results = await Promise.allSettled(
        cleanedRows.map((row) =>
          model.create({
            data: row,
          })
        )
      );

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          success++;
        } else {
          errors.push({
            row: validRows[index].__row,
            error:
              result.reason?.code === "P2002"
                ? "Duplicate entry"
                : result.reason?.message ?? "Insert failed",
          });
        }
      });
    }

    // ================= BULK INSERT =================

    else {
      try {
        const result = await model.createMany({
          data: cleanedRows,
          skipDuplicates: true,
        });

        success = result.count;
      } catch (err: any) {
        errors.push({
          row: 0,
          error: err.message ?? "Bulk insert failed",
        });
      }
    }

    // ================= RESPONSE =================

    return NextResponse.json({
      message: "Import completed",

      success,

      failed: data.length - success,

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