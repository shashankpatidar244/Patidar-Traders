"use client"

export default function SummaryCards({ data }: any) {
  const totalProducts = new Set(data.map((v: any) => v.productId)).size
  const totalVariants = data.length
  const totalStock = data.reduce((sum: number, v: any) => sum + v.stock, 0)
  const lowStock = data.filter((v: any) => v.stock > 0 && v.stock < 10).length
  const outStock = data.filter((v: any) => v.stock === 0).length

  const Card = ({
    title,
    value,
  }: {
    title: string
    value: number
  }) => (
    <div className="relative rounded-2xl p-5 border bg-white shadow-sm hover:shadow-md transition">
      {/* subtle left color */}
      <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl`} />

      <p className="text-xs text-gray-500 mb-1 pl-2">
        {title}
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 pl-2">
        {value}
      </h2>
    </div>
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card title="Products" value={totalProducts}  />
      <Card title="Variants" value={totalVariants} />
      <Card title="Stock Units" value={totalStock}/>
      <Card title="Low Stock" value={lowStock}/>
      <Card title="Out of Stock" value={outStock}/>
    </div>
  )
}