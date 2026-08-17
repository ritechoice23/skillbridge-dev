# Checkpoint 01: Project Foundation & Layout Shell

## Goal

Build the complete visual foundation, responsive layout shell, design tokens, and clickable starter pages for the SkillBridge application using Next.js 16 App Router, Tailwind CSS v4, and shadcn/ui.

## Prompt

```text
Inspect the existing Next.js project before making any changes.

We want to build the visual foundation, layout shell, design theme, and starter route screens for the SkillBridge application.

Please follow these guidelines:
1. Inspect the existing project structure and package configuration first.
2. Use Next.js 16 App Router conventions with TypeScript and Tailwind CSS v4.
3. Initialize shadcn/ui components (button, badge, card, separator, sheet, skeleton) using the base style with nova preset.
4. Configure the design theme in globals.css using the custom landmark green primary brand color:
   - Light mode --primary: oklch(0.551 0.122 161.179) (#00875A)
   - Dark mode --primary: oklch(0.765 0.177 163.223) (#00d294)
   - Geist font variables and automatic system dark mode support.
5. Create the global layout components:
   - Header Navigation (components/layout/nav.tsx): Logo link to "/", navigation links ("Find Mentors", "Sign In", "Get Started"), and a responsive slide-out mobile drawer menu using Sheet.
   - Footer (components/layout/footer.tsx): Separator, copyright notice, and links.
   - Root Layout (app/layout.tsx): Title template "%s | SkillBridge", metadata, viewport, dark mode script, with Nav and Footer wrapping <main>.
6. Create the Marketing Homepage (app/page.tsx):
   - Hero section with headline ("Find practical mentors in tech, design, and business"), subtitle, "Find a Mentor" button linking to /mentors, and "Become a Mentor" button linking to /signup.
   - "How It Works" section with three cards: "Browse Mentors", "Send a Request", and "Connect & Grow".
7. Create a custom 404 Page (app/not-found.tsx) with a Card and a button to return home.
8. Create typed placeholder screens for all future application routes using a shared reusable Placeholder component (components/placeholder.tsx):
   - app/mentors/page.tsx (Find Mentors)
   - app/mentors/[id]/page.tsx (Mentor Profile)
   - app/(auth)/login/page.tsx (Log In)
   - app/(auth)/signup/page.tsx (Sign Up)
   - app/dashboard/page.tsx (Dashboard)
   - app/(mentor)/profile/page.tsx (Mentor Profile)
   - app/(mentor)/inbox/page.tsx (Mentor Inbox)
   - Route group layouts for app/(auth)/layout.tsx and app/(mentor)/layout.tsx.

Keep all page components clean and strongly typed with Next.js 16 conventions.

Verify with: npm run build
```

## Recovery and Alignment Prompt

```text
We are trying to align the project with Checkpoint 01 (Project Foundation & Layout Shell).

Expected state:
- shadcn/ui components initialized with landmark green theme (#00875A).
- components/layout/nav.tsx and components/layout/footer.tsx render in app/layout.tsx.
- app/page.tsx renders the landing page hero and feature cards.
- app/not-found.tsx renders the custom 404 card.
- Placeholder routes exist at /mentors, /mentors/[id], /login, /signup, /dashboard, /profile, /inbox.

Inspect the project, fix any broken imports, missing styles, or layout issues, and ensure npm run build succeeds cleanly.
```

## Quick Verification

1. Run `npm run dev` and open `http://localhost:3000` — confirm the landing page displays with green brand styling.
2. Click through the links ("Find Mentors", "Sign In", "Get Started") — confirm each route loads its placeholder card.
3. Visit `http://localhost:3000/random-url` — confirm the custom 404 screen appears.
