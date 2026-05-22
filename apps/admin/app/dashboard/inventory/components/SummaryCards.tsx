"use client";

interface SummaryCardsProps {
  data: any[];
}

export default function SummaryCards({ data = [] }: SummaryCardsProps) {
  const totalProducts = data.length;

  const totalVariants = data.reduce(
    (sum: number, p: any) => sum + (p.variants?.length || 0),
    0
  );

  const totalStock = data.reduce(
    (sum: number, p: any) =>
      sum +
      (p.variants?.reduce((vSum: number, v: any) => vSum + (v.stock || 0), 0) ||
        0),
    0
  );

  const lowStock = data.filter((p: any) =>
    p.variants?.some((v: any) => v.stock > 0 && v.stock < 10)
  ).length;

  const outStock = data.filter((p: any) =>
    p.variants?.every((v: any) => v.stock === 0)
  ).length;

  const Card = ({ title, value }: { title: string; value: number }) => (
    <div className="relative rounded-2xl p-5 border bg-white shadow-sm hover:shadow-md transition">
      <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl`} />

      <p className="text-xs text-gray-500 mb-1 pl-2">{title}</p>

      <h2 className="text-2xl font-semibold text-gray-900 pl-2">{value}</h2>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      <Card title="Products" value={totalProducts} />
      <Card title="Variants" value={totalVariants} />
      <Card title="Stock Units" value={totalStock} />
      <Card title="Low Stock" value={lowStock} />
      <Card title="Out of Stock" value={outStock} />
    </div>
  );
}
