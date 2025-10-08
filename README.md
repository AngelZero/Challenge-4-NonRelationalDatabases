# Challenge-4-NonRelationalDatabases

 ## Project Description

Tattler is a restaurant directory that will evolve into a **personalized, dynamic** experience.
In **Sprint 1**, the focus is to **lay the data foundation**:

* Initialize the **MongoDB** database and collection(s).
* Provide **repeatable data import** from **CSV** (plus a small JSON example).
* Create the **geospatial index** required for area-based queries used later.
* Deliver a **portable backup (dump)** and **clear documentation** so anyone can reproduce the environment.

---

(Sprint 1: Database Foundation)

A lightweight, reproducible database setup for the Tattler restaurant directory project.
This repository prepares the **MongoDB** foundation that later powers an **Express.js** REST API (Sprint 2) and search/area features (Sprint 3).

**What you’ll find here (Sprint 1):**

* A **MongoDB database** `Challenge4-Tattler` with the `restaurants` collection.
* A **CSV import script** to load seed data and shape it into the expected structure.
* A **2dsphere index** on `address.coord` (for geospatial queries later).
* A **backup (dump)** of schema + data for quick restore.
* **Screenshots** proving DB, collections, and index creation.

---

## Installation & Usage

### 1) Prerequisites

* **MongoDB Database Tools** (for `mongoimport`, `mongodump`, `mongorestore`)
* **MongoDB Shell** (`mongosh`) — used by the import script
  Install on Windows (PowerShell):

  ```powershell
  winget install MongoDB.Shell
  ```
* (Optional) **MongoDB Compass** — to visually inspect DB/collections/indexes
* (Optional) **Studio 3T** — used here to generate a BSON dump

> Quick checks:
>
> ```bash
> mongoimport --version
> mongodump --version
> mongorestore --version
> mongosh --version
> ```

---

### 2) Repository Structure

```
.
├─ db/
│  ├─ backup/
│  │  └─ Challenge4-Tattler/                # BSON dump (schema + data) generated in Sprint 1
│  ├─ import/
│  │  ├─ import.sh            # CSV import + shaping + index creation
│  │  ├─ restaurants.csv      # Minimal seed CSV (flat columns)
│  │  └─ restaurant_sample.json  # Single JSON sample row (NDJSON line)
│  └─ screenshots/            # Proof: DB, collections, indexes
├─ docs/
└─ README.md
```

---

### 3) Load seed data (CSV + JSON) — **one command**

From the repository root:

```bash
bash ./db/import/import.sh
```

What the script does:

1. Imports the **JSON sample** (`restaurant_sample.json`) into `Challenge4-Tattler.restaurants`.
2. Imports **CSV rows** (`restaurants.csv`) into the same collection.
3. **Shapes only CSV rows** into the expected structure:

   * Builds `address` as an embedded object
   * Builds `address.coord: [lon, lat]` (numeric)
   * Cleans up flat CSV columns
4. Creates (or reuses) a **2dsphere index** on `address.coord`.

> The script is safe/idempotent for the index and won’t overwrite the JSON example’s coordinates.

---

### 4) Verify in Compass (optional but recommended)

Open **MongoDB Compass** and check:

* Database: `Challenge4-Tattler`
* Collection: `restaurants`
* **Indexes** tab: a **2dsphere** index on `address.coord`
* Documents: `address` is embedded; `address.coord` is `[longitude, latitude]`

Take screenshots and save them under `db/screenshots/`.

---

### 5) Backup & Restore (BSON dump)

A BSON **dump (schema + data)** is included at `db/backup/Challenge4-Tattler/` (generated during Sprint 1 with Studio 3T).
You can also regenerate it locally with `mongodump`:

**Create dump (optional):**

```bash
mongodump --db Challenge4-Tattler --out ./db/backup/Challenge4-Tattler
```

**Restore:**

```bash
mongorestore --db Challenge4-Tattler ./db/backup/Challenge4-Tattler
```

This satisfies the “upload a database backup including collections and indexes” requirement.
(Indexes present at dump time are recreated by `mongorestore`.)

---

## How to Use This Repository (Sprint 1 workflow)

1. **Clone** the repo.
2. **Install prerequisites** (see above). Ensure `mongoimport`, `mongosh`, `mongodump`, `mongorestore` are available.
3. Run:

   ```bash
   bash ./db/import/import.sh
   ```
4. (Optional) Open **Compass** to explore data and confirm the **2dsphere** index.
5. Use `mongodump`/`mongorestore` if you want to regenerate/verify the backup.
6. Review `db/screenshots/` and `docs/master.md` for process evidence and notes.

---

## Why a 2dsphere Index (educational note)

* An **index** lets MongoDB find data efficiently without scanning every document.
* A **2dsphere** index specifically understands geographic coordinates on a sphere (Earth).
  It’s required for efficient queries like “restaurants **within** a given area.”
* We index **`address.coord`** (which stores `[longitude, latitude]`) to support Sprint 3’s geospatial features.

Command (already handled by the script, shown for reference):

```js
db.restaurants.createIndex({ "address.coord": "2dsphere" })
```

---

## Acknowledgements / Tools Used

* **MongoDB Compass** — visual database management
* **Studio 3T** — BSON dump (schema + data)
* **MongoDB Shell (mongosh)** — used inside the import script for post-import shaping & index creation
* **MongoDB Database Tools** — `mongoimport`, `mongodump`, `mongorestore`

---

### Common Commands (reference)

```bash
# Import CSV + JSON, shape docs, create index
bash ./db/import/import.sh

# Create dump (schema + data)
mongodump --db Challenge4-Tattler --out ./db/backup/Challenge4-Tattler

# Restore dump
mongorestore --db Challenge4-Tattler ./db/backup/Challenge4-Tattler
```



