# Disaster Guard — Emergency Management & Resource Allocation Platform

> > Disaster Guard platform engineered for rapid situational awareness, emergency logistics coordination, volunteer taskforce deployment, and multi-agency crisis command.

> > Configured with high-fidelity emergency response data for **Bangladesh**, including monsoon flash flood mitigation, cyclonic storm surge evacuation, riverbank erosion response, urban waterlogging management, and multi-purpose shelter operations.

> > For the project `Tanstack Start framework` has been used. It uses vite as a bundler. `Nitro` server has been used for routing, nitro can run on edge. This project mainly run on client side. So there is no use for `next.js` extensive caching which may improve performance but for the project `next.js` is not needed.

> > This app is featured with tab based routing. No external route has been used for routing.

---

## 🌟 Core Modules & Features

### 1. 🗺️ Interactive Tactical GIS Map (`/map`)

- **Real-Time Geospatial Visualizations**: Built with Leaflet to map critical incidents, emergency shelters, staging bases, and field hospitals.
- **Evacuation Zones & Danger Corridors**: Displays mandatory evacuation radiuses, prepare-to-evacuate perimeters, and safe passage corridors with interactive layer toggles.
- **Live SOS Distress Beacon**: One-click civilian emergency signal broadcaster that drops a high-priority distress marker on the command map.
- **Tactical Layer Controls**: Toggle active incident markers, shelter/depot capacities, hazard buffers, and environmental overlays.
- **Incident Inspector**: Click any marker to view casualties, urgent resource requests, assigned units, and launch rapid resource dispatches.

### 2. 📡 Real-Time Incident Feed (`/feed`)

- **Crowdsourced & Verified Reporting**: Submit ground reports with GPS coordinates, casualty numbers, urgent supply checklists, and landmark descriptions.
- **Trust & Corroboration Engine**: Community verification system calculating confidence scores based on peer confirmations and official responder badges.
- **Tactical Filtering & Search**: Filter by disaster hazard (Flood, Cyclone, Landslide/Erosion, Power Outage, Hazmat, Fire, Earthquake), severity tier (Critical, High, Moderate, Low), and verification status.
- **Field Updates Log**: Chronological thread of situational updates from local citizens and verified command officers.

### 3. 📦 Emergency Resource & Shelter Management (`/resources`)

- **National Depot & Shelter Roster**: Monitor occupancy rates, available beds, power generation backup, and amenities across relief hubs and cyclone shelters.
- **Critical Inventory Tracking**: Real-time stock level monitoring for water purification tablets (_Aquatabs_), oral rehydration saline (_ORS_), inflatable rescue speedboats (_Zodiac 40HP_), heavy diesel de-watering pumps, geotextile sandbags, and emergency VHF radios.
- **Automated Threshold Warnings**: Instant alerts for depots experiencing critical shortages or approaching full occupancy.
- **Resource Allocation & Dispatch Engine**: Transfer emergency assets from depots to active incidents with automated ETA calculations and live dispatch logs.
- **Commission New Depots**: Field commanders can commission new emergency shelters, logistics staging areas, or mobile field hospitals on the fly.

### 4. 🤝 Volunteer Corps & Taskforce Portal (`/volunteers`)

- **Specialized Team Rosters**: Coordinate rapid-response taskforces such as the _Cyclone Preparedness Programme (CPP)_, _BDRCS Haor Water Rescue Squad_, _Sylhet Emergency Medical Triage Corps_, and _FSCD Urban Search & Rescue (USAR)_.
- **Task Dispatch Board**: Create, assign, and track tactical missions (Search & Rescue, Medical Aid, Flood Sandbagging, Shelter Management, Relief Distribution).
- **Volunteer Onboarding & Skill Matching**: Register volunteers with specific skill tags, emergency contact details, certifications, and experience hours.
- **Field Check-In Logging**: Ground personnel can log milestone check-ins, survivor counts, and hazard notes directly on their assigned tasks.

### 5. 🛡️ Administrative Command Dashboard (`/admin`)

- **National OPCON Status Controller**: Switch operational readiness levels between _OPCON 4 (Normal Monitoring)_, _OPCON 3 (Elevated Watch)_, _OPCON 2 (High Alert)_, and _OPCON 1 (Maximum Red Alert)_.
- **Executive KPIs**: Real-time summary of active incidents, reported casualties, displaced individuals, critical inventory bottlenecks, and deployed personnel.
- **Visual Analytics**:
  - **Incident Influx & Resolution Curve**: Hourly trend area chart tracking incoming reports vs. resolved situations.
  - **Hazard Breakdown**: Distribution chart of active disaster types.
  - **Sector Fulfillment Rates**: Composed chart showing requested vs. dispatched supplies across regional command divisions.
- **Emergency Broadcast System**: Author and push emergency alerts with danger warnings, evacuation instructions, and geographic polygons.

---

## 👥 Multi-Role User Simulation

