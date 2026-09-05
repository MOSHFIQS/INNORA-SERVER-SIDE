# 🏨 INNORA Hotel Management System — Backend API (NestJS + Prisma)

Welcome to the **INNORA Backend API**, an enterprise-grade hospitality management system built with **NestJS**, **Prisma ORM**, and **PostgreSQL**. Designed with clean modular architecture, multi-role access control, secure HttpOnly cookie session management, and interactive Swagger documentation.

---

## 🌟 Key Architecture & Highlights

- 🏗️ **Enterprise Modular NestJS Architecture** — Strict separation of concerns with Controllers, Services, DTOs, Interfaces, Guards, Interceptors, and Filters.
- 🔐 **Dual Authentication & Session Management** — Seamless **JWT HttpOnly Cookies** (`authToken`) with fallback support for `Bearer` header tokens.
- 🛡️ **Role-Based Access Control (RBAC)** — Granular route authorization via `@Roles()`, `RolesGuard`, and `@CurrentUser()` decorators supporting `SUPER_ADMIN`, `ADMIN`, `STAFF`, and `CUSTOMER`.
- 🗄️ **Prisma ORM & PostgreSQL** — High-performance relational database with isolated `schema=innora` containing full data models for users, rooms, reservations, reviews, inquiries, audit logs, and settings.
- 📊 **Real-time Hospitality Analytics** — Administrative dashboard metrics for revenue tracking, suite occupancy rates, 6-month revenue trends, and booking statuses.
- 📚 **Swagger OpenAPI 3.0 Documentation** — Live interactive API documentation with tag grouping and direct test execution.
- 🛡️ **Global Interceptors & Error Handling** — Uniform API envelope `{ success: true, message: string, data: T }` and comprehensive database/HTTP exception handling.
- ☁️ **Media Uploads** — Cloudinary integration for multipart image uploads.

---

## 🗂️ Project Directory Structure

```
INNORA-SERVER-SIDE/
├── prisma/
│   ├── schema.prisma        # PostgreSQL schema definition (schema=innora)
│   ├── seed-data.ts         # Realistic hotel suite, banner, user seed script
├── src/
│   ├── auth/                # JWT Auth, Bcrypt hashing, HttpOnly cookie logic, Guards
│   ├── rooms/               # Luxury suites catalog, filtering, slugs, availability
│   ├── bookings/            # Reservations, date collision prevention, check-in/out
│   ├── reviews/             # Guest reviews, ratings aggregation, moderation
│   ├── dashboard/           # Admin analytics, occupancy rates, customer metrics
│   ├── inquiries/           # Guest contact messages and banquet inquiries
│   ├── users/               # Staff and user management, role assignments
│   ├── settings/            # Hotel settings, amenities, homepage carousel banners
│   ├── cloudinary/          # Multipart image upload service
│   ├── audit-log/           # Security and operational audit log
│   ├── common/              # PrismaService, TransformInterceptor, GlobalExceptionFilter
│   ├── app.module.ts        # Root module configuration
│   ├── health.controller.ts # System & DB latency health check
│   └── main.ts              # NestJS bootstrap, Helmet, CORS, Swagger setup
├── package.json
└── tsconfig.json
```

---

## 📚 API Endpoints Summary

Base URL: `http://localhost:5000/api/v1`  
Interactive Swagger Docs: `http://localhost:5000/api-docs`  
Health Check: `http://localhost:5000/health`

### 🔐 Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register a new customer account |
| `POST` | `/auth/login` | Public | Authenticate user & issue HttpOnly cookie |
| `POST` | `/auth/logout` | Authenticated | Clear authentication cookie |
| `GET` | `/auth/me` | Authenticated | Get current authenticated user profile |
| `PATCH`| `/auth/profile` | Authenticated | Update user profile details |
| `POST` | `/auth/change-password` | Authenticated | Update account password |

### 🏨 Rooms & Suites (`/api/v1/rooms`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/rooms` | Public | List hotel rooms with search, price & guest filters |
| `GET` | `/rooms/featured` | Public | Get featured luxury suites for homepage |
| `GET` | `/rooms/:id` | Public | Get single room by UUID, MongoDB ID, or slug |
| `POST` | `/rooms` | Admin / Staff | Create a new room suite |
| `PATCH`| `/rooms/:id` | Admin / Staff | Update suite details, price, or amenities |
| `PATCH`| `/rooms/:id/availability` | Admin / Staff | Toggle room availability status |
| `DELETE`| `/rooms/:id` | Admin | Soft delete a room |

