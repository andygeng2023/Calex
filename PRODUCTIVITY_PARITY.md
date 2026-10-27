# Calex productivity feature parity

This branch preserves the existing Calex design tokens and adds a local-first productivity workspace. It is a phased implementation, not a claim that all 248 requested capabilities are complete.

## Implemented in this branch
- Task creation, title editing, completion/reopening, soft-delete into a retained deleted-items collection, duplication, descriptions, notes, due dates, start/end times, priority, list assignment and tags.
- Task search and filters for active, today, overdue, high priority and completed.
- Checklists; list, board and calendar-style views; custom lists.
- Local persistence and JSON backup import/export.
- Habit creation, daily/weekly schedule labels, check-ins and streak count.
- Focus timer with selectable 15/25/45/60-minute sessions, task association and session history.
- Standalone notes and conversion of notes into tasks.
- Countdown dates for birthdays, exams, deadlines and events.

## Still requires separate engineering
- Server-side multi-device synchronization for productivity data, conflict-safe collaboration, shared lists, invitations, assignments, comments and activity feeds.
- Reliable push/email/desktop/location notifications, recurring-task/reminder scheduler and background delivery.
- Full recurring-event rules, timezone-safe duration handling, external calendar subscriptions and bidirectional Google Calendar synchronization.
- File/image attachments and secure upload/storage; voice capture/transcription; email/browser/OS integrations.
- Native iOS/Android widgets, wearable integrations, Siri/voice-assistant actions and desktop system shortcuts.
- Rich-text notes, annual/multi-day timeline, true drag-rescheduling, advanced smart filters, batch edit, archive/restore UI and full task history.
- Habit goals/quantitative tracking/statistics, Eisenhower Matrix, ambient audio, stopwatch, templates and full productivity analytics.
- Automated browser coverage for every new feature and verified accessibility/keyboard behavior.

## Validation
This branch has not been run in a browser or through Playwright here. Before merging, run npm ci, npm run format:check, npm run test:unit and npm test, then manually verify mobile Safari, desktop layout, persistence, backup import/export and task actions.