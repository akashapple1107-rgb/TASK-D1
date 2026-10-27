# DEV@Deakin Task D1

This project retains the original portfolio and latest featured cards.

## Run

Run `npm run dev` in this folder. The frontend normally uses http://127.0.0.1:5175 and Express uses http://127.0.0.1:3002. Use the address printed by Vite if its port is busy. Do not start two copies of the backend.

For production, run `npm run build` and `npm start`, then open http://127.0.0.1:3002.

## Features

- Validated registration, bcrypt password hashes and Free-plan users in Firestore.
- Signed one-hour JWT sessions in localStorage, shared through React Context. Logout clears the browser token.
- Free/Paid pricing comparison and upgrade eligibility based on the current user.
- Demonstration payment modal with frontend and backend validation. Use test card 4242 4242 4242 4242, a future expiry and code 123.
- A Firestore transaction saves plan=paid and upgradedAt. No card details are stored and no money is charged. A second upgrade is blocked.
- Validated questions and articles saved with the authenticated author's ID.
- Existing SendGrid newsletter integration retained.

## Main files

src/AuthContext.jsx manages sessions. src/pages/Pricing.jsx and src/components/UpgradeModal.jsx provide the subscription interface. src/paymentValidation.js shares payment validation between frontend and backend. backend/app.js defines the API. server.js connects Firestore and SendGrid. src/pages/NewPost.jsx saves posts.

## Configuration

Existing Firebase and SendGrid settings are retained in .env, with a generated JWT_SECRET. Keep .env and secrets/ out of Git. .env.example lists required variables. Browser Firestore access is denied by firestore.rules; the backend uses the Admin SDK.

## Verification

The production build and 13 automated tests pass. Run `npm test` to repeat the tests using isolated in-memory storage. Live checks confirmed two demo registrations, login, successful upgrade, persistence after refresh and fresh login, logout, and two saved posts. Direct Firestore reads verified both plans and posts. Real email delivery was not invoked.

## Report

docs/SIT313-D1-Report.docx contains the introduction, features, pricing, upgrade modal and success screenshots. Website screenshots are in docs/screenshots. Add your student ID, GitLab and Panopto links, and your own Firestore users/posts screenshots in the marked places. The screenshot guide identifies the records. Demo account passwords are supplied separately and are not in the report or repository.