### 📅 Bookings & Reservations (`/api/v1/bookings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/bookings` | Authenticated | Reserve a suite (with date conflict check) |
| `GET` | `/bookings/my` | Authenticated | Get logged-in user's booking history |
| `GET` | `/bookings/:id` | Authenticated | Get specific booking details |
| `PATCH`| `/bookings/:id/reschedule` | Authenticated | Change reservation dates |
| `POST` | `/bookings/:id/cancel` | Authenticated | Cancel a reservation |
| `GET` | `/bookings` | Admin / Staff | List all hotel reservations (with status filter) |
| `PATCH`| `/bookings/:id/status` | Admin / Staff | Update booking status (`CONFIRMED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`) |

### 📊 Dashboard & Analytics (`/api/v1/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/admin` | Admin / Staff | Total revenue, occupancy rate, 6-month trends, recent bookings |
| `GET` | `/dashboard/customer` | Customer | Total stays, confirmed bookings, total spent |

### ⭐ Reviews (`/api/v1/reviews`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/reviews/room/:roomId` | Public | Get reviews for a specific room |
| `POST` | `/reviews` | Authenticated | Submit guest review & recalculate room rating |
| `GET` | `/reviews` | Admin / Staff | View all reviews for moderation |
| `DELETE`| `/reviews/:id` | Admin | Delete / moderate a review |

### ✉️ Inquiries (`/api/v1/inquiries`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/inquiries` | Public | Submit contact message or banquet inquiry |
| `GET` | `/inquiries` | Admin / Staff | View all guest inquiries |
| `PATCH`| `/inquiries/:id` | Admin / Staff | Update inquiry status (`PENDING`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) |

### 👥 Users & Roles (`/api/v1/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | SuperAdmin / Admin | List all registered users and staff |
| `PATCH`| `/users/:id/role` | SuperAdmin | Update user role (`STAFF`, `ADMIN`, `SUPER_ADMIN`) |
| `PATCH`| `/users/:id/status` | Admin | Activate or deactivate an account |

### ⚙️ Settings & Banners (`/api/v1/settings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/settings` | Public | Get hotel site configuration and active banners |
| `GET` | `/settings/banners` | Public | Get homepage carousel slides |
| `PATCH`| `/settings` | Admin | Update hotel branding, policies, and contacts |
| `POST` | `/settings/banners` | Admin | Add new banner slide |
| `DELETE`| `/settings/banners/:id` | Admin | Remove banner slide |

---

## ⚙️ Environment Configuration

Create a `.env` file in `INNORA-SERVER-SIDE/`:

```env
# Application Settings
PORT=5000
NODE_ENV=development
API_PREFIX=api/v1
CORS_ORIGIN=http://localhost:3000

# PostgreSQL Database (using isolated 'innora' schema)
DATABASE_URL="postgresql://username:password@localhost:5432/innora_db?schema=innora"

# JWT Secret & Expiry
JWT_SECRET=super-secret-jwt-key-for-innora-luxury-hotel
JWT_EXPIRES_IN=7d

# Cloudinary Media Storage (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client & Push Database Schema
```bash
npx prisma generate
npx prisma db push
```

### 3. Seed Realistic Luxury Hotel Data
```bash
npm run prisma:seed
```

### 4. Run the Development Server
```bash
npm run start:dev
```

Server will start on `http://localhost:5000/api/v1`.  
Explore Swagger Documentation at `http://localhost:5000/api-docs`.

---

## 🔑 Default Seeded Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@innora.com` | `Admin@123456` | Full platform control, user roles, settings, revenue |
| **Admin** | `admin@innora.com` | `Admin@123456` | Inventory, reservations, reviews & inquiries |
| **Staff** | `staff@innora.com` | `Staff@123456` | Front-desk check-in, check-out & booking assistance |
| **Customer** | `customer@innora.com` | `Customer@123456` | Guest bookings, suite reservations & review submission |

---

## 📜 License
This project is licensed under the **MIT License**.
