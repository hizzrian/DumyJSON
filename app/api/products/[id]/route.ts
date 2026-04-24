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
    const filtered: any = {};
    select.forEach(field => {
      if (field in product) filtered[field] = product[field as keyof typeof product];
    });
    return NextResponse.json(filtered);
  }

  return NextResponse.json(product);
}
