# PyroCart

A modern **full-stack e-commerce platform** built with a modular backend
and a responsive web frontend.\
PyroCart demonstrates how scalable online store systems are designed
using modern development tools, clean architecture, and secure
authentication.

------------------------------------------------------------------------

## Overview

PyroCart is a complete shopping platform that allows users to:

-   Create an account
-   Browse products
-   Add items to a cart
-   Place orders
-   View order history

Administrators can:

-   Create and edit products
-   Manage users
-   Update order status
-   Monitor store activity

The system separates responsibilities between the **frontend interface**
and **backend services**, allowing the application to scale efficiently.

------------------------------------------------------------------------

## System Architecture

User → Frontend (Next.js) → Backend API (NestJS) → Database / Cache /
Search

Infrastructure Components:

-   PostgreSQL --- primary database
-   Redis --- caching layer
-   OpenSearch --- product search engine

------------------------------------------------------------------------

## Technology Stack

### Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS

### Backend

-   NestJS
-   TypeScript
-   Prisma ORM
-   JWT Authentication

### Infrastructure

-   PostgreSQL
-   Redis
-   OpenSearch
-   Docker Compose

------------------------------------------------------------------------

## Features

### User Features

-   Account registration and login
-   Secure JWT authentication
-   Product browsing and category filtering
-   Product search
-   Add products to cart
-   Manage cart quantities
-   Checkout and order creation
-   View order history

### Admin Features

-   Create products
-   Edit product details
-   Delete products
-   Manage orders
-   View all users
-   Update order status

Role‑based access control ensures that only administrators can perform
administrative actions.

------------------------------------------------------------------------

## Project Structure

PyroCart ├── frontend\
│ ├── app\
│ │ ├── components\
│ │ ├── services\
│ │ ├── shop\
│ │ └── auth\
│ └── styles

├── backend\
│ ├── src\
│ │ ├── auth\
│ │ ├── product\
│ │ ├── cart\
│ │ ├── order\
│ │ ├── review\
│ │ ├── redis\
│ │ └── prisma

└── docker-compose.yml

------------------------------------------------------------------------

## Running the Project

### Prerequisites

Install the following:

-   Node.js
-   Docker
-   Docker Compose

------------------------------------------------------------------------

### 1. Clone the Repository

git clone https://github.com/Pyro-Warrior-1884/PyroCart cd PyroCart

------------------------------------------------------------------------

### 2. Start Infrastructure

docker-compose up

This launches:

-   PostgreSQL
-   Redis
-   OpenSearch

------------------------------------------------------------------------

### 3. Start Backend

cd backend\
npm install\
npm run start

The backend API server will start.

------------------------------------------------------------------------

### 4. Start Frontend

cd frontend\
npm install\
npm run dev

The application will be available in your browser.

------------------------------------------------------------------------

## Authentication

PyroCart uses **JWT authentication**.

When a user logs in:

1.  Credentials are verified by the backend
2.  A JWT access token is generated
3.  The frontend stores the token
4.  All protected API requests include the token

Role-based guards protect admin endpoints.

------------------------------------------------------------------------

## Development Principles

This project follows modern engineering practices:

-   Modular backend architecture
-   Clean separation of frontend and backend
-   Type-safe development with TypeScript
-   DTO validation
-   Secure authentication
-   Scalable infrastructure

------------------------------------------------------------------------

## Future Improvements

Potential enhancements:

-   Payment gateway integration
-   Real-time order tracking
-   Recommendation system
-   Cloud image storage
-   GraphQL API
-   Mobile app version

------------------------------------------------------------------------

## Contributing

Contributions are welcome.

Steps:

1.  Fork the repository
2.  Create a new branch
3.  Commit changes
4.  Open a pull request

