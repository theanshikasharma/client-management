Build-blocker fix notes (for demo readiness)

1) AuthPage
- Updated: `frontend/src/app/components/AuthPage.tsx`
- Change: `API` base moved from `http://localhost:8080` to `""` (relative)
- Reason: ensures Vite proxy routes `/auth/*` to the correct backend port; avoids CORS/port mismatch.

2) ChatBot
- Attempted: add stable system prompt/context for demo reliability.
- Build issue: `frontend/src/app/components/ChatBot.tsx` currently contains a JSX block syntax problem causing esbuild error:
  - `Unterminated regular expression` around the message rendering area.
- Current status: Frontend build is failing; OTP/AI demo cannot be verified end-to-end until ChatBot.tsx compiles.

Next action to unblock build
- Replace the entire `messages.map` JSX in ChatBot.tsx with a known-good minimal block.
- Keep only the existing working logic (loading indicator + markdown rendering) but re-create JSX structure to ensure parentheses/quotes are balanced.

