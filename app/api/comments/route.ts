import { NextResponse } from 'next/server';
import { users } from '@/lib/mockData';

const comments = [
  { id: 1, postId: 1, body: "Great article! Very helpful for beginners.", likes: 24, user: users[0] },
  { id: 2, postId: 1, body: "Thanks for sharing this information.", likes: 12, user: users[1] },
  { id: 3, postId: 2, body: "Could you elaborate more on this topic?", likes: 8, user: users[2] },
  { id: 4, postId: 3, body: "This is exactly what I was looking for!", likes: 31, user: users[3] },
  { id: 5, postId: 4, body: "Well written and easy to understand.", likes: 19, user: users[4] },
  { id: 6, postId: 5, body: "I disagree with some points but overall good content.", likes: 5, user: users[5] },
  { id: 7, postId: 2, body: "Bookmarked for future reference!", likes: 15, user: users[6] },
  { id: 8, postId: 6, body: "Looking forward to more articles like this.", likes: 22, user: users[7] },
];

export async function GET() {
  return NextResponse.json({ comments, total: comments.length });
}
