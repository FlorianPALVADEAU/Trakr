#!/usr/bin/env python3
"""Push the Garmin CSVs written by garmin_sync.py to Supabase (Mac, after each sync).

Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TRAKR_USER_ID, TRAKR_DATA_DIR
Run: python3 scripts/garmin_push.py   (stdlib only)
"""
import csv, json, os, urllib.request

URL = os.environ["SUPABASE_URL"].rstrip("/")
KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
UID = os.environ["TRAKR_USER_ID"]
DATA = os.environ["TRAKR_DATA_DIR"]

def num(v, cast=float):
    return None if v in (None, "") else cast(v)

def upsert(table, rows, conflict):
    req = urllib.request.Request(
        f"{URL}/rest/v1/{table}?on_conflict={conflict}",
        data=json.dumps(rows).encode(), method="POST",
        headers={"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
                 "Prefer": "resolution=merge-duplicates,return=minimal"},
    )
    urllib.request.urlopen(req).read()

def read(name):
    with open(os.path.join(DATA, name), newline="") as f:
        return list(csv.DictReader(f))

daily = [{
    "user_id": UID, "date": r["date"], "sleep_start": r["sleep_start"] or None, "sleep_end": r["sleep_end"] or None,
    "sleep_hours": num(r["sleep_hours"]), "sleep_score": num(r["sleep_score"], int), "deep_min": num(r["deep_min"], int),
    "rem_min": num(r["rem_min"], int), "resting_hr": num(r["resting_hr"], int), "hrv_ms": num(r["hrv_ms"], int),
    "hrv_status": r["hrv_status"] or None, "body_battery_morning": num(r["body_battery_morning"], int),
    "stress_avg": num(r["stress_avg"], int), "steps": num(r["steps"], int), "training_readiness": num(r["training_readiness"], int),
} for r in read("daily-metrics.csv")]
acts = [{
    "user_id": UID, "activity_id": int(r["activity_id"]), "date": r["date"], "type": r["type"], "name": r["name"],
    "duration_min": num(r["duration_min"]), "distance_km": num(r["distance_km"]), "avg_hr": num(r["avg_hr"], lambda x: int(float(x))),
    "max_hr": num(r["max_hr"], lambda x: int(float(x))), "calories": num(r["calories"], lambda x: int(float(x))),
    "training_effect": num(r["training_effect"], lambda x: round(float(x), 1)),
} for r in read("activities.csv")]
upsert("garmin_daily", daily, "user_id,date")
upsert("garmin_activities", acts, "user_id,activity_id")
upsert("garmin_connections", [{"user_id": UID, "status": "active", "last_sync_at": __import__("datetime").datetime.utcnow().isoformat() + "Z", "last_error": None}], "user_id")
print(f"pushed {len(daily)} days, {len(acts)} activities")
