import { NextResponse } from 'next/server';

const quotes = [
  { id: 1, quote: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Inspiration" },
  { id: 2, quote: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "Life" },
  { id: 3, quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "Inspiration" },
  { id: 4, quote: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill", category: "Success" },
  { id: 5, quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "Motivation" },
  { id: 6, quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "Perseverance" },
  { id: 7, quote: "The only impossible journey is the one you never begin.", author: "Tony Robbins", category: "Motivation" },
  { id: 8, quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "Inspiration" },
  { id: 9, quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", category: "Wisdom" },
  { id: 10, quote: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs", category: "Life" },
  { id: 11, quote: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "Action" },
  { id: 12, quote: "Don't let yesterday take up too much of today.", author: "Will Rogers", category: "Motivation" },
  { id: 13, quote: "You learn more from failure than from success.", author: "Unknown", category: "Growth" },
  { id: 14, quote: "If you are working on something exciting that you really care about, you don't have to be pushed.", author: "Steve Jobs", category: "Passion" },
  { id: 15, quote: "Experience is a hard teacher because she gives the test first, the lesson afterwards.", author: "Vernon Law", category: "Wisdom" },
  { id: 16, quote: "Optimism is the faith that leads to achievement.", author: "Helen Keller", category: "Inspiration" },
  { id: 17, quote: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson", category: "Self" },
  { id: 18, quote: "Go confidently in the direction of your dreams.", author: "Henry David Thoreau", category: "Dreams" },
  { id: 19, quote: "Act as if what you do makes a difference. It does.", author: "William James", category: "Impact" },
  { id: 20, quote: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau", category: "Success" },
];

export async function GET() {
  return NextResponse.json({ quotes, total: quotes.length });
}
