from fastapi import APIRouter, HTTPException
from services.pro_analysis_engine import ProAnalysisEngine, ScannerConfig

router = APIRouter(
    prefix="/scanner",
    tags=["AI Scanner"]
)


# GEÇİCİ (birazdan sileceğiz)
def get_mock_matches():
    return [
        {
            "id": "1",
            "home": "Arsenal",
            "away": "Chelsea",
            "confidence": 74,
            "odd": 1.65,
            "prediction": "MS 1",
            "sample": 12
        }
    ]


@router.get("/daily")
def scanner_daily():
    try:
        matches = get_mock_matches()

        engine = ProAnalysisEngine(ScannerConfig())
        result = engine.scan_daily(matches)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))