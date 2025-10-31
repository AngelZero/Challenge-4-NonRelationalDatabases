# Challenge-4-NonRelationalDatabases

## Project Description

Tattler is a restaurant directory that will evolve into a **personalized, dynamic** experience.

* **Sprint 1** delivered the **MongoDB foundation** (database + collection, CSV import script, geospatial index, BSON dump, and educational docs).
* **Sprint 2** delivers a **REST API** with **Express.js + Mongoose** to manage restaurants and reviews (CRUD) and provides **tests in Postman** plus a lightweight **peer review** record.

---

## Installation & Usage

### 1) Prerequisites

* **Node.js (LTS)** and npm
* **MongoDB Database Tools** (`mongoimport`, `mongodump`, `mongorestore`)
* **MongoDB Shell** (`mongosh`) — used by the CSV import script
  Install on Windows (PowerShell):

  ```powershell
  winget install MongoDB.Shell
  ```
* (Optional) **MongoDB Compass** — visual DB inspection
* (Optional) **Studio 3T** — used in Sprint 1 to generate a BSON dump
* (Optional) **Postman** (for tests & docs) / **Insomnia** (alternative client)

Quick checks:

```bash
node -v
npm -v
mongoimport --version
mongodump --version
mongorestore --version
mongosh --version
```

---

### 2) Repository Structure

```
.
├─ db/
│  ├─ backup/
│  │  └─ Challenge4-Tattler/       # BSON dump (schema + data)
│  ├─ import/
│  │  ├─ import.sh                 # CSV import + shaping + 2dsphere index
│  │  ├─ restaurants.csv           # Minimal seed CSV (flat columns)
│  │  └─ restaurant_sample.json    # Single JSON sample row (NDJSON line)
│  └─ screenshots/                 # Proof: DB, collections, indexes, API tests
├─ docs/
│  ├─ peer-review.md               # Partial peer review (issues & fixes)
│  └─ postman/
│     ├─ tattler-sprint2.postman_collection.json
│     └─ tattler-sprint2.postman_doc.txt
├─ src/
│  ├─ controllers/
│  │  ├─ restaurants.controller.js
│  │  └─ reviews.controller.js
│  ├─ models/
│  │  ├─ restaurant.model.js
│  │  └─ review.model.js
│  ├─ routes/
│  │  ├─ restaurants.routes.js
│  │  ├─ restaurant-reviews.routes.js
│  │  └─ reviews.routes.js
│  ├─ app.js
│  └─ server.js
├─ .env                             # PORT, MONGODB_URI
└─ README.md
```

---

## Sprint 1 — Database Foundation (recap)

### Load seed data (CSV + JSON) — one command

```bash
bash ./db/import/import.sh
```

**What it does**

1. Imports `restaurant_sample.json` and `restaurants.csv` into `Challenge4-Tattler.restaurants`.
2. Shapes **only CSV rows** → builds `address{…}` and `address.coord: [lon, lat]` (numeric).
3. Creates (or reuses) a **2dsphere** index on `address.coord`.

**Verify in Compass (optional)**
DB `Challenge4-Tattler` → `restaurants` → **Indexes** tab.

### Backup & Restore (BSON dump)

Create:

```bash
mongodump --db Challenge4-Tattler --out ./db/backup/Challenge4-Tattler
```

Restore:

```bash
mongorestore --db Challenge4-Tattler ./db/backup/Challenge4-Tattler
```

---

## Sprint 2 — REST API (Express.js + Mongoose)

### 1) Configure environment

From repo root:

```bash
# If you have .env.example, copy it; otherwise create .env and set the vars.
# Example:
# PORT=3000
# MONGODB_URI=mongodb://localhost:27017/Challenge4-Tattler
```

### 2) Install & run

```bash
npm install
npm run dev
# API -> http://localhost:3000
```

If the server logs **“MongoDB connected”**, you’re set.

### 3) Endpoints (CRUD)

**Restaurants**

* `POST /restaurants` — create
* `GET /restaurants` — list (page, limit)
* `GET /restaurants/:id` — read one
* `PATCH /restaurants/:id` — update (partial)
* `PUT /restaurants/:id` — update (full)
* `DELETE /restaurants/:id` — delete

**Reviews**

* `POST /restaurants/:id/reviews` — create review for a restaurant
* `GET /restaurants/:id/reviews` — list reviews for a restaurant
* `PATCH /reviews/:reviewId` — update review
* `PUT /reviews/:reviewId` — update review (full)
* `DELETE /reviews/:reviewId` — delete review

**Notes**

* Validation returns **400** for bad input, **404** for missing ids, and appropriate success codes.
* `restaurants.ratingSummary` (**avg**, **count**) is recomputed when reviews change.

---

## Sprint 3 — Search, Sorting, and Area Features

### Endpoints
- `GET /restaurants/search?name=&borough=&cuisine=&zipcode=&minRating=&maxRating=&sort=&order=&page=&limit=`
  - `sort`: `name|cuisine|createdAt|rating`; `order`: `asc|desc`
- `GET /restaurants/within?neighborhood=Bedford`
  - Uses `neighborhoods.geometry.coordinates` and wraps them as `type: "Polygon"` for `$geoWithin`.
- `POST /restaurants/within`
  - Body: `{ "coordinates": [[[lon,lat], ...]] }`
- `GET /restaurants/near?lng=&lat=&maxDistanceMeters=&limit=`
  - Distance-sorted using `$geoNear` (requires the 2dsphere index on `restaurants.address.coord`, already present).

---

## Tests & Documentation

### Postman

1. Import: `docs/postman/tattler-sprint2.postman_collection.json` and `docs/postman/tattler-sprint3.postman_collection.json` 
2. Set `baseUrl` = `http://localhost:3000`
3. Run the collection. It will:

   * Create a restaurant → stores `restaurantId`
   * CRUD reviews → stores `reviewId`
   * Update/delete and verify status codes
   * Delete the restaurant and verify **404** afterwards

---

## Partial Peer Review (evidence)

We include a short, mid-sprint **peer review** at `docs/peer-review.md`.
It records a checklist, issues found, and the fixes (with commit references).

---

## Why a 2dsphere Index (educational note)

* An **index** lets MongoDB answer queries without scanning all documents.
* **2dsphere** indexes understand Earth geometry for area-based queries.
* We index **`address.coord`** (legacy `[lon, lat]`) to support Sprint 3 features.

Reference:

```js
db.restaurants.createIndex({ "address.coord": "2dsphere" })
```

---

## Versioning

We use **X.Y.Z**:

* **X (Major):** breaking or significant changes
* **Y (New Features):** features added
* **Z (Revisions):** fixes/patches


---

## Tools Used

* **MongoDB Compass** — visual DB management
* **Studio 3T** — BSON dump (schema + data)
* **MongoDB Shell (mongosh)** — used by CSV import script
* **MongoDB Database Tools** — `mongoimport`, `mongodump`, `mongorestore`
* **Express.js + Mongoose** — REST API (Sprint 2)
* **Postman** / **Insomnia** — tests and evidence

---

