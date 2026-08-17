# TASK-006 — Sidebar Authorization

## Status

DONE

## Objective

Implement dynamic sidebar that builds navigation based on user permissions.

## Scope

- Dynamic navigation items
- Permission-based filtering
- Humanized labels
- User info display

## Dependencies

- TASK-005 complete

## Implementation

### Navigation Items

Define navigation with required permissions:

```typescript
const navigationItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard, requiredPermission: null },
  { label: "Processos", path: "/processes", icon: FileText, requiredPermission: "process.read" },
  // ... etc
]
```

### Permission Filtering

Filter navigation based on user permissions:

```typescript
const filteredNav = navigationItems.filter(item => 
  !item.requiredPermission || userPermissions.includes(item.requiredPermission)
);
```

### Humanized Labels

- Never show enum codes
- Show friendly names in Portuguese
- Consistent naming across UI

### User Info Display

- Show user name
- Show current profile
- Logout button

## Acceptance Criteria

- [ ] Dynamic navigation based on permissions
- [ ] Humanized labels
- [ ] User info displayed
- [ ] Proper loading states
- [ ] No auth rules in sidebar only

## Tests

- Navigation filtering
- Label rendering

## Definition of Done

- Sidebar authorization functional
- All tests passing
