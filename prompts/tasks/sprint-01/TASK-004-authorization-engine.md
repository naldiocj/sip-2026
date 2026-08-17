# TASK-004 — Authorization Engine

## Status

DONE

## Objective

Implement the centralized authorization engine with RBAC and permission checks.

## Scope

- Authorization service
- Permission checking mechanisms
- Profile-based access control
- Resource scope foundation
- FastAPI dependencies for auth

## Dependencies

- TASK-001 complete
- TASK-003 complete

## Implementation

### Authorization Service

Centralized service for checking permissions:

```python
class AuthorizationService:
    def check_permission(user, permission_code, resource=None):
        ...
    
    def check_profile(user, profile_code):
        ...
    
    def get_user_permissions(user):
        ...
```

### FastAPI Dependencies

- `get_current_user()` - Extract authenticated user
- `require_permission(permission_code)` - Check specific permission
- `require_profile(profile_code)` - Check specific profile
- `require_authenticated_user()` - Ensure user is logged in

### Permission Constants

Create constants for all permissions to avoid string duplication:

```python
class Permissions:
    PROCESS_READ = "process.read"
    PROCESS_CREATE = "process.create"
    # ... etc
```

### Resource Scope Foundation

Prepare for future scope implementation:

- GLOBAL
- ORGANIZATION
- DIRECTION
- DEPARTMENT
- SECTION
- OWN
- ASSIGNED

## Acceptance Criteria

- [ ] Centralized authorization service
- [ ] Permission constants defined
- [ ] FastAPI dependencies working
- [ ] No scattered auth checks
- [ ] Extensible for future scopes

## Tests

- Permission checking
- Profile validation
- Unauthorized access prevention

## Definition of Done

- Authorization engine functional
- All auth dependencies working
- All tests passing
