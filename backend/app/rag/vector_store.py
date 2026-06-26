import chromadb
import os
from langchain_community.embeddings import HuggingFaceEmbeddings

CHROMA_DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "chroma")
os.makedirs(CHROMA_DB_DIR, exist_ok=True)

_chroma_client = None

COLLECTIONS = [
    "scholarships",
    "careers",
    "government_schemes",
    "courses",
    "success_stories",
    "mentorship_guides"
]

collections_map = {}

# Use all-MiniLM-L6-v2 as requested for similarity; we use it here for RAG as well
class MiniLMEmbeddingFunction(chromadb.EmbeddingFunction):
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    def __call__(self, input: chromadb.Documents) -> chromadb.Embeddings:
        return self.embeddings.embed_documents(input)

_embedding_func = None

def get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
    return _chroma_client

def get_embedding_func():
    global _embedding_func
    if _embedding_func is None:
        _embedding_func = MiniLMEmbeddingFunction()
    return _embedding_func

def get_collection(name: str):
    if name not in COLLECTIONS:
        raise ValueError(f"Collection {name} is not supported.")
    if name not in collections_map:
        client = get_chroma_client()
        func = get_embedding_func()
        collections_map[name] = client.get_or_create_collection(
            name=name,
            embedding_function=func
        )
    return collections_map[name]
