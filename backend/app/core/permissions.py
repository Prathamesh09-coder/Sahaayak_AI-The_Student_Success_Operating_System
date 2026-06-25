from enum import Enum
from fastapi import Depends, HTTPException, status

class UserRole(str, Enum):
    STUDENT = "student"
    MENTOR = "mentor"
    PARENT = "parent"
    ADMIN = "admin"
    MODERATOR = "moderator"

# Mock current user dependency
async def get_current_user():
    # In a real app, this parses JWT and retrieves the user
    return {"id": "mock_user", "role": "admin"}

def require_role(*roles: UserRole):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")
        if user_role not in [role.value for role in roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action"
            )
        return current_user
    return role_checker

require_admin = require_role(UserRole.ADMIN)
require_mentor = require_role(UserRole.MENTOR, UserRole.ADMIN)
require_student = require_role(UserRole.STUDENT, UserRole.ADMIN)
