import asyncio
from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def inspect():
    async with AsyncSessionLocal() as db:
        # Fetch users
        users_result = await db.execute(text("SELECT id, email, full_name, role FROM users;"))
        users = users_result.all()
        print("=== USERS ===")
        for u in users:
            print(f"ID: {u.id} | Email: {u.email} | Name: {u.full_name} | Role: {u.role}")
            
            # Fetch student profile
            sp_result = await db.execute(text(f"SELECT id, college, branch, year, cgpa, age, preferred_language, profile_completeness FROM student_profiles WHERE user_id = '{u.id}';"))
            sp = sp_result.first()
            if sp:
                print(f"  -> Student Profile: ID: {sp.id} | College: {sp.college} | Branch: {sp.branch} | Year: {sp.year} | CGPA: {sp.cgpa} | Age: {sp.age} | Completeness: {sp.profile_completeness}%")
                
                # Fetch career profile
                cp_result = await db.execute(text(f"SELECT dream_career, skills, interests FROM career_profiles WHERE student_id = '{sp.id}';"))
                cp = cp_result.first()
                if cp:
                    print(f"     -> Career Profile: Dream: {cp.dream_career} | Skills: {cp.skills} | Interests: {cp.interests}")
                else:
                    print("     -> Career Profile: NONE")
            else:
                print("  -> Student Profile: NONE")
        print("=============")

if __name__ == "__main__":
    asyncio.run(inspect())
