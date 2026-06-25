from typing import List, Dict, Any

def generate_sources(retrieved_docs: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, str]]]:
    """
    Format RAG documents into a strict UI citation format.
    """
    sources = []
    seen_urls = set()
    
    for doc in retrieved_docs:
        meta = doc.get("metadata", {})
        url = meta.get("url", "")
        title = meta.get("source", "Knowledge Base")
        
        if url and url not in seen_urls:
            sources.append({
                "title": title,
                "url": url
            })
            seen_urls.add(url)
            
    return {"sources": sources}
