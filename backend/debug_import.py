import importlib

routers = [
    "auth", "users", "health", "onboarding", "digital_twin", "dashboard", 
    "chat", "career_gps", "opportunities", "scholarships", "interventions", 
    "mentors", "mentor", "community", "sessions", "success_stories", "voice", 
    "parent", "accessibility", "success", "analytics", "predictions", "admin", 
    "knowledge_graph"
]

print("Starting router imports...", flush=True)
for r in routers:
    print(f"Importing app.api.v1.{r}...", flush=True)
    importlib.import_module(f"app.api.v1.{r}")
    print(f"Successfully imported app.api.v1.{r}", flush=True)
