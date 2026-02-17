# Guest Readonly Access Design

## Goal
Allow users to access the project without GitHub login in guest mode, with strictly readonly behavior (browse dashboard/timeline only, no create/edit/delete/save/logout flows).

## Scope
- Add a "Guest Access" entry point on login page.
- Allow protected routes when guest mode is enabled.
- Enforce readonly restrictions in UI and in frontend write paths.
- Keep existing GitHub login flow unchanged.

## Non-Goals
- Backend role model changes.
- Anonymous writable data.
- Multi-tenant guest identity management.

## Approach Options
1. Frontend guest flag (recommended)
- Store guest mode in localStorage.
- Gate route auth by (authenticated OR guest mode).
- Disable write actions in app shell and editor entry points.

2. Separate guest route tree
- Duplicate readonly pages under /guest and keep existing protected routes unchanged.

3. Full auth-role context
- Introduce role abstraction and central permissions layer.

## Recommendation
Use option 1 because it is minimal, low-risk, and fits the current architecture without backend changes.

## Architecture Changes
- `utils/auth.ts`
  - Add guest mode helpers (`enableGuestMode`, `disableGuestMode`, `isGuestMode`).
- `pages/Login.tsx`
  - Add guest entry button that enables guest mode and navigates to `/dashboard`.
- `components/ProtectedRoute.tsx`
  - Permit navigation if guest mode is enabled even when `getCurrentUser()` is null.
- `App.tsx`
  - Track `guestMode` and render readonly cues.
  - Block edit/create/delete/save/logout operations in guest mode.
  - Skip writeback POST for tasks in guest mode.

## Data Flow
1. User clicks "Guest Access" on `/login`.
2. App sets `localStorage.guestMode=true` and redirects to `/dashboard`.
3. `ProtectedRoute` checks backend auth; if unauthenticated, checks local guest flag.
4. Main app loads tasks for viewing only.
5. Any write-triggering UI action is hidden or no-op under guest mode.

## Error Handling
- If localStorage read fails, default to non-guest behavior.
- If auth check fails, fallback to guest flag check.
- If `/api/tasks` read fails, existing mock fallback remains.

## Testing Strategy
Given no existing test runner in this repo, verify behavior via build + manual functional checks:
- Guest button visible and works.
- Guest can enter `/dashboard` and `/timeline`.
- Guest cannot create/edit/delete/save.
- Guest mode does not trigger task POST writeback.
- Authenticated flow still works.

## Rollout and Risk
- Low risk: frontend-only changes.
- Residual risk: backend endpoints remain writable if called directly outside UI (acceptable for current requirement).
