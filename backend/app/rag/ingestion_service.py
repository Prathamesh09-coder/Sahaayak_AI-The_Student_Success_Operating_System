from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.rag.vector_store import get_collection
import uuid

def ingest_document(text: str, source_name: str, source_url: str, collection_name: str):
    """
    Ingest a document into a specific Chroma collection
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=700,
        chunk_overlap=150,
        length_function=len,
    )
    
    chunks = text_splitter.split_text(text)
    collection = get_collection(collection_name)
    
    ids = [str(uuid.uuid4()) for _ in chunks]
    metadatas = [{"source": source_name, "url": source_url} for _ in chunks]
    
    if chunks:
        collection.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )
