import { NextResponse } from 'next/server';

const team = [
  { id: 1, name: "Terry", role: "Founder", email: "terry@jsonmock.dev", image: "https://i.pravatar.cc/150?u=1" },
  { id: 2, name: "Madison", role: "CTO", email: "madison@jsonmock.dev", image: "https://i.pravatar.cc/150?u=2" },
  { id: 3, name: "Quincy", role: "Lead Developer", email: "quincy@jsonmock.dev", image: "https://i.pravatar.cc/150?u=3" },
  { id: 4, name: "Emma", role: "Designer", email: "emma@jsonmock.dev", image: "https://i.pravatar.cc/150?u=4" },
  { id: 5, name: "Elias", role: "Backend Developer", email: "elias@jsonmock.dev", image: "https://i.pravatar.cc/150?u=5" },
  { id: 6, name: "Cora", role: "Frontend Developer", email: "cora@jsonmock.dev", image: "https://i.pravatar.cc/150?u=6" },
  { id: 7, name: "Yvonne", role: "QA Engineer", email: "yvonne@jsonmock.dev", image: "https://i.pravatar.cc/150?u=7" },
  { id: 8, name: "Ervin", role: "DevOps Engineer", email: "ervin@jsonmock.dev", image: "https://i.pravatar.cc/150?u=8" },
];

export async function GET() {
  return NextResponse.json({ team, total: team.length });
}
