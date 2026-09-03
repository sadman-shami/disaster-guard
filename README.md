# Disaster Guard Bangladesh (দুর্যোগ সুরক্ষা)

Disaster Guard Bangladesh is a comprehensive, real-time crisis response, disaster monitoring, and resource logistics coordination platform tailored specifically for emergency management across Bangladesh (such as cyclone preparation in coastal belts, flood monitoring in the Sylhet and Sunamganj Haor basins, and urban rescue operations).

---

## 🚀 Key Features & Modules

1. **Live Crisis Feed & Incident Mapping**:
   - Real-time incident reporting and severity tracking across Bangladeshi administrative divisions and river basins (Sylhet, Chattogram, Feni, Kurigram, Dhaka, etc.).
   - Filter incidents by disaster type (Flood, Cyclone, Flash Flood, River Erosion, Urban Fire, Landslide) and urgency level (Critical, High, Moderate, Low).

2. **Emergency Resource Logistics & Depots**:
   - Track relief stock inventories across regional warehouses (e.g., Tejgaon Central Depot, Sylhet Divisional Hub, Chattogram Port Depot, Feni Relief Outpost).
   - Manage critical supplies including **Aquatabs water purification tablets**, **Oral Rehydration Saline (ORS)**, **dry food relief packs**, **diesel de-watering pumps**, and **geotextile embankment sandbags**.
   - Securely restricted to **Emergency Unit Leads (Responders)** and **Operations Admins**.

3. **Community Volunteer Portal**:
   - Mobilize and assign registered volunteers and first responders to high-risk zones.
   - Task dispatching, trust score verification, and contact coordination.

4. **Secure Role-Based Authentication & Protected Routes**:
   - **Sign In (`/signin`) & Sign Up (`/signup`)**: Fully functional authentication portal with demo account quick-access for testing.
   - **Protected Routes**:
     - `/admin`: Restricted exclusively to **Operations Admin** accounts.
     - `/resources`: Restricted to **Responders** and **Admins**.
   - **Header Logout**: Quick sign-out action in the top command header to securely switch user sessions.

---

## 🛠️ Technology Stack

- **Frontend**: React 18+, Vite, Tailwind CSS, Lucide React Icons.
- **Routing**: TanStack Router with SSR-compatible file-based routing.
- **State Management**: Zustand with persistent local state.
- **Build & Quality**: TypeScript, Biome linter, ESBuild.

---

## 📦 Getting Started & Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```
