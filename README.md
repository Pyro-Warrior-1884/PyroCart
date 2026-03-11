# PyroCart

A modern **full-stack e-commerce platform** built with a modular backend
and a responsive web frontend.\
PyroCart demonstrates how scalable online store systems are designed
using modern development tools, clean architecture, and secure
authentication.\
This project was created to try to mimic atleast a fraction of what a real world e-commerce website
would be in the modern age.\
It was a great expirence to work on this project and build it from scratch.

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
-   Vanilla CSS

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

```
PyroCart 
├── frontend\
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
```

------------------------------------------------------------------------

## Running the Project

### Prerequisites

Install the following:

-   Node.js
-   Docker
-   Docker Compose

------------------------------------------------------------------------

### 1. Clone the Repository

```
git clone https://github.com/Pyro-Warrior-1884/PyroCart 
cd PyroCart
```
------------------------------------------------------------------------

## Environment Configuration

Before running the project, create an environment file.

Create a file named:

```
.env.docker
```

Then copy and paste the following configuration into the file:

```
PORT=3000

POSTGRES_PORT=5432
POSTGRES_USER=ecommerce
POSTGRES_PASSWORD=ecommerce
POSTGRES_DB=ecommerce

DATABASE_URL=postgresql://ecommerce:ecommerce@postgres:5432/ecommerce

OPENSEARCH_NODE=http://opensearch:9200

REDIS_HOST=redis
REDIS_PORT=6379

JWT_SECRET=040b0fdbd127bf481596e724927289f8d080aa133c21bae23987b6aa89269437
JWT_EXPIRES_IN=7d
JWT_ACCESS_EXPIRES_IN=900
JWT_REFRESH_EXPIRES_SECONDS=604800

NEXT_PUBLIC_API_URL=http://backend:3000
```

Ensure the file is placed in the **root directory of the project**, alongside:

```
docker-compose.yml
Makefile
```

------------------------------------------------------------------------

### 2. Start Project
Note: Docker Desktop is mandatory to run this project

```
make run
```

This launches:

-   Frontend
-   Backend
-   PostgreSQL
-   Redis
-   OpenSearch

------------------------------------------------------------------------

### Shortcuts
To make the process of typing the commands much easier.
Add the make prefix to the keyword to forward to the given command.

```
down:
	docker compose down -v
```
Bring all the containers & volumes down.

```
logs:
	docker compose logs -f
```
Show the logs of docker.

```
run:
	docker compose down
	docker compose --env-file .env.docker up -d --build
```
Bring all the containers & volumes down and build and Compose up the project.

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

