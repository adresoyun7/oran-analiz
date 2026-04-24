def total_odds(items):
    total = 1.0
    for item in items:
        try:
            total *= float(item.get("odd", 1.0))
        except Exception:
            pass
    return round(total, 2)


def normalize_pick(item):
    return {
        "home_team": item.get("home_team"),
        "away_team": item.get("away_team"),
        "main_pick": item.get("main_pick"),
        "confidence": item.get("confidence", 0),
        "risk": item.get("risk"),
        "expected_score": item.get("expected_score"),
        "ai_score": item.get("ai_score", 0),
        "odd": item.get("odd", 1.0),
        "match_type": item.get("match_type"),
        "value_score": item.get("value_score", 0),
    }


def unique_by_team(items):
    seen = set()
    out = []
    for m in items:
        key = m.get("home_team")
        if key and key not in seen:
            seen.add(key)
            out.append(m)
    return out


def build_coupons(analyzed):
    playable = [
        m for m in analyzed
        if m.get("confidence", 0) >= 55
        and m.get("main_pick")
    ]

    safe = sorted(
        [
            m for m in playable
            if m.get("confidence", 0) >= 65
            and m.get("value_score", 0) >= 65
            and m.get("risk") != "YÜKSEK"
        ],
        key=lambda x: (x.get("confidence", 0), x.get("ai_score", 0)),
        reverse=True,
    )[:3]

    value = sorted(
        [
            m for m in playable
            if m.get("confidence", 0) >= 58
            and m.get("value_score", 0) >= 40
        ],
        key=lambda x: (x.get("value_score", 0), x.get("ai_score", 0)),
        reverse=True,
    )[:4]

    aggressive = sorted(
        [
            m for m in analyzed
            if m.get("confidence", 0) >= 52
            and m.get("odd", 1) >= 1.50
        ],
        key=lambda x: (x.get("ai_score", 0), x.get("odd", 1.0)),
        reverse=True,
    )[:6]

    safe = unique_by_team(safe)
    value = unique_by_team(value)
    aggressive = unique_by_team(aggressive)

    if not safe:
        safe = sorted(
            playable,
            key=lambda x: x.get("confidence", 0),
            reverse=True
        )[:2]
        safe = unique_by_team(safe)

    return {
        "safe": {
            "items": [normalize_pick(x) for x in safe],
            "total_odds": total_odds(safe),
        },
        "value": {
            "items": [normalize_pick(x) for x in value],
            "total_odds": total_odds(value),
        },
        "aggressive": {
            "items": [normalize_pick(x) for x in aggressive],
            "total_odds": total_odds(aggressive),
        },
    }