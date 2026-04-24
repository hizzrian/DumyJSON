import { NextResponse } from 'next/server';

const carts = [
  {
    id: 1,
    userId: 1,
    products: [
      { productId: 1, title: "Wireless Headphones 1", price: 79.99, quantity: 2 },
      { productId: 5, title: "USB-C Hub 1", price: 49.99, quantity: 1 }
    ],
    total: 209.97
  },
  {
    id: 2,
    userId: 2,
    products: [
      { productId: 3, title: "Laptop Stand 1", price: 59.99, quantity: 1 },
      { productId: 8, title: "Webcam HD 1", price: 89.99, quantity: 1 }
    ],
    total: 149.98
  },
  {
    id: 3,
    userId: 3,
    products: [
      { productId: 2, title: "Smart Watch 1", price: 199.99, quantity: 1 },
      { productId: 4, title: "Mechanical Keyboard 1", price: 129.99, quantity: 1 },
      { productId: 7, title: "Bluetooth Speaker 1", price: 69.99, quantity: 2 }
    ],
    total: 469.96
  },
];

export async function GET() {
  return NextResponse.json({ carts, total: carts.length });
}
