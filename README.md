# logiroute-ai

> AI-Powered Delivery Planning, Dark Store Micro-Fulfillment & Cold-Chain Logistics Platform.

---

## 🚀 Overview

**LogiRoute AI** is an intelligent end-to-end quick-commerce and delivery planning engine. It integrates customer ordering, real-time dark store pick-and-pack routing, dynamic AI delivery fleet dispatching, live IoT cold-chain temperature monitoring, and interactive 3D storefront experiences.

### Key Capabilities

- **Customer Quick-Commerce Storefront**: Hyper-realistic 3D visual assets, temperature-state badges (`Hot & Fresh`, `Chilled 4°C`, `Frozen -18°C`), dynamic category filtering, and one-click cart management.
- **Live 3D Delivery Tracking**: Interactive map canvas, 4-stage live progression steps (Order Placed ➔ Hub Packing ➔ Rider Dispatched ➔ Arrived), and dynamic countdown ETA.
- **Rider Partner Mobile HUD**: Live shift manager, real-time turn-by-turn route optimization, delivery proof capture, and cold-chain compliance alerts.
- **Dark Store Control Tower**: Real-time batching algorithms, multi-order routing, inventory sync, and operational health telemetry.
- **Self-Healing Multi-Port Architecture**: Automated conflict detection with graceful failover across local and remote ports.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Canvas 3D rendering.
- **Backend**: Node.js, Express, Prisma ORM, SQLite.
- **Real-Time Communications**: Server-Sent Events (SSE) / WebSocket state syncing.
- **Cold-Chain IoT Simulation**: Automated temperature telemetry and threshold safety warnings.

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/pdeekshithareddy938-debug/logiroute-ai.git
cd logiroute-ai

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
npx prisma generate
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Running Locally
Run both backend and frontend concurrently:
```bash
node start-local.js
```
Or start each service individually:
- **Backend**: `npm run dev:backend` (default: http://localhost:5000)
- **Frontend**: `npm run dev:frontend` (default: http://localhost:5173)

---

## 📄 License
ISC © LogiRoute AI Team
