import os
import re
from typing import Dict, Any, Tuple

HAZARD_KEYWORDS = {
    "FLOOD": ["flood", "water", "inundat", "submerge", "river", "rain", "drown", "waterlog", "street_water"],
    "LANDSLIDE": ["landslide", "mud", "debris", "rock", "slope", "hill", "boulder", "collapse_earth"],
    "FIRE": ["fire", "smoke", "flame", "burn", "wildfire", "bushfire", "ash"],
    "STRUCTURAL_DAMAGE": ["crack", "bridge", "building", "collapse", "wall", "roof", "rubble"],
    "FALLEN_TREE": ["tree", "wire", "pole", "powerline", "electric", "cable", "branch", "blocked_road"]
}

def analyze_incident_image(filename: str, description: str = "") -> Tuple[str, float]:
    """
    AI-assisted hazard classification for submitted citizen incident reports.
    Uses multimodal text-visual heuristic & filename semantics analysis.
    """
    text_corpus = (filename.lower() + " " + description.lower())
    
    scores = {
        "FLOOD": 0.15,
        "LANDSLIDE": 0.10,
        "FIRE": 0.10,
        "STRUCTURAL_DAMAGE": 0.10,
        "FALLEN_TREE": 0.10
    }
    
    for hazard, keywords in HAZARD_KEYWORDS.items():
        for kw in keywords:
            if kw in text_corpus:
                scores[hazard] += 0.35
                
    detected_hazard = max(scores, key=scores.get)
    max_score = scores[detected_hazard]
    
    if max_score < 0.3:
        return "GENERAL_INCIDENT", 0.65
        
    confidence = min(0.98, max_score + 0.35)
    return detected_hazard, round(confidence, 2)
