# LocalCab

A rural-first cab booking platform connecting local drivers with customers across villages and small towns in India. LocalCab supports three roles - **Customer (Rider)**, **Driver**, and **Admin** - with JWT authentication, Razorpay payments, live booking tracking, and admin driver verification.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Booking & Payment Flow](#booking--payment-flow)
3. [System Components](#system-components)
4. [Database Design](#database-design)
5. [Security Model](#security-model)
6. [Maps & Geocoding](#maps--geocoding)
7. [Caching Strategy](#caching-strategy)
8. [Project Structure](#project-structure)
9. [Getting Started](#getting-started)

---

## Architecture Overview

```mermaid
flowchart TB
    subgraph Client["React Frontend (Vite + Tailwind)"]
        UI[Pages & Components]
        API_CLIENT[Axios API Layer]
        AUTH_LS[localStorage Sessions]
        MAP[Leaflet + OSRM Maps]
    end

    subgraph Server["Spring Boot Backend"]
        CTRL[REST Controllers]
        SVC[Services]
        SEC[Spring Security + JWT Filter]
        CACHE[Spring Cache]
        GEO[Geocoding Service]
        SSE[Booking SSE Stream]
    end

    subgraph External["External Services"]
        MONGO[(MongoDB Atlas)]
        RAZORPAY[Razorpay API]
        NOMINATIM[OpenStreetMap Nominatim]
        OSRM[OSRM Routing]
        GROQ[Groq AI - Fare Suggestions]
    end

    UI --> API_CLIENT --> SEC --> CTRL --> SVC
    SVC --> MONGO
    SVC --> RAZORPAY
    SVC --> GEO --> NOMINATIM
    MAP --> NOMINATIM
    MAP --> OSRM
    SSE --> UI
    SVC --> CACHE
```

---

## Booking & Payment Flow

The ride lifecycle enforces payment **after driver acceptance** and **before the trip starts**.

```mermaid
stateDiagram-v2
    [*] --> REQUESTED: Customer creates booking
    REQUESTED --> CONFIRMED: Driver accepts
    REQUESTED --> CANCELLED: Driver/Rider cancels
    CONFIRMED --> BOOKED: Customer pays via Razorpay
    CONFIRMED --> CANCELLED: Cancelled before payment
    BOOKED --> ONGOING: Driver starts trip
    ONGOING --> COMPLETED: Driver completes trip
    COMPLETED --> [*]
    CANCELLED --> [*]

    note right of REQUESTED
        Driver notified via dashboard + SSE
    end note
    note right of CONFIRMED
        Customer sees "Pay via Razorpay"
        Driver sees "Awaiting payment"
    end note
    note right of BOOKED
        Payment info sent to driver via SSE
        Ride is fully booked
    end note
```

### Sequence: End-to-End Ride

```mermaid
sequenceDiagram
    participant C as Customer
    participant FE as React App
    participant BE as Spring Boot
    participant D as Driver
    participant RZ as Razorpay

    C->>FE: Book ride (pickup, drop, fare)
    FE->>BE: POST /api/bookings
    BE->>BE: Geocode pickup & drop (Nominatim)
    BE-->>FE: status=REQUESTED
    BE-->>D: SSE booking-update

    D->>BE: PATCH status=CONFIRMED
    BE-->>FE: status=CONFIRMED
    BE-->>C: SSE — "Pay Now"

    C->>BE: POST /razorpay-order
    BE->>RZ: Create order
    RZ-->>C: Checkout modal
    C->>BE: POST /razorpay-verify
    BE-->>FE: status=BOOKED, payment=COMPLETED
    BE-->>D: SSE — payment received

    D->>BE: PATCH status=ONGOING
    D->>BE: PATCH status=COMPLETED
```

---

## System Components

### Role Architecture

```mermaid
graph LR
    subgraph Roles
        R[Rider / Customer]
        DR[Driver]
        AD[Admin]
    end

    subgraph RiderFeatures
        R1[Register / Login]
        R2[Find Verified Drivers]
        R3[Create Booking]
        R4[Pay via Razorpay]
        R5[Track Ride + Map]
        R6[Rate Driver]
    end

    subgraph DriverFeatures
        D1[Register - pending verification]
        D2[Accept / Decline Rides]
        D3[View Payment Status]
        D4[Start / Complete Trip]
        D5[Profile CRUD]
        D6[Earnings Analytics]
    end

    subgraph AdminFeatures
        A1[Admin Login - DB backed]
        A2[Pending Driver Verifications]
        A3[Verify / Block Drivers]
        A4[View All Bookings & Riders]
        A5[Platform Stats]
    end

    R --> RiderFeatures
    DR --> DriverFeatures
    AD --> AdminFeatures
```

### Backend Modules

```mermaid
graph TD
    APP[LocalCabApplication]

    APP --> AUTH[auth/ - JWT, Admin, Driver login]
    APP --> RIDER[rider/ - Customer accounts]
    APP --> DRIVER[driver/ - Driver accounts & availability]
    APP --> BOOKING[booking/ - Rides, Razorpay, SSE]
    APP --> ADMIN[admin/ - Platform management]
    APP --> RATING[rating/ - Driver reviews]
    APP --> AI[ai/ - Groq fare suggestions]
    APP --> CONFIG[config/ - Security, Cache, Geocoding, Exceptions]
```

---

## Database Design

MongoDB collections (document store):

```mermaid
erDiagram
    RIDERS {
        string id PK
        string fullName
        string phoneNumber UK
        string passwordHash
        string village
        string pincode
    }

    DRIVERS {
        string id PK
        string fullName
        string phoneNumber UK
        string passwordHash
        string village
        string pincode
        string vehicleType
        string vehicleNumber
        boolean available
        boolean verified
    }

    BOOKINGS {
        string id PK
        string driverId FK
        string riderId FK
        string pickupVillage
        string dropLocation
        double pickupLatitude
        double pickupLongitude
        double dropLatitude
        double dropLongitude
        double agreedFare
        enum status
        string paymentStatus
        string razorpayOrderId
        string razorpayPaymentId
    }

    ADMINS {
        string id PK
        string username UK
        string passwordHash
    }

    RATINGS {
        string id PK
        string bookingId FK
        string driverId FK
        int rating
        string comment
    }

    DRIVERS ||--o{ BOOKINGS : accepts
    RIDERS ||--o{ BOOKINGS : creates
    DRIVERS ||--o{ RATINGS : receives
```

### Booking Status Enum

| Status | Meaning |
|--------|---------|
| `REQUESTED` | Customer submitted; awaiting driver |
| `CONFIRMED` | Driver accepted; awaiting Razorpay payment |
| `BOOKED` | Payment received; ride fully booked |
| `ONGOING` | Driver started the trip |
| `COMPLETED` | Trip finished |
| `CANCELLED` | Cancelled by rider or driver |

---

## Security Model

```mermaid
flowchart LR
    REQ[HTTP Request] --> RL[Rate Limit Filter - disabled in dev]
    RL --> JWT[JWT Authentication Filter]
    JWT --> CTX{Role from JWT claim}
    CTX -->|RIDER| RR[ROLE_RIDER]
    CTX -->|DRIVER| DR[ROLE_DRIVER]
    CTX -->|ADMIN| AR[ROLE_ADMIN]
    RR --> AUTHZ[Spring Security Authorization]
    DR --> AUTHZ
    AR --> AUTHZ
    AUTHZ --> API[Protected Endpoints]
```

- **JWT** stateless sessions with role claim (`RIDER`, `DRIVER`, `ADMIN`)
- **BCrypt** password hashing for riders, drivers, and admins
- **Admin** seeded in MongoDB from `application.properties` on startup
- **CORS** restricted to localhost dev origins
- **Ownership checks** on profile updates and payments
- **Rate limiting** (10 req/min) available but commented out for development

---

## Maps & Geocoding

```mermaid
flowchart TD
    A[Customer enters pickup & drop villages] --> B[Backend GeocodingService]
    B --> C[Nominatim API]
    C --> D[Store lat/lng on Booking]
    D --> E[LeafletMap Component]
    E --> F{Coords missing?}
    F -->|Yes| G[Frontend geocode fallback]
    F -->|No| H[Render markers]
    G --> H
    H --> I[OSRM fetch route geometry]
    I --> J[Draw pickup → drop path on map]
```

- Maps center on the **actual cities/villages** entered by the customer
- Route line drawn via **OSRM** public routing API (falls back to straight line)
- Live driver marker shown during `ONGOING` trips

---

## Caching Strategy

| Cache Name | Data | Evicted On |
|------------|------|------------|
| `availableDrivers` | Verified online drivers by query | Driver verify/block/profile change |
| `driverProfile` | Driver by ID | Profile update |
| `riderProfile` | Rider by ID | — |
| `adminStats` | Platform statistics | Driver verify/block |
| `pendingDrivers` | Unverified driver list | Driver verify/block |

---

## Project Structure

```
LocalCab/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Navbar, LeafletMap, Footer
│   │   ├── pages/             # Dashboards, Booking, Auth
│   │   └── utils/             # api.js, auth.js, geocoding.js, bookingHelpers.js
│   └── package.json
├── server/                    # Spring Boot backend
│   └── src/main/java/com/mahesh/LocalCab/
│       ├── auth/              # JWT, login controllers
│       ├── rider/             # Customer module
│       ├── driver/            # Driver module
│       ├── booking/           # Bookings, Razorpay, SSE
│       ├── admin/             # Admin module + AdminUser entity
│       ├── rating/            # Reviews
│       ├── ai/                # Fare suggestions
│       └── config/            # Security, cache, geocoding, exceptions
└── README.md
```

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- MongoDB Atlas (or local MongoDB)
- Razorpay test keys
- Groq API key (optional, for AI fare suggestions)

### Backend

```bash
cd server
# Configure src/main/resources/application.properties (see below)
mvn spring-boot:run
```

Server runs at `http://localhost:8080`

### Frontend

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`

### Test Accounts

| Role | How to access |
|------|---------------|
| Customer | Register at `/register` → Login at `/login` |
| Driver | Register at `/register` (Driver tab) → Admin must verify |
| Admin | `/admin/login` — credentials from `application.properties` |

---

## Analytics (Dashboards)

### Customer Dashboard
- Total bookings, active rides, paid rides, total spent
- Live map with pickup/drop route for active booking
- Razorpay payment when status = `CONFIRMED`

### Driver Dashboard
- Rating summary, Razorpay earnings, active/pending counts
- Accept → wait for payment → start → complete workflow
- Profile CRUD (name, village, vehicle details)

### Admin Dashboard
- Pending verifications inbox
- Verify drivers before they appear to customers
- Platform stats: drivers, bookings, pending count

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS, React Router 6, Axios, Leaflet |
| Backend | Java 17, Spring Boot 3.3, Spring Security, Spring Data MongoDB |
| Auth | JWT (jjwt), BCrypt |
| Payments | Razorpay Java SDK |
| Maps | OpenStreetMap, Nominatim, OSRM |
| AI | Spring AI + Groq (Llama 3) |
| Database | MongoDB Atlas |
| Real-time | Server-Sent Events (SSE) |

---

Built for rural India — transparent fares, verified local drivers, and community-first mobility.
