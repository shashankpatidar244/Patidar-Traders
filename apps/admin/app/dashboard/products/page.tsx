import { prisma } from "@repo/database";
import ProductTable from "./components/ProductTable";
import Link from "next/link";
import Pagination from "../components/Pagination";
import SearchFilterBar, {
  FilterField,
} from "../components/SearchFilterBar";


export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }>;
}){
  const params = await searchParams;

  const search = params.search || "";
  const category = params.category || "";
  const status = params.status || "";
  const sort = params.sort || "newest";

  const page = Number(params.page || 1);
  const limit = Number(params.limit || 10);

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const fields: FilterField[] = [
    {
      key: "category",
      label: "Category",
      options: categories.map((cat) => ({
        label: cat.name,
        value: String(cat.id),
      })),
    },

    {
      key: "status",
      label: "Status",
      options: [
        {
          label: "Active",
          value: "active",
        },
        {
          label: "Inactive",
          value: "inactive",
        },
      ],
    },

    {
      key: "sort",
      label: "Sort",
      isSortEngine: true,
      options: [
        {
          label: "Newest",
          value: "newest",
        },
        {
          label: "Price Low → High",
          value: "price_low",
        },
        {
          label: "Price High → Low",
          value: "price_high",
        },
      ],
    },
  ];

  // WHERE FILTER
  const where: any = {};

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (category) {
    where.categoryId = Number(category);
  }

  if (status) {
    where.isActive = status === "active";
  }

  // SORT
  let orderBy: any = {
    createdAt: "desc",
  };

  if (sort === "newest") {
    orderBy = {
      createdAt: "desc",
    };
  }

  // FETCH
  let products = await prisma.product.findMany({
    where,

    include: {
      images: true,
      variants: true,
      category: true,
      brand: true,
    },
    orderBy,

    skip: (page - 1) * limit,
    take: limit,
  });

  // FIX: SORT BY SELLING PRICE
  const getMinPrice = (variants: any[]) => {
    if (!variants?.length) return 0;
    return Math.min(...variants.map((v) => v.sellingPrice ?? 0));
  };

  if (sort === "price_low") {
    products = products.sort((a: any, b: any) => {
      return getMinPrice(a.variants) - getMinPrice(b.variants);
    });
  }

  if (sort === "price_high") {
    products = products.sort((a: any, b: any) => {
      return getMinPrice(b.variants) - getMinPrice(a.variants);
    });
  }

  // COUNT
  const totalProducts = await prisma.product.count({ where });
  const totalPages = Math.ceil(totalProducts / Number(limit));

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>

        <Link
          href="/dashboard/products/new"
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          + Add Product
        </Link>
      </div>

      {/* FILTERS */}
      <SearchFilterBar
        fields={fields}
        globalSearchKey="search"
        globalSearchPlaceholder="Search products..."
      />

      {/* TABLE */}
      <ProductTable/>

      {/* PAGINATION */}
      <Pagination
        title="Products"
        page={Number(page)}
        totalPages={totalPages}
        currentLimit={Number(limit)}
      />
    </div>
  );
}
