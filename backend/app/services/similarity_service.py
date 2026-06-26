from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List

_model = None

def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

DUPLICATE_THRESHOLD = 0.92
REPETITION_THRESHOLD = 0.88

def compute_similarity(text1: str, text2: str) -> float:
    embeddings = get_model().encode([text1, text2])
    return float(cosine_similarity([embeddings[0]], [embeddings[1]])[0][0])

def is_duplicate_question(new_message: str, previous_messages: List[str]) -> bool:
    if not previous_messages:
        return False
    
    new_emb = get_model().encode([new_message])
    prev_embs = get_model().encode(previous_messages)
    
    similarities = cosine_similarity(new_emb, prev_embs)[0]
    return bool(np.any(similarities > DUPLICATE_THRESHOLD))

def is_repetitive_response(new_response: str, previous_responses: List[str]) -> bool:
    if not previous_responses:
        return False
        
    new_emb = get_model().encode([new_response])
    prev_embs = get_model().encode(previous_responses)
    
    similarities = cosine_similarity(new_emb, prev_embs)[0]
    return bool(np.any(similarities > REPETITION_THRESHOLD))
