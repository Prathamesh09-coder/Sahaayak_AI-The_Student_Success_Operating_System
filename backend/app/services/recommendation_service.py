from app.models.digital_twin import DigitalTwin

class RecommendationService:
    @staticmethod
    def generate_recommendations(twin: DigitalTwin) -> list:
        recommendations = []
        
        if twin.financial_stability < 50:
            recommendations.append("Explore available scholarships.")
            
        if twin.career_readiness < 50:
            recommendations.append("Complete Career GPS roadmap.")
            
        if twin.confidence_score < 50:
            recommendations.append("Schedule mentor session.")
            
        return recommendations

recommendation_service = RecommendationService()
