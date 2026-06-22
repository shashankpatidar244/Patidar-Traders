import Image from "next/image";
import Link from "next/link";
import { getUserFromRequest } from "@/lib/getUserFromRequest";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@repo/database";
import { Prisma } from "@prisma/client";
import CancelOrderButton from "./CancelOrderButton";
import CopyTrackingButton from "./CopyTrackingButton";
import ReorderButton from "./ReorderButton";
import PaymentInfoButton from "./PaymentInfoButton";
import {
  User,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle2,
  PackageCheck,
  Truck,
  CircleDot,
  FileText,
  CalendarDays,
  XCircle,
  Package,
  ArrowLeft,
} from "lucide-react";

type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            images: true;
          };
        };
        variant: true;
      };
    };
  };
}>;

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const orderId = Number.parseInt(id, 10);

  const user = await getUserFromRequest();

  if (!user) {
    redirect("/signin");
  }

  if (Number.isNaN(orderId)) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: user.id,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
          variant: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const createdAt = new Date(order.createdAt);
  const updatedAt = new Date(order.updatedAt);

  const shipping = 0;
  const platformFee = 0;

  const itemsTotal = order.items.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  const orderTotal = itemsTotal + shipping + platformFee;

  const trackingId = order.trackingId ?? "NULL";

  const isCancelled = order.status === "CANCELLED";

  const canCancelOrder =
    ["PENDING", "CONFIRMED", "PACKED"].includes(order.status) &&
    ["PENDING", "PACKED"].includes(order.deliveryStatus);

  const disableCancel = !canCancelOrder;

  const paymentBadgeColor =
    order.paymentStatus === "PAID"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : order.paymentStatus === "REFUNDED"
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : order.paymentStatus === "FAILED"
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-amber-50 text-amber-700 border-amber-200";

  const paymentStatusLabel =
    order.paymentStatus === "PAID"
      ? "Paid Successfully"
      : order.paymentStatus === "REFUNDED"
        ? "Refund Completed"
        : order.paymentStatus === "FAILED"
          ? "Payment Failed"
          : "Payment Pending";

  const displayTimeline =
    order.status === "CANCELLED"
      ? [
          {
            title: "Pending",
            active: true,
            date: createdAt,
          },
          {
            title: "Cancelled",
            active: true,
            date: updatedAt,
          },
          ...(order.paymentStatus === "PAID" ||
          order.paymentStatus === "REFUNDED"
            ? [
                {
                  title: "Refund Processing",
                  active: true,
                  date: updatedAt,
                },
              ]
            : []),

          ...(order.paymentStatus === "REFUNDED"
            ? [
                {
                  title: "Refunded",
                  active: true,
                  date: updatedAt,
                },
              ]
            : []),
        ]
      : [
          {
            title: "Pending",
            active: true,
            date: createdAt,
          },
          {
            title: "Confirmed",
            active: ["CONFIRMED", "PACKED", "COMPLETED"].includes(order.status),
            date: updatedAt,
          },
          {
            title: "Packed",
            active:
              order.status === "PACKED" ||
              order.status === "COMPLETED" ||
              ["PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
                order.deliveryStatus
              ),
            date: updatedAt,
          },
          {
            title: "Shipped",
            active: ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
              order.deliveryStatus
            ),
            date: updatedAt,
          },
          {
            title: "Out For Delivery",
            active: ["OUT_FOR_DELIVERY", "DELIVERED"].includes(
              order.deliveryStatus
            ),
            date: updatedAt,
          },
          {
            title: "Delivered",
            active: order.deliveryStatus === "DELIVERED",
            date: updatedAt,
          },
        ];

  const completedCount = displayTimeline.filter((step) => step.active).length;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 antialiased p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT SECTION */}
          <div className="flex-1 rounded-[2rem] bg-white border border-slate-200 shadow-sm p-6 md:p-8">
            {/* HEADER */}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <div className="mb-2">
                  <Link
                    href="/dashboard/orders"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Orders
                  </Link>
                </div>

                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                  Order Details
                </h1>

                <p className="text-sm font-medium text-slate-500">
                  Order ID:
                  <span className="text-slate-800 ml-1">#ORD-{order.id}</span>
                  <br />
                  Ordered:
                  <span className="text-slate-800 ml-1">
                    {createdAt.toLocaleDateString("en-IN")}
                  </span>
                </p>
              </div>

              {/* ACTION BUTTONS */}

              <div className="flex flex-wrap gap-3">
                <div className="rounded-xl shadow-sm">
                  <CancelOrderButton
                    orderId={order.id}
                    disabled={disableCancel}
                  />
                </div>

                <div className="rounded-xl shadow-sm">
                  <ReorderButton
                    order={{
                      items: order.items.map(
                        (item: OrderWithItems["items"][number]) => ({
                          productId: item.productId,
                          variantId: item.variantId,
                          quantity: item.quantity,
                        })
                      ),
                    }}
                  />
                </div>
              </div>
            </div>

            {order.paymentStatus === "REFUNDED" && (
              <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />

                  <div>
                    <p className="font-semibold text-blue-900">
                      Refund Completed
                    </p>

                    <p className="text-sm text-blue-700">
                      ₹{orderTotal.toLocaleString()} has been refunded to your
                      original payment method.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TRACKING ID */}
            {!isCancelled && (
              <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 shadow-sm">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1m-6 0a1 1 0 001-1m-6 0H7"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Tracking Carrier
                    </p>

                    <p className="text-sm font-semibold text-slate-800">
                      Tracking ID:
                      <span className="ml-2 text-indigo-600 font-mono">
                        {trackingId}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <CopyTrackingButton trackingId={trackingId} />
                </div>
              </div>
            )}
            {/* ORDER ITEMS */}

            <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-5 md:p-7 mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                Order Items
                <span className="bg-slate-200 text-slate-700 py-0.5 px-2.5 rounded-full text-xs font-semibold">
                  {order.items.length}
                </span>
              </h2>

              <div className="space-y-4">
                {order.items.map((item: OrderWithItems["items"][number]) => {
                  const image = item.product.images[0]?.url;

                  const unitPrice = Number(item.price);
                  const Price = Number(item.price) * item.quantity;

                  return (
                    <Link
                      key={item.id}
                      href={`/products/${item.productId}`}
                      className="flex items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200"
                    >
                      {/* PRODUCT IMAGE */}

                      <div className="relative w-16 h-16 flex-shrink-0">
                        <span className="absolute -top-2 -left-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white ring-2 ring-white shadow-sm">
                          {item.quantity}
                        </span>

                        <div className="relative h-full w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                          {image ? (
                            <Image
                              src={image}
                              alt={item.product.name}
                              fill
                              sizes="64px"
                              className="object-cover transition-transform duration-300 hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-50">
                              <svg
                                className="w-7 h-7 text-slate-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* PRODUCT DETAILS */}

                      <div className="ml-5 flex-1 min-w-0">
                        <h3 className="font-bold text-base text-slate-900 leading-tight mb-1 truncate">
                          {item.product.name}
                        </h3>

                        <p className="text-sm text-slate-500 font-medium">
                          Variant:
                          <span className="text-slate-700 ml-1">
                            {item.variant
                              ? `${item.variant.name}: ${item.variant.value}`
                              : "Default"}
                          </span>
                        </p>
                      </div>

                      {/* PRICE */}

                      <div className="text-right ml-4">
                        <div className="font-bold text-slate-900 text-lg">
                          ₹{Price.toFixed(2)}
                        </div>

                        <div className="text-[11px] text-slate-400 font-medium font-mono">
                          ₹{unitPrice.toFixed(2)} each
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* CONTACT + BILLING */}

            <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-5 md:p-7 flex flex-col md:flex-row gap-10">
              {/* CONTACT INFO */}

              <div className="flex-1 space-y-8">
                <div>
                  <h3 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-4">
                    Contact Information
                  </h3>

                  <div className="space-y-3 text-slate-700 font-medium">
                    <p className="flex items-center gap-3">
                      <span className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-400">
                        <User className="w-4 h-4" />
                      </span>

                      {order.shippingName}
                    </p>

                    <p className="flex items-center gap-3">
                      <span className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-400">
                        <Phone className="w-4 h-4" />
                      </span>

                      {order.shippingPhone}
                    </p>
                  </div>
                </div>

                {/* ADDRESS */}

                <div>
                  <h3 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-4">
                    Delivery Address
                  </h3>

                  <div className="flex items-start gap-3 text-slate-700 font-medium">
                    <span className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-400 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </span>

                    <div className="leading-relaxed">
                      <p>
                        {order.shippingLine1}
                        {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
                      </p>
                      <p>
                        {order.shippingCity}, {order.shippingState} -{" "}
                        {order.shippingPincode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* BILL DETAILS */}

              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm uppercase tracking-wider font-bold text-slate-500">
                    Bill Details
                  </h3>

                  <span
                    className={`text-xs px-3 py-1 rounded-md font-bold uppercase tracking-wide border ${paymentBadgeColor}`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl p-5 mb-5 bg-white shadow-sm space-y-3">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Items Total ({order.items.length} items)</span>

                    <span className="font-medium text-slate-900">
                      ₹{itemsTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Shipping</span>

                    <span className="font-medium text-slate-900">
                      ₹{shipping.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Platform Fee</span>

                    <span className="font-medium text-slate-900">
                      ₹{platformFee.toFixed(2)}
                    </span>
                  </div>

                  <hr className="border-slate-100 my-2" />

                  <div className="flex justify-between text-base font-bold text-slate-900">
                    <span>Order Total</span>

                    <span>₹{orderTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* PAYMENT INFO */}
                <PaymentInfoButton
                  order={{
                    ...order,
                    total: Number(order.total),
                    items: order.items.map((item) => ({
                      ...item,
                      price: Number(item.price),
                    })),
                  }}
                />
              </div>
            </div>
          </div>

          {/* STATUS SIDEBAR */}
          <div className="w-full lg:w-1/4 bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col">
            <h2 className="text-xl font-bold text-slate-900 mb-8">
              Order Status
            </h2>

            <div className="flex-1 relative px-2">
              {/* timeline line */}
              <div className="absolute left-[15px] top-2 bottom-6 w-0.5 bg-slate-200" />
              <div
                className="absolute left-[15px] top-2 w-[3px] rounded-full bg-gradient-to-b from-indigo-500 via-violet-500 to-emerald-500 transition-all duration-700"
                style={{
                  height: `calc(${Math.max(completedCount, 0)} * 5rem)`,
                }}
              />

              <div className="space-y-20 relative">
                {displayTimeline.map((step, index) => {
                  const isActive = step.active;

                  const Icon =
                    step.title === "Pending"
                      ? CircleDot
                      : step.title === "Confirmed"
                        ? CheckCircle2
                        : step.title === "Packed"
                          ? PackageCheck
                          : step.title === "Shipped"
                            ? Truck
                            : step.title === "Out For Delivery"
                              ? Truck
                              : step.title === "Delivered"
                                ? CheckCircle2
                                : step.title === "Cancelled"
                                  ? XCircle
                                  : step.title === "Refund Processing"
                                    ? CreditCard
                                    : step.title === "Refunded"
                                      ? CheckCircle2
                                      : FileText;

                  return (
                    <div key={step.title} className="flex items-start gap-5">
                      {/* ICON NODE */}
                      <div
                        className={`z-10 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm transition-all ${
                          isActive
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-400 border border-slate-300"
                        }`}
                      >
                        {isActive ? (
                          <Icon className="w-4 h-4" />
                        ) : (
                          <CircleDot className="w-4 h-4" />
                        )}
                      </div>

                      {/* CONTENT */}
                      <div>
                        <h4
                          className={`text-sm font-bold leading-none ${
                            isActive ? "text-slate-900" : "text-slate-400"
                          }`}
                        >
                          {step.title}
                        </h4>

                        <p className="text-xs text-slate-500 mt-1.5">
                          {isActive ? step.date.toLocaleString() : "Pending"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER METADATA */}
        <div className="rounded-[2rem] bg-white border border-slate-200 shadow-sm p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* CUSTOMER */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-slate-500" />
              Customer
            </h3>

            <div className="space-y-2 text-sm font-medium text-slate-800">
              <p className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                {user.username}
              </p>

              <p className="flex items-center gap-2 text-slate-500">
                <Phone className="w-4 h-4 text-slate-400" />
                {user.phone ? `+91 ${user.phone}` : "Phone not available"}
              </p>
            </div>
          </div>

          {/* BILLING ADDRESS */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-slate-500" />
              Billing Address
            </h3>

            <p className="text-sm font-medium text-slate-800 leading-relaxed">
              Same as delivery
              <br />
              <span className="text-slate-500">address</span>
            </p>
          </div>

          {/* PAYMENT MODE */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-slate-500" />
              Payment Mode
            </h3>

            <p className="text-sm font-medium text-slate-800">
              {order.paymentMethod === "COD"
                ? "Cash on Delivery"
                : order.paymentMethod === "UPI"
                  ? "UPI Payment"
                  : "Card Payment"}
              <br />
              <span className="text-slate-500">{paymentStatusLabel}</span>
            </p>
          </div>

          {/* ORDER DATE */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 flex items-center gap-2 mb-4">
              <CalendarDays className="w-4 h-4 text-slate-500" />
              Order Date
            </h3>

            <p className="text-sm font-medium text-slate-800">
              {createdAt.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              <br />
              <span className="text-slate-500">
                {createdAt.toLocaleTimeString("en-IN")}
              </span>
            </p>
          </div>

          {/* ORDER STATUS */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-slate-500" />
              Order Status
            </h3>

            <div className="space-y-3">
              {/* Order Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Order
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    order.status === "CANCELLED"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : order.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {order.status.replaceAll("_", " ")}
                </span>
              </div>

              <div className="border-t border-slate-200" />

              {/* Delivery Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Delivery
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    order.deliveryStatus === "DELIVERED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : order.deliveryStatus === "OUT_FOR_DELIVERY"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : order.deliveryStatus === "FAILED"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {order.deliveryStatus.replaceAll("_", " ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