The header includes a **Role Switcher** allowing you to experience the application from 4 operational perspectives:

| Role                 | Profile                                  | Permissions & Capabilities                                                                                        |
| :------------------- | :--------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **Admin**            | Brig. Gen. Tanvir Ahmed (FSCD Command)   | Full access to OPCON level controls, global resource creation, emergency broadcasts, and executive analytics.     |
| **Responder**        | Capt. Mahmudur Rahman (BDRCS Lead)       | Dispatch resources, create and manage volunteer teams, launch rescue missions, and post verified updates.         |
| **Verified Citizen** | Dr. Nusrat Jahan (MBBS - Triage Lead)    | High trust rating (94%), auto-verified incident reports, submit field medical updates, and coordinate relief.     |
| **Citizen**          | Kazi Ashraful Islam (Community Reporter) | Report local incidents, activate SOS distress beacon, corroborate neighborhood reports, and join volunteer corps. |

---

## 🚀 How to Use the Application

### 1. Reporting an Emergency Incident

1. Click the **"Report Incident"** button in the header (or the floating action button on mobile).
2. Select the **Disaster Hazard Category** (e.g., _Flash Flood_, _Severe Cyclone_, _Riverbank Erosion_).
3. Set the **Severity Level** (_Critical_, _High_, _Moderate_, _Low_).
4. Provide a descriptive title, details of the situation, and specify casualties/affected counts.
5. Enter the location or click **"Use Device Location"** to fill GPS coordinates automatically.
6. Select required supplies from the **Urgent Supplies Checklist** (e.g., _Aquatabs_, _Rescue Boats_, _ORS_).
7. Click **"Broadcast Report to Command"**. The incident will instantly appear on both the **Interactive Map** and the **Live Feed**.

### 2. Dispatching Supplies to an Incident

1. Navigate to the **"Resources"** tab.
2. Under **Emergency Inventory**, locate the needed asset (e.g., _Water Purification Tablets_ or _Inflatable Speedboats_).
3. Click **"Allocate / Dispatch"** on the resource row.
4. Select the target **Incident** from the dropdown.
5. Enter the quantity to transfer and add dispatch notes.
6. Click **"Confirm Tactical Dispatch"**. Inventory levels will update immediately and a new entry will appear in the **Dispatch Logs**.

### 3. Creating & Assigning Volunteer Tasks

1. Navigate to the **"Volunteers"** tab.
2. Click **"Create Task"**.
3. Link the task to an active incident and select a specialized category (_Search & Rescue_, _Medical Aid_, _Sandbagging_, etc.).
4. Assign a **Volunteer Team** or specific individuals based on required skill tags.
5. Set the priority, deadline, and required volunteer headcount, then click **"Publish Task"**.

### 4. Issuing a National Emergency Broadcast (Admin Mode)

1. Switch your active role to **Admin (Brig. Gen. Tanvir Ahmed)** in the top header.
2. Navigate to the **"Command Operations"** tab (`/admin`).
3. Under the **Emergency Broadcast Center**, enter the warning title, danger level (_Extreme_, _Severe_, _Moderate_), headline, instructions, and affected districts.
4. Click **"Broadcast Alert"**. The alert banner will display globally across the tactical map and notification system.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Tanstack Start](https://tanstack.com/start) (Tanstack React Router, React 19)
- **Language**: TypeScript 5.8+
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with semantic color tokens and responsive grid design
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with client-side localStorage persistence
- **Geospatial Mapping**: [Leaflet](https://leafletjs.com/) & [React-Leaflet v5](https://react-leaflet.js.org/)
- **Data Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 💻 Local Development & Build

### Prerequisites

- Node.js 20+
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/sadman-shami/disaster-guard.git
cd disaster-guard

# Install dependencies
pnpm install
```

### Running the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Building for Production

```bash
# Run TypeScript compilation check
pnpm lint

# Build production bundle
pnpm build

# Start production server
pnpm preview
```

---

## 🗺️ Seeded Bangladesh Disaster Scenarios

The platform comes pre-populated with realistic humanitarian relief data across key Bangladesh divisions:

1. **Surma-Kushiyara Basin (Sunamganj & Sylhet)**: Flash flooding and embankment breach submerging rural villages, requiring boat extraction and Aquatabs distribution.
2. **Coastal Surge & Cyclone Corridor (Chattogram, Sandwip & Cox's Bazar)**: Category 4 storm surge threat triggering Signal 10 evacuation protocols into multi-purpose cyclone shelters.
3. **Muhuri & Gumti River Basin (Feni & Fulgazi)**: Sluice gate dyke overflow prompting community sandbagging and family tent setups.
4. **Jamuna River Bank Erosion (Kurigram & Chilmari)**: Massive bank collapse displacing char homesteads, supported by geotextile sandbag dumping operations.
5. **Urban Waterlogging & Grid Isolation (Mirpur, Dhaka)**: Monsoon stormwater inundation near electrical substations requiring heavy diesel de-watering pumps.
