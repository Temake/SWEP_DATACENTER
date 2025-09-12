from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from typing import Union

from models.database import get_session
from models.account import StudentAccount, SupervisorAccount, AdminAccount
from services.auth import get_current_user as auth_get_current_user, verify_token
from services.enums import Role

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

AccountType = Union[StudentAccount, SupervisorAccount, AdminAccount]


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
) -> AccountType:
    return auth_get_current_user(session, token)


def get_current_student(
    current_user: AccountType = Depends(get_current_user)
) -> StudentAccount:
    if current_user.role != Role.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required"
        )
    return current_user


def get_current_supervisor(
    current_user: AccountType = Depends(get_current_user)
) -> SupervisorAccount:
    if current_user.role != Role.SUPERVISOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Supervisor access required"
        )
    return current_user


def get_current_admin(
    current_user: AccountType = Depends(get_current_user)
) -> AdminAccount:
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def require_role(*allowed_roles: Role):
    def role_checker(current_user: AccountType = Depends(get_current_user)) -> AccountType:
        if current_user.role not in allowed_roles:
            roles_str = ", ".join([role.value for role in allowed_roles])
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {roles_str}"
            )
        return current_user
    return role_checker


def require_student_or_supervisor():
    return require_role(Role.STUDENT, Role.SUPERVISOR)


def require_supervisor_or_admin():
    return require_role(Role.SUPERVISOR, Role.ADMIN)


def get_current_user_optional(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
) -> AccountType:
    try:
        return auth_get_current_user(session, token)
    except HTTPException:
        return None