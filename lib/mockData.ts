// Mock data generators for JSON API

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  phone: string;
  address: {
    address: string;
    city: string;
    state: string;
    stateCode: string;
    postalCode: string;
    country: string;
    coordinates: { lat: number; lng: number };
  };
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: Review[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: { createdAt: string; updatedAt: string; barcode: string; qrCode: string };
  images: string[];
  thumbnail: string;
}

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
  tags: string[];
  reactions: { likes: number; dislikes: number };
  views: number;
}

export interface Comment {
  id: number;
  postId: number;
  body: string;
  user: User;
}

export interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export interface Auth {
  id: number;
  username: string;
  email: string;
  token: string;
}

export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

// Data generators
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Beauty', 'Automotive'];
const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Dell', 'HP', 'Canon', 'Nikon'];
const tags = ['sale', 'new', 'featured', 'popular', 'trending', 'bestseller', 'limited'];

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number, decimals: number = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function generateUsers(count: number = 100): User[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    username: `${firstNames[i % firstNames.length].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}${i + 1}`,
    email: `${firstNames[i % firstNames.length].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}${i + 1}@example.com`,
    firstName: randomItem(firstNames),
    lastName: randomItem(lastNames),
    gender: randomItem(['male', 'female']),
    image: `https://i.pravatar.cc/150?u=${i + 1}`,
    phone: `+1-${randomInt(200, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
    address: {
      address: `${randomInt(100, 9999)} ${randomItem(['Main', 'Oak', 'Maple', 'Cedar', 'Pine'])} ${randomItem(['St', 'Ave', 'Blvd', 'Rd'])}`,
      city: randomItem(cities),
      state: randomItem(['California', 'Texas', 'Florida', 'New York', 'Illinois']),
      stateCode: randomItem(['CA', 'TX', 'FL', 'NY', 'IL']),
      postalCode: `${randomInt(10000, 99999)}`,
      country: 'United States',
      coordinates: { lat: randomFloat(-90, 90, 4), lng: randomFloat(-180, 180, 4) }
    }
  }));
}

export function generateProducts(count: number = 100): Product[] {
  const productTemplates = [
    { title: 'Wireless Headphones', desc: 'Premium noise-cancelling wireless headphones' },
    { title: 'Smart Watch', desc: 'Feature-rich smartwatch with health tracking' },
    { title: 'Laptop Stand', desc: 'Ergonomic aluminum laptop stand' },
    { title: 'Mechanical Keyboard', desc: 'RGB mechanical gaming keyboard' },
    { title: 'USB-C Hub', desc: '7-in-1 USB-C hub with HDMI and card reader' },
    { title: 'Portable Charger', desc: '20000mAh portable power bank' },
    { title: 'Bluetooth Speaker', desc: 'Waterproof portable bluetooth speaker' },
    { title: 'Webcam HD', desc: '1080p HD webcam with microphone' },
    { title: 'Gaming Mouse', desc: 'Wireless gaming mouse with RGB' },
    { title: 'Monitor Stand', desc: 'Dual monitor desk mount stand' }
  ];

  return Array.from({ length: count }, (_, i) => {
    const template = productTemplates[i % productTemplates.length];
    const category = randomItem(categories);
    const brand = randomItem(brands);

    return {
      id: i + 1,
      title: `${template.title} ${i + 1}`,
      description: `${template.desc}. Model ${i + 1} with enhanced features.`,
      category,
      price: randomFloat(19.99, 999.99),
      discountPercentage: randomFloat(0, 30),
      rating: randomFloat(3, 5, 1),
      stock: randomInt(0, 500),
      tags: Array.from({ length: randomInt(2, 5) }, () => randomItem(tags)),
      brand,
      sku: `SKU-${String(i + 1).padStart(5, '0')}`,
      weight: randomFloat(0.1, 5, 2),
      dimensions: { width: randomInt(5, 50), height: randomInt(5, 50), depth: randomInt(5, 50) },
      warrantyInformation: randomItem(['1 year', '2 years', '3 years', 'Limited lifetime']),
      shippingInformation: randomItem(['Ships in 1-2 days', 'Ships in 3-5 days', 'Ships in 1 week']),
      availabilityStatus: randomItem(['In Stock', 'Low Stock', 'Out of Stock', 'Pre-order']),
      reviews: Array.from({ length: randomInt(1, 10) }, () => ({
        rating: randomInt(1, 5),
        comment: randomItem(['Great product!', 'Good value', 'Excellent quality', 'Could be better', 'Highly recommend']),
        date: new Date(Date.now() - randomInt(0, 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reviewerName: `${randomItem(firstNames)} ${randomItem(lastNames)}`,
        reviewerEmail: `reviewer${randomInt(1, 1000)}@example.com`
      })),
      returnPolicy: randomItem(['30 days', '60 days', '90 days', 'No returns']),
      minimumOrderQuantity: randomInt(1, 10),
      meta: {
        createdAt: new Date(Date.now() - randomInt(0, 730) * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
        barcode: `${randomInt(100000000000, 999999999999)}`,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?data=product-${i + 1}`
      },
      images: [
        `https://picsum.photos/seed/product${i + 1}-1/400/400`,
        `https://picsum.photos/seed/product${i + 1}-2/400/400`,
        `https://picsum.photos/seed/product${i + 1}-3/400/400`
      ],
      thumbnail: `https://picsum.photos/seed/product${i + 1}/200/200`
    };
  });
}

