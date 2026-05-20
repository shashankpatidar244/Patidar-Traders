import { NextResponse } from 'next/server'

export async function GET() {
  // TODO: Replace with real DB queries
//   const products = await prisma.orderItem.groupBy({
//     by: ['productId'],
//     _sum: {
//       quantity: true
//     },
//     orderBy: {
//       _sum: {
//         quantity: 'desc'
//       }
//     },
//     take: 5
//   })
//   productSales: products.map(p => ({
//     name: p.product.name,
//     sales: p._sum.quantity
//   }))

  return NextResponse.json({
    revenue: [
      { name: 'Jan', revenue: 4000 },
      { name: 'Feb', revenue: 3000 },
      { name: 'Mar', revenue: 5000 }
    ],
    orders: [
      { name: 'Jan', orders: 120 },
      { name: 'Feb', orders: 98 },
      { name: 'Mar', orders: 150 }
    ],
    users: [
      { name: 'Buyers', value: 400 },
      { name: 'Staff', value: 80 },
      { name: 'Admins', value: 20 }
    ],
    productSales: [
      { name: 'iPhone 15', sales: 220 },
      { name: 'Samsung S24', sales: 180 },
      { name: 'AirPods Pro', sales: 150 },
      { name: 'MacBook Air', sales: 95 }
    ]
  })
}