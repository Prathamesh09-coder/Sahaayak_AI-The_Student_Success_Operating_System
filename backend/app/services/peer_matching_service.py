class PeerMatchingService:
    def match_peers(self, student: dict, peers: list) -> list:
        # Match based on:
        # Career Goal
        # Skills
        # Language
        # Region
        matches = []
        for peer in peers:
            score = 0
            if student.get("career_goal") == peer.get("career_goal"):
                score += 40
            if set(student.get("skills", [])).intersection(set(peer.get("skills", []))):
                score += 30
            if set(student.get("languages", [])).intersection(set(peer.get("languages", []))):
                score += 20
            if student.get("region") == peer.get("region"):
                score += 10
                
            matches.append({
                "peer_id": peer.get("id"),
                "peer_name": peer.get("name"),
                "match_score": score
            })
            
        return sorted(matches, key=lambda x: x["match_score"], reverse=True)

peer_matching_service = PeerMatchingService()
