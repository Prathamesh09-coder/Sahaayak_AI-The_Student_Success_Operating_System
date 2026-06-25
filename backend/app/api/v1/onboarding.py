from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api import deps
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.family_profile import FamilyProfile
from app.models.career_profile import CareerProfile
from app.models.student_goal import StudentGoal
from app.models.assessment_profile import AssessmentProfile
from app.schemas.student_profile import StudentProfileCreate, StudentProfileUpdate, StudentProfileResponse
from app.schemas.family_profile import FamilyProfileCreate, FamilyProfileUpdate, FamilyProfileResponse
from app.schemas.career_profile import CareerProfileCreate, CareerProfileUpdate, CareerProfileResponse
from app.schemas.student_goal import StudentGoalCreate, StudentGoalUpdate, StudentGoalResponse
from app.schemas.assessment_profile import AssessmentProfileCreate, AssessmentProfileUpdate, AssessmentProfileResponse
from app.repositories import profile_repository
from app.services import profile_service
from app.workers.twin_tasks import generate_digital_twin_task

router = APIRouter()

@router.post("/academic", response_model=dict)
@router.put("/academic", response_model=dict)
async def upsert_academic(
    data: StudentProfileCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(deps.get_current_user)
):
    profile = await profile_repository.get_student_profile(db, str(current_user.id))
    if not profile:
        profile = StudentProfile(user_id=str(current_user.id))
    
    # Handle user full name update in real-time
    if data.name is not None:
        current_user.full_name = data.name
        db.add(current_user)
        
    # Exclude 'name' from StudentProfile fields and exclude unset fields to prevent overwriting
    profile_data = data.model_dump(exclude={"name"}, exclude_unset=True)
    for key, value in profile_data.items():
        setattr(profile, key, value)
    
    profile.current_step = max(profile.current_step or 1, 2)
    profile = await profile_repository.save_profile(db, profile)
    await profile_service.calculate_profile_completeness(db, str(current_user.id))
    
    return {"success": True, "message": "Academic profile saved", "data": StudentProfileResponse.model_validate(profile).model_dump()}

@router.post("/family", response_model=dict)
@router.put("/family", response_model=dict)
async def upsert_family(
    data: FamilyProfileCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(deps.get_current_user)
):
    student = await profile_repository.get_student_profile(db, str(current_user.id))
    if not student:
        raise HTTPException(status_code=400, detail="Student profile not created yet")

    profile = await profile_repository.get_family_profile(db, str(student.id))
    if not profile:
        profile = FamilyProfile(student_id=str(student.id))
        
    for key, value in data.model_dump().items():
        setattr(profile, key, value)
        
    profile = await profile_repository.save_profile(db, profile)
    student.current_step = max(student.current_step or 1, 3)
    await profile_repository.save_profile(db, student)
    await profile_service.calculate_profile_completeness(db, str(current_user.id))

    return {"success": True, "message": "Family profile saved", "data": FamilyProfileResponse.model_validate(profile).model_dump()}

@router.post("/career", response_model=dict)
@router.put("/career", response_model=dict)
async def upsert_career(
    data: CareerProfileCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(deps.get_current_user)
):
    student = await profile_repository.get_student_profile(db, str(current_user.id))
    if not student:
        raise HTTPException(status_code=400, detail="Student profile not created yet")

    profile = await profile_repository.get_career_profile(db, str(student.id))
    if not profile:
        profile = CareerProfile(student_id=str(student.id))
        
    for key, value in data.model_dump().items():
        setattr(profile, key, value)
        
    profile = await profile_repository.save_profile(db, profile)
    student.current_step = max(student.current_step or 1, 4)
    await profile_repository.save_profile(db, student)
    await profile_service.calculate_profile_completeness(db, str(current_user.id))

    return {"success": True, "message": "Career profile saved", "data": CareerProfileResponse.model_validate(profile).model_dump()}

@router.post("/goals", response_model=dict)
async def add_goal(
    data: StudentGoalCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(deps.get_current_user)
):
    student = await profile_repository.get_student_profile(db, str(current_user.id))
    if not student:
        raise HTTPException(status_code=400, detail="Student profile not created yet")

    goal = StudentGoal(student_id=str(student.id), **data.model_dump())
    goal = await profile_repository.save_profile(db, goal)
    
    student.current_step = max(student.current_step or 1, 5)
    await profile_repository.save_profile(db, student)
    await profile_service.calculate_profile_completeness(db, str(current_user.id))

    return {"success": True, "message": "Goal added", "data": StudentGoalResponse.model_validate(goal).model_dump()}

@router.post("/assessment", response_model=dict)
async def upsert_assessment(
    data: AssessmentProfileCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(deps.get_current_user)
):
    student = await profile_repository.get_student_profile(db, str(current_user.id))
    if not student:
        raise HTTPException(status_code=400, detail="Student profile not created yet")

    profile = await profile_repository.get_assessment_profile(db, str(student.id))
    if not profile:
        profile = AssessmentProfile(student_id=str(student.id))
        
    for key, value in data.model_dump().items():
        setattr(profile, key, value)
        
    profile = await profile_repository.save_profile(db, profile)
    student.current_step = max(student.current_step or 1, 6)
    await profile_repository.save_profile(db, student)
    await profile_service.calculate_profile_completeness(db, str(current_user.id))

    return {"success": True, "message": "Assessment saved", "data": AssessmentProfileResponse.model_validate(profile).model_dump()}

@router.get("/me", response_model=dict)
async def get_my_profile(db: AsyncSession = Depends(get_db), current_user: User = Depends(deps.get_current_user)):
    student = await profile_repository.get_student_profile(db, str(current_user.id))
    if not student:
        return {"success": True, "message": "No profile found", "data": None}
        
    student_id = str(student.id)
    family = await profile_repository.get_family_profile(db, student_id)
    career = await profile_repository.get_career_profile(db, student_id)
    goals = await profile_repository.get_student_goals(db, student_id)
    assessment = await profile_repository.get_assessment_profile(db, student_id)

    return {
        "success": True,
        "message": "Profile fetched successfully",
        "data": {
            "student_profile": StudentProfileResponse.model_validate(student).model_dump() if student else None,
            "family_profile": FamilyProfileResponse.model_validate(family).model_dump() if family else None,
            "career_profile": CareerProfileResponse.model_validate(career).model_dump() if career else None,
            "goals": [StudentGoalResponse.model_validate(g).model_dump() for g in goals],
            "assessment": AssessmentProfileResponse.model_validate(assessment).model_dump() if assessment else None
        }
    }

@router.get("/status", response_model=dict)
async def get_onboarding_status(db: AsyncSession = Depends(get_db), current_user: User = Depends(deps.get_current_user)):
    student = await profile_repository.get_student_profile(db, str(current_user.id))
    if not student:
        return {"success": True, "message": "Status fetched", "data": {"current_step": 1, "completed": False}}
        
    return {
        "success": True,
        "message": "Status fetched",
        "data": {
            "current_step": student.current_step,
            "completed": student.is_onboarding_completed,
            "completeness": student.profile_completeness
        }
    }

@router.post("/complete", response_model=dict)
async def complete_onboarding(db: AsyncSession = Depends(get_db), current_user: User = Depends(deps.get_current_user)):
    student = await profile_repository.get_student_profile(db, str(current_user.id))
    if not student:
        raise HTTPException(status_code=400, detail="Profile not found")
        
    student = await profile_service.mark_onboarding_completed(db, str(current_user.id))
    
    # Queue celery task
    generate_digital_twin_task.delay(str(student.id))
    
    return {"success": True, "message": "Onboarding completed and Twin generating", "data": None}
