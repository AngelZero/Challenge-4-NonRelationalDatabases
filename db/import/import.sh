set -euo pipefail

DB_NAME="Challenge4-Tattler"
COLL="restaurants"

CSV_FILE="./db/import/restaurants.csv"
JSON_FILE="./db/import/restaurant_sample.json"

echo "==> [1/4] Importing JSON example into $DB_NAME.$COLL ..."
mongoimport \
  --db "$DB_NAME" \
  --collection "$COLL" \
  --file "$JSON_FILE"

echo "==> [2/4] Importing CSV rows into $DB_NAME.$COLL ..."
mongoimport \
  --db "$DB_NAME" \
  --collection "$COLL" \
  --type csv \
  --headerline \
  --file "$CSV_FILE"

echo "==> [3/4] Shaping ONLY CSV rows (build nested address + [lon,lat]) ..."
mongosh "$DB_NAME" --eval '
db.getSiblingDB("'"$DB_NAME"'").'"$COLL"'.updateMany(
  { lon: { $exists: true }, lat: { $exists: true } },
  [
    {
      $set: {
        _lonNum: { $convert: { input: "$lon", to: "double", onError: null, onNull: null } },
        _latNum: { $convert: { input: "$lat", to: "double", onError: null, onNull: null } }
      }
    },
    {
      $set: {
        address: {
          $mergeObjects: [
            { $ifNull: ["$address", {}] },
            {
              building: "$building",
              street: "$street",
              zipcode: "$zipcode",
              coord: {
                $cond: [
                  { $and: [ { $ne: ["$_lonNum", null] }, { $ne: ["$_latNum", null] } ] },
                  ["$_lonNum", "$_latNum"],
                  "$$REMOVE"
                ]
              }
            }
          ]
        }
      }
    },
    { $unset: ["building","street","zipcode","lon","lat","_lonNum","_latNum"] }
  ]
)
'

echo "==> [4/4] Creating 2dsphere index on address.coord (idempotent) ..."
mongosh "$DB_NAME" --eval '
db.getSiblingDB("'"$DB_NAME"'").'"$COLL"'.createIndex({ "address.coord": "2dsphere" })
'

echo "==> Done."
