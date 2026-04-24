from datetime import datetime, timedelta


def parse_mac_datetime(value):
    if isinstance(value, datetime):
        return value

    s = str(value).strip()

    for fmt in (
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%dT%H:%M",
    ):
        try:
            return datetime.strptime(s, fmt)
        except Exception:
            pass

    try:
        return datetime.fromisoformat(s.replace("Z", ""))
    except Exception:
        return datetime.now()


def mac_canli_durumu(mac_zamani):
    now = datetime.now()

    if now < mac_zamani:
        return "Başlamamış"

    if now <= mac_zamani + timedelta(hours=2, minutes=15):
        return "Canlı"

    return "Bitti"


def dinamik_min_mac(tolerans: float) -> int:
    if tolerans <= 0.02:
        return 1
    elif tolerans <= 0.05:
        return 3
    elif tolerans <= 0.08:
        return 5
    elif tolerans <= 0.12:
        return 10
    return 20


def tolerans_rehberi(tolerans: float):
    min_mac = dinamik_min_mac(tolerans)

    if tolerans <= 0.02:
        yorum = "Çok dar filtre. Az ama çok yakın oranlı örnekler gelir."
    elif tolerans <= 0.05:
        yorum = "Dar filtre. Örnek az olabilir ama eşleşme kalitesi yüksektir."
    elif tolerans <= 0.08:
        yorum = "Dengeli filtre. Hem kalite hem örnek sayısı dengeli."
    elif tolerans <= 0.12:
        yorum = "Biraz geniş filtre. Veri artar, benzerlik biraz düşer."
    else:
        yorum = "Geniş filtre. Sonuçlar daha genel davranabilir."

    return {
        "onerilen_tolerans": "0.08 - 0.10",
        "onerilen_min_mac": min_mac,
        "yorum": yorum,
    }


def risk_seviyesi(pct: int, flip_p: float):
    if pct >= 70 and flip_p < 0.15:
        return "DÜŞÜK", "risk-dusuk"
    if pct >= 55:
        return "ORTA", "risk-orta"
    return "YÜKSEK", "risk-yuksek"


def mac_tipi(h: float, a: float):
    if abs(h - a) <= 0.50:
        return "Dengeli"
    if h < 2.0 or a < 2.0:
        return "Favori"
    return "Sürpriz Açık"


def ai_yorum_uret(t):
    ana = t.get("ana_label", "")
    guven = int(t.get("ana_p", 0))
    puan = float(t.get("playable_score", guven))
    mac_tipi_txt = t.get("match_type", "")
    gol_profili_txt = t.get("goal_profile", "")
    canli = t.get("canli_label", "")

    if t.get("belirsiz"):
        return "Model bu maçta net taraf ayıramıyor. Ana tahmin yerine canlı başlangıç temposunu izlemek daha mantıklı."

    giris = f"Model ana senaryoda {ana} tarafını öne çıkarıyor."

    if guven >= 70 and puan >= 70:
        giris += " Güven ve puan birlikte güçlü olduğu için maç öncelikli izlenebilir."
    elif puan >= 65:
        giris += " Puan tarafı iyi, ancak güveni de maç temposuyla teyit etmek gerekir."
    elif guven >= 65:
        giris += " Güven iyi olsa da puan çok elit değil, kontrollü yaklaşmak daha doğru."
    else:
        giris += " Güven orta seviyede, agresif kupon için tek başına güçlü görünmüyor."

    detaylar = []

    if mac_tipi_txt:
        detaylar.append(f"maç tipi {mac_tipi_txt.lower()}")
    if gol_profili_txt:
        detaylar.append(f"gol profili {gol_profili_txt.lower()}")

    sonuc = giris

    if detaylar:
        sonuc += " " + " · ".join(detaylar).capitalize() + "."

    if canli:
        sonuc += f" Canlı plan: {canli}."

    return sonuc


def analyze_match(match):
    home = match["home_team"]
    away = match["away_team"]

    h = float(match["home_odds"])
    b = float(match["draw_odds"])
    a = float(match["away_odds"])

    home_power = 1 / h
    draw_power = 1 / b
    away_power = 1 / a

    total = home_power + draw_power + away_power

    home_prob = home_power / total
    draw_prob = draw_power / total
    away_prob = away_power / total

    probs = {
        "MS 1": home_prob,
        "Beraberlik": draw_prob,
        "MS 2": away_prob,
    }

    ana_label = max(probs, key=probs.get)
    ana_p = round(probs[ana_label] * 100)
    ana_p = min(ana_p, 75)

    if ana_label == "MS 1":
        eg, dg = 2, 1
    elif ana_label == "MS 2":
        eg, dg = 1, 2
    else:
        eg, dg = 1, 1

    risk_label, risk_cls = risk_seviyesi(ana_p, min(probs.values()))

    selected_odd = h if ana_label == "MS 1" else a if ana_label == "MS 2" else b

    t = {
        "ana_label": ana_label,
        "ana_p": ana_p,
        "ana_odd": selected_odd,
        "playable_score": ana_p,
        "ornek": 0,
        "match_type": mac_tipi(h, a),
        "goal_profile": "Dengeli",
        "combo_label": "",
        "canli_label": "İlk 15 dakikadaki tempo kontrol edilmeli",
        "risk_label": risk_label,
        "belirsiz": ana_p < 40,
    }

    yorum = ai_yorum_uret(t)

    return {
        "home_team": home,
        "away_team": away,
        "main_prediction": ana_label,
        "estimated_score": f"{eg}-{dg}",
        "confidence": ana_p,
        "risk": risk_label,
        "risk_class": risk_cls,
        "match_type": t["match_type"],
        "goal_profile": t["goal_profile"],
        "ai_comment": yorum,
        "ai_score": ana_p + (5 if ana_p >= 70 else 0),
        "value_score": round((1 / selected_odd) * 100),
        "playable": ana_p >= 55,
        "odds": {
            "home": h,
            "draw": b,
            "away": a,
        },
        "warning": "Bu sonuç kesinlik içermez. Yalnızca istatistiksel analizdir.",
    }