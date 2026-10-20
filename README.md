# 📚 Teacher Session Tracker

A lightweight, offline-first web app for private tutors to track student sessions, 
packages, hours, and fees — no backend, no account, no cost.

## Features

### Students
- Add, edit, and delete students
- Set hourly rate and package size (in hours)
- Alphabetical listing

### Session Logging
- Log sessions by hours or minutes
- Date picker (defaults to today)
- Optional notes
- Auto-splits sessions that overflow a package into Part 1 / Part 2

### Hour-Based Packages
- Packages tracked by hours, not session count
- Sessions sorted by date
- Changing package size recalculates everything from scratch

### Summary & Reporting
- Per-student package cards with progress, hours, and fees
- Paid / Unpaid totals in header
- Filter by student, month, or package number
- Edit or delete sessions with automatic package recalculation
- Mark packages as paid (highlighted in green)
- Share package summary via clipboard or WhatsApp Web
- Excel export (single package or all packages, with payment status)

### Settings & Backup
- Export full JSON backup (students, sessions, payment statuses)
- Import JSON backup with validation
- Warning if backup is older than 7 days

### Platform
- 4 pages: Students, Log Session, Summary, Settings
- Responsive: desktop top nav + mobile bottom nav
- German / English language switcher
- PWA — installable on mobile, works offline
- All data stored locally in the browser (localStorage)

## Tech Stack
React · TypeScript · Vite · Tailwind CSS · xlsx-js-style

## Live Demo
[teacher-session-tracker.vercel.app](https://teacher-session-tracker.vercel.app)

## Run Locally
npm install
npm run dev
