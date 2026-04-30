# DumyJSON — Mock REST API

A self-hosted mock REST API for testing and prototyping. Provides pre-built endpoints for common data types plus a dynamic custom endpoint system.

## Getting Started

### 1. Configure Supabase

Edit `lib/config.ts` and fill in your Supabase credentials:

```ts
export const supabaseConfig = {
  url: 'https://YOUR_PROJECT.supabase.co',
  publishableKey: 'YOUR_SUPABASE_PUBLISHABLE_KEY',
  serviceRoleKey: 'YOUR_SUPABASE_SERVICE_ROLE_KEY',
};
```

Run the SQL schema in your Supabase SQL Editor:

```bash
# Copy the contents of supabase-schema.sql and run it in Supabase
```

### 2. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the API documentation.

| Page | URL |
|------|-----|
| API Docs | http://localhost:3000 |
| API Playground | http://localhost:3000/playground |
| Admin Dashboard | http://localhost:3000/admin |

---

## API Reference

### Rate Limiting

All `/api/*` endpoints are rate-limited to **60 requests per minute** per IP.

Rate limit headers are included on every response:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1700000000
```

When the limit is exceeded, the API returns `429 Too Many Requests` with a `Retry-After` header.

You can change the limit in `lib/config.ts`:

```ts
export const rateLimitConfig = {
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 60,
};
```

---

### Authentication

#### POST /api/auth/login

```json
{ "username": "admin", "password": "admin123" }
```

Pre-configured accounts:

| Username | Password |
|----------|----------|
| `admin` | `admin123` |
| `user` | `user123` |
| any generated username | `password123` |

---

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Replace user |
| PATCH | `/api/users/:id` | Partially update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/users/:id/posts` | Posts by user |
| GET | `/api/users/:id/todos` | Todos by user |

**Query parameters — GET /api/users**

| Param | Description | Example |
|-------|-------------|---------|
| `limit` | Number of results (default: 10) | `?limit=20` |
| `skip` | Number to skip (default: 0) | `?skip=10` |
| `search` | Search firstName, lastName, email, username | `?search=john` |
| `sort` | Field to sort by | `?sort=firstName` |
| `order` | `asc` or `desc` (default: asc) | `?order=desc` |
| `select` | Comma-separated fields to return | `?select=id,email` |

---

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Replace product |
| PATCH | `/api/products/:id` | Partially update product |
| DELETE | `/api/products/:id` | Delete product |

**Query parameters — GET /api/products**

| Param | Description | Example |
|-------|-------------|---------|
| `limit` | Number of results (default: 10) | `?limit=20` |
| `skip` | Offset (default: 0) | `?skip=10` |
| `category` | Filter by category | `?category=Electronics` |
| `minPrice` | Minimum price | `?minPrice=50` |
| `maxPrice` | Maximum price | `?maxPrice=500` |
| `search` | Search title, description, brand, category | `?search=wireless` |
| `sort` | Field to sort by | `?sort=price` |
| `order` | `asc` or `desc` | `?order=asc` |
| `select` | Comma-separated fields | `?select=id,title,price` |

---

### Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List posts |
| GET | `/api/posts/:id` | Get post by ID |
| POST | `/api/posts` | Create post |
| PUT | `/api/posts/:id` | Replace post |
| PATCH | `/api/posts/:id` | Partially update post |
| DELETE | `/api/posts/:id` | Delete post |
| GET | `/api/posts/:id/comments` | Comments on a post |

**Query parameters — GET /api/posts**

| Param | Description | Example |
|-------|-------------|---------|
| `limit` | Number of results (default: 10) | `?limit=5` |
| `skip` | Offset (default: 0) | `?skip=20` |
| `tag` | Filter by tag | `?tag=tutorial` |
| `search` | Search title and body | `?search=typescript` |
| `sort` | Field to sort by | `?sort=views` |
| `order` | `asc` or `desc` | `?order=desc` |

---

### Todos

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | List todos |
| GET | `/api/todos/:id` | Get todo by ID |
| POST | `/api/todos` | Create todo |
| PUT | `/api/todos/:id` | Replace todo |
| PATCH | `/api/todos/:id` | Partially update todo |
| DELETE | `/api/todos/:id` | Delete todo |

**Query parameters — GET /api/todos**

| Param | Description | Example |
|-------|-------------|---------|
| `limit` | Number of results (default: 10) | `?limit=20` |
| `skip` | Offset (default: 0) | `?skip=0` |
| `userId` | Filter by user ID | `?userId=5` |
| `completed` | Filter by status | `?completed=true` |
| `search` | Search todo text | `?search=deploy` |
| `sort` | Field to sort by | `?sort=id` |
| `order` | `asc` or `desc` | `?order=asc` |

---

### Other Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments` | List all comments |
| GET | `/api/quotes` | List quotes |
| GET | `/api/reviews` | List reviews |
| GET | `/api/carts` | List carts |
| GET | `/api/team` | List team members |

---

### Custom Endpoints

Create and manage dynamic endpoints via the Admin Dashboard (`/admin`).

Supported HTTP methods: GET, POST, PUT, PATCH, DELETE

**Response template variables:**

| Variable | Description |
|----------|-------------|
| `{{now}}` | Current ISO timestamp |
| `{{method}}` | Request method |
| `{{path}}` | Request path |
| `{{body}}` | Request body (JSON) |
| `{{query.paramName}}` | Query parameter value |

**Example template:**
```json
{
  "message": "Hello!",
  "received_at": "{{now}}",
  "echo": "{{body}}"
}
```

Options per endpoint: custom status code, response delay (ms), activate/deactivate toggle.

---

## Configuration

All configuration lives in `lib/config.ts`:

```ts
export const supabaseConfig = {
  url: '...',
  publishableKey: '...',
  serviceRoleKey: '...',
};

export const rateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 60,
};
```

---

## Project Structure

```
app/
  api/
    auth/login/       POST /api/auth/login
    users/            GET, POST /api/users
      [id]/           GET, PUT, PATCH, DELETE /api/users/:id
        posts/        GET /api/users/:id/posts
        todos/        GET /api/users/:id/todos
    products/         GET, POST /api/products
      [id]/           GET, PUT, PATCH, DELETE /api/products/:id
    posts/            GET, POST /api/posts
      [id]/           GET, PUT, PATCH, DELETE /api/posts/:id
        comments/     GET /api/posts/:id/comments
    todos/            GET, POST /api/todos
      [id]/           GET, PUT, PATCH, DELETE /api/todos/:id
    comments/         GET /api/comments
    quotes/           GET /api/quotes
    reviews/          GET /api/reviews
    carts/            GET /api/carts
    team/             GET /api/team
    custom/[...path]  Dynamic custom endpoints
  admin/              Admin dashboard
  playground/         API Playground UI
lib/
  config.ts           App configuration
  mockData.ts         Mock data + CRUD helpers
  supabase.ts         Supabase clients
middleware.ts         Rate limiting
supabase-schema.sql   Database schema
```

---

## Scripts

```bash
npm run dev    # Start development server (port 3000)
npm run build  # Production build
npm start      # Run production server
npm run lint   # Run ESLint
```
