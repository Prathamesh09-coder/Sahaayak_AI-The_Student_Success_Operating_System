from app.rag.vector_store import get_collection, COLLECTIONS

def retrieve_context(query: str, collections: list = None, top_k: int = 5) -> list:
    """Retrieve top_k chunks across specified collections."""
    if not collections:
        collections = COLLECTIONS

    results = []
    for collection_name in collections:
        collection = get_collection(collection_name)
        
        # Querying chroma. It automatically embeds using the embedding_function
        res = collection.query(query_texts=[query], n_results=top_k)
        
        if res and "documents" in res and res["documents"]:
            docs = res["documents"][0]
            metadatas = res["metadatas"][0] if "metadatas" in res else [{}] * len(docs)
            for doc, meta in zip(docs, metadatas):
                results.append({
                    "content": doc,
                    "metadata": meta,
                    "collection": collection_name
                })
                
    # Sort or rank if needed, but for now just return combined list (we may limit total)
    # To strictly return top_k overall we would need cross-collection ranking, 
    # but returning top_k from each queried collection is safer for context richness.
    return results
