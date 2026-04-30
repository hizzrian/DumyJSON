import { NextRequest, NextResponse } from 'next/server';
import { products, getNextId, applySort } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = parseInt(searchParams.get('skip') || '0');
  const category = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort');
  const order = searchParams.get('order');
  const select = searchParams.get('select')?.split(',');

  let result = [...products];

  if (category) {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (minPrice) {
    result = result.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    result = result.filter(p => p.price <= parseFloat(maxPrice));
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  result = applySort(result, sort, order) as typeof result;

  const total = result.length;
  const paginated = result.slice(skip, skip + limit);

  if (select) {
    const selected = paginated.map(product => {
      const filtered: Record<string, unknown> = {};
      select.forEach(field => {
        if (field in product) filtered[field] = product[field as keyof typeof product];
      });
      return filtered;
    });
    return NextResponse.json({ products: selected, total, skip, limit });
  }

  return NextResponse.json({ products: paginated, total, skip, limit });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newProduct = { id: getNextId(products), ...body };
    products.push(newProduct);
    return NextResponse.json(newProduct, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
