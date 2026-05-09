# PyroCart

A full-stack modern eCommerce platform built using Next.js, NestJS, PostgreSQL, Prisma, Redis, and OpenSearch.

PyroCart provides a scalable shopping experience with authentication, cart management, order processing, reviews, role-based access control, and search functionality.

---

# Features

## Authentication & Authorization
- JWT-based authentication
- User registration and login
- Refresh token handling
- Role-based access control (Admin/User)
- Protected routes using guards and decorators

## Product Management
- CRUD operations for products
- Product categories
- Product search functionality
- Admin product controls
- OpenSearch integration for fast search indexing

## Shopping Cart
- Add, remove, and update cart items
- Persistent cart handling
- Quantity management
- Checkout workflow

## Order System
- Create and manage orders
- Admin order status updates
- Order tracking
- Checkout success flow

## Reviews & Ratings
- Product review system
- Rating validation
- Update and delete reviews

## Performance & Infrastructure
- Redis caching support
- OpenSearch integration
- Prisma ORM
- Dockerized environment
- Modular NestJS architecture

---

# Tech Stack

## Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

## Backend
- NestJS
- Prisma ORM
- PostgreSQL
- Redis
- OpenSearch
- JWT Authentication

## DevOps
- Docker
- Docker Compose

---

# Project Structure

```bash
PyroCart/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── services/
│   └── lib/
│
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── product/
│   │   ├── cart/
│   │   ├── order/
│   │   ├── review/
│   │   ├── user/
│   │   ├── prisma/
│   │   ├── redis/
│   │   └── opensearch/
│   │
│   └── prisma/
│
├── docker-compose.yml
└── README.md
```

---

# Installation

## Clone the Repository

```bash
git clone https://github.com/Pyro-Warrior-1884/PyroCart.git
cd PyroCart
```

---

# Environment Variables

## Backend `.env`

```env
DATABASE_URL=postgresql://postgres_user:postgres_password@localhost:5432/ecommerce
JWT_SECRET=your_secret_key

REDIS_HOST=localhost
REDIS_PORT=6379

OPENSEARCH_HOST=localhost
OPENSEARCH_PORT=9200
```

## Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

# Running with Docker

```bash
docker-compose up --build
```

This starts:
- PostgreSQL
- Redis
- OpenSearch
- Backend API
- Frontend application

---

# Backend Setup

```bash
cd backend
npm install
```

## Generate Prisma Client

```bash
npx prisma generate
```

## Run Database Migrations

```bash
npx prisma migrate dev
```

## Seed Database

```bash
npm run seed
```

## Start Backend Server

```bash
npm run start:dev
```

Backend URL:

```bash
http://localhost:3000
```

---

# Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```bash
http://localhost:4000
```

---

# API Modules

| Module | Description |
|---|---|
| Auth | Login, registration, JWT authentication |
| Products | Product CRUD and search |
| Categories | Product categorization |
| Cart | Cart management |
| Orders | Order creation and tracking |
| Reviews | Product reviews |
| Users | User profile and admin controls |
| Redis | Cache layer |
| OpenSearch | Search indexing |

---

# Authentication Flow

PyroCart uses:
- JWT access tokens
- Refresh tokens
- Role guards
- Public route decorators

---

# Search System

OpenSearch is integrated for:
- Product indexing
- Fast searching
- Scalable search operations

---

# Architecture Overview

```text
Frontend (Next.js)
        │
        ▼
Backend API (NestJS)
        │
 ┌──────┼─────────┐
 ▼      ▼         ▼
Postgres Redis OpenSearch
```

---

# Core Backend Modules

## Auth Module
Handles:
- User authentication
- JWT token generation
- Login and logout
- Refresh tokens

## Product Module
Handles:
- Product CRUD
- Categories
- Product search
- Admin product controls

## Cart Module
Handles:
- Add to cart
- Update quantity
- Remove products
- Retrieve user cart

## Order Module
Handles:
- Order creation
- Order tracking
- Admin order management
- Order status updates

---

# Frontend Highlights

## Shop UI
- Product browsing
- Product cards
- Category navigation
- Responsive layouts

## Checkout Flow
- Success page
- Order confirmation
- Cart integration

## Admin Components
- Delete confirmation modal
- Status management
- Product administration

---

# Testing

```bash
npm run test
npm run test:e2e
```

---

# Future Improvements

- Payment gateway integration
- Wishlist support
- Email notifications
- Social login
- Better analytics dashboard
- Image upload optimization
- Elasticsearch/OpenSearch enhancements

---

# Contributing

```bash
git checkout -b feature/amazing-feature
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
```

---

# License

This project is licensed under the MIT License.

---

# Author

Developed by Pyro Warrior

GitHub Repository:
https://github.com/Pyro-Warrior-1884/PyroCart
