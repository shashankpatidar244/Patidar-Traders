import { prisma } from "@repo/database";
import InventoryClientPage from "./components/InventoryClientPage";

export default async function InventoryPage() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const brands = await prisma.brand.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return <InventoryClientPage categories={categories} brands={brands} />;
}
