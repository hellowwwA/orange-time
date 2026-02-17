# Guest Readonly Access Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable anonymous guest access without GitHub login, with readonly restrictions.

**Architecture:** Add a lightweight guest-mode flag in frontend auth utilities, allow route access for guest mode in route guard, and enforce readonly behavior at the app-shell action points and task writeback path.

**Tech Stack:** React 19, TypeScript, React Router, Axios, Vite

---

### Task 1: Add guest-mode auth helpers

**Files:**
- Modify: `/Users/lxn/Documents/orange-time/orange-time-fronent/utils/auth.ts`

**Step 1: Write failing test**
- N/A (project has no test runner configured).

**Step 2: Run test to verify it fails**
- N/A.

**Step 3: Write minimal implementation**
- Add `GUEST_MODE_KEY` and helper functions:
  - `enableGuestMode()`
  - `disableGuestMode()`
  - `isGuestMode()`
- `isGuestMode()` should fail-safe to `false` on storage errors.

**Step 4: Run verification**
- Run: `npm run build`
- Expected: Build succeeds.

### Task 2: Add guest entry on login page

**Files:**
- Modify: `/Users/lxn/Documents/orange-time/orange-time-fronent/pages/Login.tsx`

**Step 1: Write failing test**
- N/A.

**Step 2: Run test to verify it fails**
- N/A.

**Step 3: Write minimal implementation**
- Import `enableGuestMode`.
- Add guest button below GitHub login button.
- On click: set guest mode and redirect to `/dashboard`.

**Step 4: Run verification**
- Run: `npm run build`
- Expected: Build succeeds.

### Task 3: Allow protected route for guest mode

**Files:**
- Modify: `/Users/lxn/Documents/orange-time/orange-time-fronent/components/ProtectedRoute.tsx`

**Step 1: Write failing test**
- N/A.

**Step 2: Run test to verify it fails**
- N/A.

**Step 3: Write minimal implementation**
- Import `isGuestMode`.
- During auth check, set authenticated true when user exists OR guest mode true.
- In catch branch, still allow guest mode fallback.

**Step 4: Run verification**
- Run: `npm run build`
- Expected: Build succeeds.

### Task 4: Enforce readonly behavior in app shell

**Files:**
- Modify: `/Users/lxn/Documents/orange-time/orange-time-fronent/App.tsx`

**Step 1: Write failing test**
- N/A.

**Step 2: Run test to verify it fails**
- N/A.

**Step 3: Write minimal implementation**
- Import `isGuestMode` and `disableGuestMode`.
- Track `guestMode` state.
- Hide/disable edit actions in guest mode:
  - Prevent create new.
  - Prevent opening editor from task list/timeline.
  - Hide editor-only save/delete action bar for guests.
- Disable logout dropdown for guest and provide "Exit Guest" action that clears guest mode and redirects to `/login`.
- Prevent task POST writeback when in guest mode.
- Show readonly badge in header for guest mode.

**Step 4: Run verification**
- Run: `npm run build`
- Expected: Build succeeds.

### Task 5: End-to-end manual checks

**Files:**
- Modify: none

**Step 1: Run local app**
- Run: `npm run dev`

**Step 2: Verify guest scenarios**
- Login page has guest entry.
- Guest can access `/dashboard` and `/timeline`.
- Guest cannot create/edit/delete/save.
- Guest can exit guest mode and is returned to `/login`.

**Step 3: Verify authenticated flow regression**
- GitHub login button and flow remain unchanged in code path.

