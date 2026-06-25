class ModelRegistryService:
    def __init__(self):
        # Mocks MLflow connection
        self.models = {}
        
    def register_model(self, model_name: str, version: str, path: str):
        self.models[f"{model_name}_{version}"] = path
        return {"status": "registered", "model": model_name, "version": version}
        
    def get_latest_model(self, model_name: str):
        return {"model": model_name, "version": "v1.0.0", "status": "active"}
        
    def log_metrics(self, run_id: str, metrics: dict):
        # Mocks logging metrics to MLflow
        pass
        
    def promote_model(self, model_name: str, version: str, stage: str):
        return {"status": "promoted", "model": model_name, "stage": stage}
        
    def archive_model(self, model_name: str, version: str):
        return {"status": "archived", "model": model_name, "version": version}

model_registry_service = ModelRegistryService()
