import os
from datetime import datetime, timedelta, timezone

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from services.pro_analysis_engine import run_pro_engine
from analysis_engine import analyze_match, tolerans_rehberi


load_dotenv()
API_KEY = os.getenv("ODDS_API_KEY")

app = FastAPI(title="Vibe Analiz API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://oran-analiz-rho.vercel.app",
	],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SPORT_KEYS = {
    "Premier League": "soccer_epl",
    "Championship": "soccer_efl_champ",
    "La Liga": "soccer_spain_la_liga",
    "Bundesliga": "soccer_germany_bundesliga",
    "Serie A": "soccer_italy_serie_a",
    "Ligue 1": "soccer_france_ligue_one",
    "Süper Lig": "soccer_turkey_super_league",
    "Hollanda": "soccer_netherlands_eredivisie",
    "Belçika": "soccer_belgium_first_div",
    "Portekiz": "soccer_portugal_primeira_liga",
    "Şampiyonlar Ligi": "soccer_uefa_champs_league",
    "Avrupa Ligi": "soccer_uefa_europa_league",
    "Konferans Ligi": "soccer_uefa_europa_conference_league",
    "MLS": "soccer_usa_mls",
    "Brezilya Serie A": "soccer_brazil_campeonato",
    "Japonya J League": "soccer_japan_j_league",
    "Meksika Liga MX": "soccer_mexico_ligamx",
    "Güney Kore K League 1": "soccer_korea_kleague1",
}


def iso_window(date_mode: str = "today"):
    now = datetime.now(timezone.utc)

    if date_mode == "tomorrow":
        start = now + timedelta(days=1)
    elif date_mode == "2days":
        start = now + timedelta(days=2)
    elif date_mode == "3days":
        start = now + timedelta(days=3)
    else:
        start = now

    end = start + timedelta(days=1)

    return (
        start.replace(hour=0, minute=0, second=0, microsecond=0).isoformat().replace("+00:00", "Z"),
        end.replace(hour=0, minute=0, second=0, microsecond=0).isoformat().replace("+00:00", "Z"),
    )


def pick_market(bookmakers, market_key):
    for bookmaker in bookmakers:
        for market in bookmaker.get("markets", []):
            if market.get("key") == market_key:
                return market.get("outcomes", [])
    return []


def outcome_price(outcomes, name):
    item = next((o for o in outcomes if o.get("name") == name), None)
    return item.get("price") if item else None


def parse_totals(outcomes):
    over25 = None
    under25 = None

    for o in outcomes:
        name = str(o.get("name", "")).lower()
        point = o.get("point")

        if point == 2.5 and name == "over":
            over25 = o.get("price")

        if point == 2.5 and name == "under":
            under25 = o.get("price")

    return over25, under25


def normalize_game(game, league_name):
    bookmakers = game.get("bookmakers", [])
    if not bookmakers:
        return None

    home = game.get("home_team")
    away = game.get("away_team")
    if not home or not away:
        return None

    h2h = pick_market(bookmakers, "h2h")
    totals = pick_market(bookmakers, "totals")
    btts = pick_market(bookmakers, "btts")

    home_odds = outcome_price(h2h, home)
    away_odds = outcome_price(h2h, away)
    draw_odds = outcome_price(h2h, "Draw")

    if not home_odds or not away_odds or not draw_odds:
        return None

    over25, under25 = parse_totals(totals)

    btts_yes = outcome_price(btts, "Yes")
    btts_no = outcome_price(btts, "No")

    commence_time = game.get("commence_time", "")

    return {
        "id": game.get("id"),
        "home_team": home,
        "away_team": away,
        "league": league_name,
        "commence_time": commence_time,
        "time": commence_time[11:16] if len(commence_time) >= 16 else "-",

        "home_odds": home_odds,
        "draw_odds": draw_odds,
        "away_odds": away_odds,

        "over25_odds": over25,
        "under25_odds": under25,
        "btts_yes_odds": btts_yes,
        "btts_no_odds": btts_no,

        "h": home_odds,
        "b": draw_odds,
        "a": away_odds,
    }


def fetch_sport_odds(sport_key, league_name, date_mode="today"):
    start_iso, end_iso = iso_window(date_mode)

    url = f"https://api.the-odds-api.com/v4/sports/{sport_key}/odds"

    params = {
        "apiKey": API_KEY,
        "regions": "eu",
        "markets": "h2h,totals",
        "oddsFormat": "decimal",
        "dateFormat": "iso",
        "commenceTimeFrom": start_iso,
        "commenceTimeTo": end_iso,
    }

    res = requests.get(url, params=params, timeout=20)

    if res.status_code != 200:
        return {
            "league": league_name,
            "error": res.json() if "application/json" in res.headers.get("content-type", "") else res.text,
        }

    data = res.json()

    if not isinstance(data, list):
        return {
            "league": league_name,
            "error": data,
        }

    matches = []
    for game in data:
        normalized = normalize_game(game, league_name)
        if normalized:
            matches.append(normalized)

    return {
        "league": league_name,
        "matches": matches,
    }


@app.get("/")
def home():
    return {"message": "Vibe Analiz API çalışıyor"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/tolerans-rehberi")
def get_tolerans_rehberi(tolerans: float = 0.08):
    return tolerans_rehberi(tolerans)


@app.post("/analyze")
def analyze(data: dict):
    return analyze_match(data)


@app.get("/matches")
def get_matches(
    date: str = Query("today"),
    leagues: str = Query("Premier League"),
):
    if not API_KEY:
        return {"error": "ODDS_API_KEY bulunamadı. .env dosyasını kontrol et."}

    requested_leagues = [x.strip() for x in leagues.split(",") if x.strip()]

    all_matches = []
    errors = []

    for league_name in requested_leagues:
        sport_key = SPORT_KEYS.get(league_name)

        if not sport_key:
            errors.append({
                "league": league_name,
                "error": "Bu lig için sport_key tanımlı değil.",
            })
            continue

        result = fetch_sport_odds(sport_key, league_name, date)

        if "error" in result:
            errors.append(result)
            continue

        all_matches.extend(result.get("matches", []))

    return {
        "total_matches": len(all_matches),
        "matches": all_matches,
        "errors": errors,
    }


@app.get("/scanner/daily")
def daily_scanner(
    date: str = Query("today"),
    leagues: str = Query("Premier League"),
    tolerans: float = Query(0.08),
):
    data = get_matches(date=date, leagues=leagues)

    if "error" in data:
        return data

    matches = data.get("matches", [])

    if not matches:
        return {
            "total_matches": 0,
            "top_matches": [],
            "errors": data.get("errors", []),
        }

    result = run_pro_engine(matches, analyze_match)

    if isinstance(result, dict):
        result["errors"] = data.get("errors", [])
        result["tolerans"] = tolerans

    return result