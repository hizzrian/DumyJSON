import { NextResponse } from 'next/server';

const reviews = [
  { id: 1, productId: 1, rating: 5, comment: "Excellent product! Highly recommended.", reviewerName: "John Doe", reviewerEmail: "john@example.com", date: "2026-04-20" },
  { id: 2, productId: 1, rating: 4, comment: "Good value for money.", reviewerName: "Jane Smith", reviewerEmail: "jane@example.com", date: "2026-04-18" },
  { id: 3, productId: 2, rating: 5, comment: "Amazing quality and fast shipping!", reviewerName: "Bob Wilson", reviewerEmail: "bob@example.com", date: "2026-04-15" },
  { id: 4, productId: 3, rating: 3, comment: "It's okay, but could be better.", reviewerName: "Alice Brown", reviewerEmail: "alice@example.com", date: "2026-04-12" },
  { id: 5, productId: 4, rating: 4, comment: "Great product, fast delivery.", reviewerName: "Charlie Davis", reviewerEmail: "charlie@example.com", date: "2026-04-10" },
  { id: 6, productId: 5, rating: 5, comment: "Perfect! Exactly what I needed.", reviewerName: "Diana Evans", reviewerEmail: "diana@example.com", date: "2026-04-08" },
  { id: 7, productId: 6, rating: 2, comment: "Not as described. Disappointed.", reviewerName: "Edward Fox", reviewerEmail: "edward@example.com", date: "2026-04-05" },
  { id: 8, productId: 7, rating: 4, comment: "Good product overall.", reviewerName: "Fiona Green", reviewerEmail: "fiona@example.com", date: "2026-04-02" },
];

export async function GET() {
  return NextResponse.json({ reviews, total: reviews.length });
}
