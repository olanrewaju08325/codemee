from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from app.core.config import settings
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.profile_service import get_profile_by_id

security = HTTPBearer()

async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Verify Supabase JWT token and return decoded user info along with database-verified role.
    """
    try:
        token = credentials.credentials
        # Decode header first to see what algorithm Supabase is using
        unverified_header = jwt.get_unverified_header(token)
        token_alg = unverified_header.get("alg", "HS256")
        
        if token_alg == "RS256":
            import urllib.request
            import json
            # Supabase new default is RS256. Fetch the public keys to verify.
            jwks_url = f"{settings.SUPABASE_PROJECT_URL}/rest/v1/jwks"
            with urllib.request.urlopen(jwks_url) as response:
                jwks = json.loads(response.read().decode())
                
            payload = jwt.decode(
                token,
                jwks,
                algorithms=["RS256"],
                audience="authenticated"
            )
        else:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"
            )
        
        # Extract user ID
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID"
            )
            
        # Check email verification status
        email_confirmed_at = payload.get("email_confirmed_at")
        if not email_confirmed_at:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email not verified. Please confirm your email address before accessing this resource."
            )
        
        # Determine actual role from database
        profile = await get_profile_by_id(db, user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User profile not found in database."
            )
            
        return {
            "user_id": user_id,
            "role": profile.role,
            "email": payload.get("email"),
            "email_confirmed_at": email_confirmed_at,
            "exp": payload.get("exp")
        }
        
    except HTTPException:
        raise
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )

async def get_current_user(
    user_data: Dict[str, Any] = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get current authenticated user from verified token.
    """
    return user_data

def require_role(allowed_roles: list[str]):
    """
    Dependency factory to check if the user has an allowed role.
    """
    async def role_checker(user_data: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        if user_data.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action."
            )
        return user_data
    return role_checker

require_student = require_role(["student", "teacher", "admin"]) # Cascading access
require_teacher = require_role(["teacher", "admin"]) # Admin can do teacher actions
require_admin = require_role(["admin"])
