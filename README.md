# LocalCab

A comprehensive, rural-first mobility platform designed to bridge the gap between rural taxi service providers and local commuters. LocalCab streamlines the ride-hailing experience through a robust, triple-role architecture (Rider, Driver, and Admin).

## Vision
LocalCab is engineered to provide a transparent, efficient, and reliable transport ecosystem for communities where traditional ride-sharing platforms are unavailable. By facilitating direct connections between local drivers and riders, we empower local economies and simplify mobility.

## Core Features

### Rider Experience
*   **Hyper-Local Search:** Discover available taxis by searching via Pincode or Village/City name.
*   **Seamless Booking:** Intuitive one-tap booking flow with automated session management.
*   **Transparent Pricing:** Fair fare negotiation directly with drivers, assisted by AI-driven suggestions.
*   **Driver Discovery:** Browse verified driver profiles, vehicle types, and real-time availability.

### Driver Portal
*   **Dashboard Management:** Full control over availability (Go Online/Offline).
*   **Real-time Request Feed:** Live tracking of incoming ride requests with pickup/drop details.
*   **Journey Tracking:** Stage-by-stage trip management (Confirm -> Start -> Complete).
*   **Earnings & Ratings:** Integrated stats to track monthly performance and customer feedback.

### Admin Suite
*   **Platform Oversight:** Holistic dashboard showing system-wide statistics and active journeys.
*   **Driver Verification:** Manual approval workflow to ensure only legitimate drivers enter the network.
*   **User Management:** Centralized database management for both the driver fleet and rider base.
*   **Security Controls:** Ability to block/unblock accounts to maintain platform integrity.

## Technical Stack

* **Backend:** Java 17, Spring Boot 3.x, Spring Security (JWT-based Stateless Auth)
* **AI Integration:** Spring AI with Groq LLM
* **Database:** MongoDB (Cloud Atlas) for flexible, document-driven data storage
* **Frontend:** React 18, TailwindCSS, Vite
* **Architecture:** RESTful API with distinct role-based access control (RBAC)
---
*Developed by Mahesh Shinde*
