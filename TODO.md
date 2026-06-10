# TODO: Diagnose and fix Task API issues

## Step 1: Identify failing endpoint and request params
- Determine which endpoint fails (likely GET `/tasks/paged`).
- Capture HTTP status + stack trace.

## Step 2: Remove largest runtime failure mode
- ✅ Added server-side validation/whitelisting for `sortBy`, `direction`, `page`, `size` used in `/tasks/paged`.
- ✅ Only real entity fields are allowed (`createdAt`, `updatedAt`, `title`, `deadline`, `status`, `priority`, etc.).


## Step 3: Confirm behavior
- Run `./gradlew test` / `./gradlew bootRun` (if needed).
- Verify paged endpoint returns 200 for typical params.

## Step 4: Optional fixes if CORS is a problem
- ✅ Broadened CORS to also allow `http://127.0.0.1:5173`.


