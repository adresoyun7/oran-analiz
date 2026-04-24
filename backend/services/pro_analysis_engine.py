from typing import List, Dict, Any


def safe_float(v, default=1.0):
    try:
        return float(v)
    except Exception:
        return default


def risk_label(score: int) -> str:
    if score >= 72:
        return "DÜŞÜK"
    if score >= 60:
        return "ORTA"
    return "YÜKSEK"


def unique_matches(matches: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen = set()
    result = []

    for m in matches:
        key = (
            m.get("home_team", "").lower().strip(),
            m.get("away_team", "").lower().strip(),
        )

        if key in seen:
            continue

        seen.add(key)
        result.append(m)

    return result


def goal_count(score_text: str) -> int:
    try:
        home, away = score_text.split("-")
        return int(home) + int(away)
    except Exception:
        return 0


def both_teams_score(score_text: str) -> bool:
    try:
        home, away = score_text.split("-")
        return int(home) > 0 and int(away) > 0
    except Exception:
        return False


def calculate_pro_score(result: Dict[str, Any], odd: float, market: str = "MS") -> int:
    confidence = int(result.get("confidence", 0))
    value_score = int(result.get("value_score", 0))
    ai_score = int(result.get("ai_score", confidence))

    score = round(
        confidence * 0.50 +
        value_score * 0.25 +
        ai_score * 0.25
    )

    if odd < 1.30:
        score -= 7
    elif odd > 2.80:
        score -= 10
    elif 1.45 <= odd <= 2.05:
        score += 4

    if market == "MS":
        score += 1
    elif market == "KG":
        score += 0
    elif market == "ALTUST":
        score += 3
    elif market == "COMBO":
        score -= 4

    return max(0, min(100, score))


def extract_main_odd(match: Dict[str, Any], main_pick: str) -> float:
    if main_pick == "MS 1":
        return safe_float(match.get("home_odds"))
    if main_pick in ["X", "Beraberlik"]:
        return safe_float(match.get("draw_odds"))
    if main_pick == "MS 2":
        return safe_float(match.get("away_odds"))
    return 1.0


def generate_markets(match: Dict[str, Any], result: Dict[str, Any]) -> List[Dict[str, Any]]:
    markets = []

    main_pick = result.get("main_prediction")
    expected_score = result.get("estimated_score", "")
    goal_profile = result.get("goal_profile", "")
    confidence = int(result.get("confidence", 0))

    home_odd = safe_float(match.get("home_odds"))
    draw_odd = safe_float(match.get("draw_odds"))
    away_odd = safe_float(match.get("away_odds"))

    total_goals = goal_count(expected_score)
    btts = both_teams_score(expected_score)

    if main_pick == "MS 1":
        markets.append({
            "market": "MS",
            "selection": "MS 1",
            "odd": home_odd,
        })
    elif main_pick in ["X", "Beraberlik"]:
        markets.append({
            "market": "MS",
            "selection": "X",
            "odd": draw_odd,
        })
    elif main_pick == "MS 2":
        markets.append({
            "market": "MS",
            "selection": "MS 2",
            "odd": away_odd,
        })

    if btts and confidence >= 60:
        markets.append({
            "market": "KG",
            "selection": "KG VAR",
            "odd": 1.65,
        })

    if not btts and confidence >= 60:
        markets.append({
            "market": "KG",
            "selection": "KG YOK",
            "odd": 1.75,
        })

    if total_goals >= 3 and confidence >= 55:
        markets.append({
            "market": "ALTUST",
            "selection": "2.5 ÜST",
            "odd": 1.70,
        })

    if 0 < total_goals <= 2 and confidence >= 58:
        markets.append({
            "market": "ALTUST",
            "selection": "2.5 ALT",
            "odd": 1.75,
        })

    if goal_profile == "Dengeli" and btts and confidence >= 62:
        markets.append({
            "market": "KG",
            "selection": "KG VAR",
            "odd": 1.65,
        })

    if main_pick == "MS 1" and btts and confidence >= 66:
        markets.append({
            "market": "COMBO",
            "selection": "MS 1 + KG VAR",
            "odd": 2.35,
        })

    if main_pick == "MS 2" and btts and confidence >= 66:
        markets.append({
            "market": "COMBO",
            "selection": "MS 2 + KG VAR",
            "odd": 2.55,
        })

    if main_pick == "MS 1" and total_goals >= 3 and confidence >= 66:
        markets.append({
            "market": "COMBO",
            "selection": "MS 1 + 2.5 ÜST",
            "odd": 2.40,
        })

    if main_pick == "MS 2" and total_goals >= 3 and confidence >= 66:
        markets.append({
            "market": "COMBO",
            "selection": "MS 2 + 2.5 ÜST",
            "odd": 2.60,
        })

    return markets


def pick_best_market(match: Dict[str, Any], result: Dict[str, Any]) -> Dict[str, Any] | None:
    markets = generate_markets(match, result)

    best = None
    best_score = -1

    for item in markets:
        market = item["market"]
        odd = safe_float(item["odd"])
        confidence = int(result.get("confidence", 0))

        if odd < 1.20 or odd > 3.20:
            continue

        if market == "KG" and confidence < 60:
            continue

        if market == "COMBO" and confidence < 66:
            continue

        score = calculate_pro_score(result, odd, market)

        if market == "COMBO" and score < 66:
            continue

        if score > best_score:
            best_score = score
            best = {
                "market": market,
                "selection": item["selection"],
                "odd": odd,
                "pro_score": score,
            }

    return best


def build_pro_pick(match: Dict[str, Any], result: Dict[str, Any]) -> Dict[str, Any] | None:
    main_pick = result.get("main_prediction")

    if not main_pick:
        return None

    best_market = pick_best_market(match, result)

    if not best_market:
        return None

    pro_score = best_market["pro_score"]
    playable = pro_score >= 58

    return {
        "home_team": match.get("home_team"),
        "away_team": match.get("away_team"),
        "main_pick": main_pick,
        "market": best_market["market"],
        "selection": best_market["selection"],
        "confidence": result.get("confidence", 0),
        "ai_score": result.get("ai_score", result.get("confidence", 0)),
        "value_score": result.get("value_score", 0),
        "pro_score": pro_score,
        "risk": risk_label(pro_score),
        "playable": playable,
        "expected_score": result.get("estimated_score"),
        "match_type": result.get("match_type"),
        "goal_profile": result.get("goal_profile"),
        "ai_comment": result.get("ai_comment"),
        "odd": best_market["odd"],
    }


def create_virtual_markets(pick: Dict[str, Any]) -> List[Dict[str, Any]]:
    alternatives = []

    expected = pick.get("expected_score", "")
    pro_score = pick.get("pro_score", 0)
    current_market = pick.get("market")

    if current_market != "KG":
        if both_teams_score(expected):
            alternatives.append({
                "market": "KG",
                "selection": "KG VAR",
                "confidence_note": "Tahmini skor iki tarafın da gol bulmasını destekliyor.",
                "enabled": True,
            })
        else:
            alternatives.append({
                "market": "KG",
                "selection": "KG YOK",
                "confidence_note": "Tahmini skor tek taraflı veya düşük skorlu senaryoyu destekliyor.",
                "enabled": True,
            })

    if current_market != "ALTUST":
        if goal_count(expected) >= 3:
            alternatives.append({
                "market": "ALTUST",
                "selection": "2.5 ÜST",
                "confidence_note": "Tahmini toplam gol 3+ görünüyor.",
                "enabled": True,
            })
        else:
            alternatives.append({
                "market": "ALTUST",
                "selection": "2.5 ALT",
                "confidence_note": "Tahmini toplam gol düşük görünüyor.",
                "enabled": True,
            })

    if current_market != "MS":
        alternatives.append({
            "market": "MS",
            "selection": pick.get("main_pick"),
            "confidence_note": "Ana maç sonucu modeli bu tarafı öne çıkarıyor.",
            "enabled": True,
        })

    if pro_score >= 68:
        alternatives.append({
            "market": "Çifte Şans",
            "selection": "Favori kaybetmez",
            "confidence_note": "Ana seçim güçlü ama oran düşük olabilir.",
            "enabled": False,
        })

    return alternatives


def build_pro_coupons(picks: List[Dict[str, Any]]) -> Dict[str, Any]:
    playable = [p for p in picks if p.get("playable")]

    playable.sort(
        key=lambda x: (
            x.get("pro_score", 0),
            x.get("value_score", 0),
            x.get("confidence", 0),
        ),
        reverse=True,
    )

    return {
        "safe": build_coupon(
            picks=playable,
            max_total=2.60,
            min_score=64,
            max_picks=2,
            title="Güvenli Yol",
            allowed_markets=["MS", "KG", "ALTUST"],
            max_same_market=1,
        ),
        "value": build_coupon(
            picks=playable,
            max_total=5.50,
            min_score=60,
            max_picks=3,
            title="Oynanabilir Yol",
            allowed_markets=["MS", "KG", "ALTUST"],
            max_same_market=2,
        ),
        "aggressive": build_coupon(
            picks=playable,
            max_total=10.00,
            min_score=56,
            max_picks=4,
            title="Agresif Yol",
            allowed_markets=["MS", "KG", "ALTUST", "COMBO"],
            max_same_market=2,
        ),
    }


def build_coupon(
    picks: List[Dict[str, Any]],
    max_total: float,
    min_score: int,
    max_picks: int,
    title: str,
    allowed_markets: List[str],
    max_same_market: int,
) -> Dict[str, Any]:

    selected = []
    used_teams = set()
    market_count = {}
    total = 1.0

    for p in picks:
        if p.get("pro_score", 0) < min_score:
            continue

        market = p.get("market")

        if market not in allowed_markets:
            continue

        market_count[market] = market_count.get(market, 0)

        if market_count[market] >= max_same_market:
            continue

        home = p.get("home_team")
        away = p.get("away_team")

        if home in used_teams or away in used_teams:
            continue

        odd = safe_float(p.get("odd"))

        if odd <= 1:
            continue

        next_total = total * odd

        if next_total > max_total:
            continue

        selected.append({
            "home_team": home,
            "away_team": away,
            "main_pick": p.get("main_pick"),
            "market": p.get("market"),
            "selection": p.get("selection"),
            "confidence": p.get("confidence"),
            "pro_score": p.get("pro_score"),
            "value_score": p.get("value_score"),
            "risk": p.get("risk"),
            "expected_score": p.get("expected_score"),
            "odd": odd,
        })

        used_teams.add(home)
        used_teams.add(away)
        market_count[market] += 1
        total = next_total

        if len(selected) >= max_picks:
            break

    return {
        "title": title,
        "items": selected,
        "total_odds": round(total, 2) if selected else None,
        "count": len(selected),
    }


def run_pro_engine(matches: List[Dict[str, Any]], analyze_match_func) -> Dict[str, Any]:
    unique = unique_matches(matches)

    analyzed = []

    for match in unique:
        try:
            result = analyze_match_func(match)
            pick = build_pro_pick(match, result)

            if not pick:
                continue

            pick["alternatives"] = create_virtual_markets(pick)
            analyzed.append(pick)

        except Exception as e:
            print("PRO ENGINE analyze error:", e)
            continue

    analyzed.sort(
        key=lambda x: (
            x.get("pro_score", 0),
            x.get("value_score", 0),
            x.get("confidence", 0),
        ),
        reverse=True,
    )

    coupons = build_pro_coupons(analyzed)

    return {
        "status": "ok",
        "engine": "pro_multi_market_v2",
        "total_matches": len(matches),
        "unique_matches": len(unique),
        "analyzed_matches": len(analyzed),
        "top_matches": analyzed[:10],
        "coupons": coupons,
        "summary": {
            "best_pick": analyzed[0] if analyzed else None,
            "playable_count": len([p for p in analyzed if p.get("playable")]),
            "warning": "Bu sistem istatistiksel analiz sunar, kesin sonuç garantisi vermez.",
        },
    }