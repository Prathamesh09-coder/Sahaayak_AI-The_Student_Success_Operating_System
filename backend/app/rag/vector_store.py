import chromadb
import os
from langchain_community.embeddings import HuggingFaceEmbeddings

CHROMA_DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "chroma")
os.makedirs(CHROMA_DB_DIR, exist_ok=True)

chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)

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

embedding_func = MiniLMEmbeddingFunction()

def get_collection(name: str):
    if name not in COLLECTIONS:
        raise ValueError(f"Collection {name} is not supported.")
    if name not in collections_map:
        collections_map[name] = chroma_client.get_or_create_collection(
            name=name,
            embedding_function=embedding_func
        )
    return collections_map[name]
