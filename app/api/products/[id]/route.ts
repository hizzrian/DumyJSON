import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/lib/mockData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = products.find(p => p.id === parseInt(id));

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const select = searchParams.get('select')?.split(',');

  if (select) {
    const filtered: Record<string, unknown> = {};
    select.forEach(field => {
      if (field in product) filtered[field] = product[field as keyof typeof product];
    });
    return NextResponse.json(filtered);
  }

  return NextResponse.json(product);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = products.findIndex(p => p.id === parseInt(id));

  if (idx === -1) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    products[idx] = { ...body, id: parseInt(id) };
    return NextResponse.json(products[idx]);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = products.findIndex(p => p.id === parseInt(id));

  if (idx === -1) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    products[idx] = { ...products[idx], ...body, id: parseInt(id) };
    return NextResponse.json(products[idx]);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = products.findIndex(p => p.id === parseInt(id));

  if (idx === -1) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const [deleted] = products.splice(idx, 1);
  return NextResponse.json(deleted);
}
