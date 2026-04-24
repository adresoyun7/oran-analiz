import pandas as pd


FOOTBALL_DATA_LEAGUES = [
    "T1",
    "E0", "E1", "E2",
    "SP1", "SP2",
    "D1", "D2",
    "I1", "I2",
    "F1", "F2",
    "N1", "B1", "P1", "SC0",
]


def load_historical_data(seasons):
    if not seasons:
        return pd.DataFrame()

    frames = []

    for league_code in FOOTBALL_DATA_LEAGUES:
        for season in seasons:
            try:
                url = f"https://www.football-data.co.uk/mmz4281/{season}/{league_code}.csv"
                df = pd.read_csv(url)

                wanted_cols = [
                    "Date",
                    "HomeTeam",
                    "AwayTeam",
                    "FTHG",
                    "FTAG",
                    "HTHG",
                    "HTAG",
                    "FTR",
                    "HTR",
                    "B365H",
                    "B365D",
                    "B365A",
                    "HC",
                    "AC",
                    "HY",
                    "AY",
                ]

                df = df[df.columns.intersection(wanted_cols)]
                df = df.dropna(subset=["B365H", "B365D", "B365A"]).copy()
                df["Date"] = pd.to_datetime(df["Date"], dayfirst=True, errors="coerce")

                frames.append(df)

            except Exception:
                continue

    if not frames:
        return pd.DataFrame()

    return pd.concat(frames).reset_index(drop=True)