export function generatePosts(count: number = 100): Post[] {
  const postTemplates = [
    { title: 'Getting Started with Next.js', body: 'Learn how to build modern web applications with Next.js framework...' },
    { title: 'TypeScript Best Practices', body: 'Discover the best practices for writing clean TypeScript code...' },
    { title: 'React Hooks Deep Dive', body: 'Understanding useEffect, useState, and custom hooks in React...' },
    { title: 'CSS Grid Layout Guide', body: 'Master CSS Grid with this comprehensive guide to modern layouts...' },
    { title: 'Node.js Performance Tips', body: 'Optimize your Node.js applications with these performance tips...' },
    { title: 'API Design Principles', body: 'Learn the fundamental principles of RESTful API design...' },
    { title: 'Database Optimization', body: 'Strategies for optimizing database queries and schema design...' },
    { title: 'Security Best Practices', body: 'Essential security practices for web application development...' },
    { title: 'Testing Strategies', body: 'Unit testing, integration testing, and E2E testing approaches...' },
    { title: 'DevOps Fundamentals', body: 'Introduction to CI/CD, containerization, and cloud deployment...' }
  ];

  return Array.from({ length: count }, (_, i) => {
    const template = postTemplates[i % postTemplates.length];
    return {
      id: i + 1,
      title: `${template.title} ${Math.floor(i / postTemplates.length) + 1}`,
      body: `${template.body} Part ${i + 1} of our series covers advanced topics and practical examples.`,
      userId: randomInt(1, 100),
      tags: Array.from({ length: randomInt(2, 5) }, () => randomItem(['tutorial', 'guide', 'tips', 'beginner', 'advanced', 'web-dev', 'programming'])),
      reactions: { likes: randomInt(0, 1000), dislikes: randomInt(0, 100) },
      views: randomInt(100, 50000)
    };
  });
}

export function generateTodos(count: number = 200): Todo[] {
  const todoTemplates = [
    'Complete project documentation',
    'Review pull requests',
    'Write unit tests',
    'Fix reported bugs',
    'Update dependencies',
    'Refactor legacy code',
    'Deploy to staging',
    'Code review meeting',
    'Sprint planning',
    'Update API documentation'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    todo: `${todoTemplates[i % todoTemplates.length]} ${Math.floor(i / todoTemplates.length) + 1}`,
    completed: Math.random() > 0.5,
    userId: randomInt(1, 100)
  }));
}

// Generate data
export const users = generateUsers(100);
export const products = generateProducts(100);
export const posts = generatePosts(100);
export const todos = generateTodos(200);

// Auth users for login
export const authUsers = [
  { id: 1, username: 'admin', email: 'admin@example.com', password: 'admin123' },
  { id: 2, username: 'user', email: 'user@example.com', password: 'user123' },
  ...users.slice(0, 10).map(u => ({ id: u.id, username: u.username, email: u.email, password: 'password123' }))
];
