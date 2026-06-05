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
        style Client fill:#e0f2fe,stroke:#0284c7,stroke-width:2px
        UI[Pages & Components]
        style UI fill:#7dd3fc,stroke:#0284c7,stroke-width:1px
        API_CLIENT[Axios API Layer]
        style API_CLIENT fill:#7dd3fc,stroke:#0284c7,stroke-width:1px
        AUTH_LS[localStorage Sessions]
        style AUTH_LS fill:#7dd3fc,stroke:#0284c7,stroke-width:1px
        MAP[Leaflet + OSRM Maps]
        style MAP fill:#7dd3fc,stroke:#0284c7,stroke-width:1px
    end

    subgraph Server["Spring Boot Backend"]
        style Server fill:#dcfce7,stroke:#16a34a,stroke-width:2px
        CTRL[REST Controllers]
        style CTRL fill:#86efac,stroke:#16a34a,stroke-width:1px
        SVC[Services]
        style SVC fill:#86efac,stroke:#16a34a,stroke-width:1px
        SEC[Spring Security + JWT Filter]
        style SEC fill:#86efac,stroke:#16a34a,stroke-width:1px
        CACHE[Spring Cache]
        style CACHE fill:#86efac,stroke:#16a34a,stroke-width:1px
        GEO[Geocoding Service]
        style GEO fill:#86efac,stroke:#16a34a,stroke-width:1px
        SSE[Booking SSE Stream]
        style SSE fill:#86efac,stroke:#16a34a,stroke-width:1px
    end

    subgraph External["External Services"]
        style External fill:#fef3c7,stroke:#d97706,stroke-width:2px
        MONGO[(MongoDB Atlas)]
        style MONGO fill:#fde68a,stroke:#d97706,stroke-width:1px
        RAZORPAY[Razorpay API]
        style RAZORPAY fill:#fde68a,stroke:#d97706,stroke-width:1px
        NOMINATIM[OpenStreetMap Nominatim]
        style NOMINATIM fill:#fde68a,stroke:#d97706,stroke-width:1px
        OSRM[OSRM Routing]
        style OSRM fill:#fde68a,stroke:#d97706,stroke-width:1px
        GROQ[Groq AI - Fare Suggestions]
        style GROQ fill:#fde68a,stroke:#d97706,stroke-width:1px
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
    state REQUESTED
    style REQUESTED fill:#fef3c7,stroke:#d97706,stroke-width:2px
    state CONFIRMED
    style CONFIRMED fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
    state BOOKED
    style BOOKED fill:#dcfce7,stroke:#16a34a,stroke-width:2px
    state ONGOING
    style ONGOING fill:#fce7f3,stroke:#ec4899,stroke-width:2px
    state COMPLETED
    style COMPLETED fill:#d1fae5,stroke:#10b981,stroke-width:2px
    state CANCELLED
    style CANCELLED fill:#fee2e2,stroke:#ef4444,stroke-width:2px

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
        style Roles fill:#f0f9ff,stroke:#0ea5e9,stroke-width:2px
        R[Rider / Customer]
        style R fill:#e0f2fe,stroke:#0284c7,stroke-width:2px
        DR[Driver]
        style DR fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
        AD[Admin]
        style AD fill:#fce7f3,stroke:#ec4899,stroke-width:2px
    end

    subgraph RiderFeatures
        style RiderFeatures fill:#ecfdf5,stroke:#10b981,stroke-width:2px
        R1[Register / Login]
        R2[Find Verified Drivers]
        R3[Create Booking]
        R4[Pay via Razorpay]
        R5[Track Ride + Map]
        R6[Rate Driver]
    end

    subgraph DriverFeatures
        style DriverFeatures fill:#fffbeb,stroke:#d97706,stroke-width:2px
        D1[Register - pending verification]
        D2[Accept / Decline Rides]
        D3[View Payment Status]
        D4[Start / Complete Trip]
        D5[Profile CRUD]
        D6[Earnings Analytics]
    end

    subgraph AdminFeatures
        style AdminFeatures fill:#fdf4ff,stroke:#9333ea,stroke-width:2px
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
    style APP fill:#fef3c7,stroke:#d97706,stroke-width:3px

    APP --> AUTH[auth/ - JWT, Admin, Driver login]
    style AUTH fill:#fce7f3,stroke:#ec4899,stroke-width:1px
    APP --> RIDER[rider/ - Customer accounts]
    style RIDER fill:#e0f2fe,stroke:#0284c7,stroke-width:1px
    APP --> DRIVER[driver/ - Driver accounts & availability]
    style DRIVER fill:#dbeafe,stroke:#3b82f6,stroke-width:1px
    APP --> BOOKING[booking/ - Rides, Razorpay, SSE]
    style BOOKING fill:#dcfce7,stroke:#16a34a,stroke-width:1px
    APP --> ADMIN[admin/ - Platform management]
    style ADMIN fill:#fdf4ff,stroke:#9333ea,stroke-width:1px
    APP --> RATING[rating/ - Driver reviews]
    style RATING fill:#fef3c7,stroke:#d97706,stroke-width:1px
    APP --> AI[ai/ - Groq fare suggestions]
    style AI fill:#fce7f3,stroke:#ec4899,stroke-width:1px
    APP --> CONFIG[config/ - Security, Cache, Geocoding, Exceptions]
    style CONFIG fill:#f0f9ff,stroke:#0ea5e9,stroke-width:1px
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
    style RIDERS fill:#e0f2fe,stroke:#0284c7,stroke-width:2px

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
    style DRIVERS fill:#dbeafe,stroke:#3b82f6,stroke-width:2px

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
    style BOOKINGS fill:#dcfce7,stroke:#16a34a,stroke-width:2px

    ADMINS {
        string id PK
        string username UK
        string passwordHash
    }
    style ADMINS fill:#fce7f3,stroke:#ec4899,stroke-width:2px

    RATINGS {
        string id PK
        string bookingId FK
        string driverId FK
        int rating
        string comment
    }
    style RATINGS fill:#fef3c7,stroke:#d97706,stroke-width:2px

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
    style REQ fill:#e0f2fe,stroke:#0284c7,stroke-width:1px
    style RL fill:#dbeafe,stroke:#3b82f6,stroke-width:1px
    RL --> JWT[JWT Authentication Filter]
    style JWT fill:#fef3c7,stroke:#d97706,stroke-width:2px
    JWT --> CTX{Role from JWT claim}
    style CTX fill:#fdf4ff,stroke:#9333ea,stroke-width:2px
    CTX -->|RIDER| RR[ROLE_RIDER]
    style RR fill:#e0f2fe,stroke:#0284c7,stroke-width:2px
    CTX -->|DRIVER| DR[ROLE_DRIVER]
    style DR fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
    CTX -->|ADMIN| AR[ROLE_ADMIN]
    style AR fill:#fce7f3,stroke:#ec4899,stroke-width:2px
    RR --> AUTHZ[Spring Security Authorization]
    DR --> AUTHZ
    AR --> AUTHZ
    style AUTHZ fill:#dcfce7,stroke:#16a34a,stroke-width:2px
    AUTHZ --> API[Protected Endpoints]
    style API fill:#f0f9ff,stroke:#0ea5e9,stroke-width:2px
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
    style A fill:#e0f2fe,stroke:#0284c7,stroke-width:2px
    style B fill:#dcfce7,stroke:#16a34a,stroke-width:2px
    B --> C[Nominatim API]
    style C fill:#fef3c7,stroke:#d97706,stroke-width:2px
    C --> D[Store lat/lng on Booking]
    style D fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
    D --> E[LeafletMap Component]
    style E fill:#fce7f3,stroke:#ec4899,stroke-width:2px
    E --> F{Coords missing?}
    style F fill:#fdf4ff,stroke:#9333ea,stroke-width:2px
    F -->|Yes| G[Frontend geocode fallback]
    style G fill:#f0f9ff,stroke:#0ea5e9,stroke-width:2px
    F -->|No| H[Render markers]
    style H fill:#d1fae5,stroke:#10b981,stroke-width:2px
    G --> H
    H --> I[OSRM fetch route geometry]
    style I fill:#fffbeb,stroke:#d97706,stroke-width:2px
    I --> J[Draw pickup → drop path on map]
    style J fill:#fef3c7,stroke:#d97706,stroke-width:2px
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
