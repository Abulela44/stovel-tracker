# Phone-first, installable stokvel app

## Goal
Make the existing stokvel dashboard comfortable on small phones, installable from the website on modern iPhone and Android devices, visually more polished, and able to save real changes securely.

## What will change

### 1. Phone-first navigation and layout
- Replace the crowded desktop header on phones with a compact top bar and a fixed bottom navigation for the main destinations.
- Put less-used destinations in a mobile “More” menu while keeping every current section reachable.
- Stack narrow cards, prevent long names and amounts from clipping, enlarge touch targets, and tighten spacing for 320–430px screens.
- Render the audit ledger as readable transaction cards on phones while retaining the table on larger screens.
- Make dialogs fit within the visible phone screen, scroll internally, and respect safe areas around notches and home indicators.

### 2. Complete visible actions
- Add working forms for “Add Member” and “Create New Motion,” including validation and clear success feedback.
- Add a useful notifications panel for overdue contributions, pending approvals, and upcoming payouts.
- Make payout receipt details open a complete detail view.
- Keep contribution recording, loan requests, approvals, voting, WhatsApp reminders, search/filtering, and CSV export working with the improved phone layout.

### 3. Secure saved data with Lovable Cloud
- Enable Lovable Cloud and add sign-in so each person’s access is protected.
- Store groups, memberships, members, contributions, payouts, loans, proposals, votes, transactions, notifications, and group security settings in the built-in database.
- Add group roles in a separate role table and enforce access rules so members only see groups they belong to; officers can perform management actions.
- Seed the current sample group and records so the upgraded app is populated immediately.
- Replace browser-only state with saved reads and updates, including loading, empty, success, and failure states.

### 4. Install from the website
- Add a web app manifest, branded icons, theme metadata, iPhone home-screen support, and standalone display behavior.
- Do not add offline caching, because offline use was not requested; installation remains lightweight and avoids stale preview issues.
- Add a small contextual install action when the browser supports it, with iPhone-specific Add to Home Screen guidance.

### 5. Visual refinement
- Preserve the established dark Sisonke/FBI identity while simplifying visual density, reducing oversized rounded surfaces, and improving contrast and hierarchy.
- Use consistent controls, status colors, spacing, and feedback across all sections.
- Keep the real group/member imagery and financial information prominent rather than turning the app into a marketing page.

## Technical details
- Keep the current TanStack Start single-dashboard architecture and split only reusable navigation, install, notification, and form pieces into focused components.
- Use authenticated server functions for saved reads and mutations, with database row-level access controls and explicit grants.
- Add route-specific metadata for search and social previews alongside the install metadata.
- Verify at 320px, 390px, and desktop widths; test the full add-member, contribution, loan, vote, motion, receipt, notification, and install-guidance flows.

## Important limitation
Website installation works across modern iPhone and Android browsers, but browser behavior differs: Android may show an install prompt, while iPhone users typically choose “Add to Home Screen” from Safari’s Share menu. App Store and Play Store listings are not part of this version.
