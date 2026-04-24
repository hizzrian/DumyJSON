import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = parseInt(searchParams.get('skip') || '0');
  const category = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const select = searchParams.get('select')?.split(',');

  let result = [...products];

  // Apply filters
  if (category) {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (minPrice) {
    result = result.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    result = result.filter(p => p.price <= parseFloat(maxPrice));
  }

  const total = result.length;

  // Apply pagination
  const paginated = result.slice(skip, skip + limit);

  // Apply field selection
  if (select) {
    result = paginated.map(product => {
      const filtered: any = {};
      select.forEach(field => {
        if (field in product) filtered[field] = product[field as keyof typeof product];
      });
      return filtered;
    });
  } else {
    result = paginated;
  }

  return NextResponse.json({ products: result, total, skip, limit });
}
