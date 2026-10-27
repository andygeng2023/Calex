# Calex productivity parity: implementation and verification status

This branch keeps the current Calex design and adds a local-first productivity workspace. The 248-item request is broader than one UI patch: many items require backend services, OAuth consent, operating-system integrations, or platform-specific clients. This document deliberately distinguishes working local features from items that still need engineering; do not describe the whole inventory as complete.

## Working implementation on this branch

### Tasks and organization
- Create tasks, edit title/description/notes, set start date and due date, start/end times, optional duration, all-day flag, and low/medium/high priority.
- Complete/reopen tasks, soft-delete into trash, restore deleted tasks, permanently delete from trash, duplicate tasks, archive completed tasks, restore archived tasks.
- Add checklist items and subtasks; add comments/activity notes, URL links, locations, file/image attachments (local files up to 1 MB each).
- Set task tags, move tasks between lists, choose task status, mark urgency/importance, use recurrence rules (daily/weekly/monthly) to create a next occurrence after completion.
- Search task title/description/notes/tags/list; filter active/today/overdue/high-priority/completed; batch-edit selected tasks; natural-language quick-add for today/tomorrow/next week, simple times, #tags and !high/!low.
- List, board and month-grid views; drag-reorder task cards; drag tasks to a board column to change status; drag tasks onto calendar dates to reschedule.
- Create lists and folders, edit list name/folder/color, review tags in use.
- Export tasks as JSON, CSV and iCalendar; import/restore JSON backups.
- Local browser notifications for reminders, when permission is granted and Calex is open; multiple reminder timestamps can be added to a task.

### Additional productivity tools
- Habits with daily/weekly schedule labels, check-ins, streak counts and local history.
- Focus timer with configurable 15/25/45/60-minute sessions, task association and local session history.
- Standalone notes, note search through the notes UI/browser controls, and note-to-task conversion.
- Countdown dates for deadlines, birthdays, exams and other events.
- Eisenhower matrix, task timeline with manual progress, reusable task templates, local completion statistics, preference settings.
- JSON backup import/export; all productivity objects are currently stored in browser local storage.

## Automated verification
- Playwright tests cover task creation and persistence, archive/restore, and opening the productivity views without runtime errors.
- Existing Calex tests cover the calendar, mobile layouts, offline shell and other application workflows.
- GitHub Actions results must be checked on the latest branch commit before merging. Browser coverage is not exhaustive for every new action, and no local Playwright run was possible in the editing environment.

## Not complete; do not claim parity yet

| Capability group | Remaining work |
|---|---|
| Sync and accounts | Sync productivity objects to a backend; cross-device task/list/folder/tag/reminder sync; conflict resolution and offline reconciliation for the new data model |
| Collaboration | Shared lists, invitations, member permissions, assignments, shared comments, live updates, responsibility coordination and audit trail |
| Notifications | Guaranteed background push, email delivery, location/geofence triggers, native notification sounds, configurable notification channels and daily planning prompts |
| Calendar integration | Google Calendar OAuth and bidirectional synchronization, subscribed external calendars, external event overlays, full timezone/DST-safe scheduling, recurring exceptions, year and true multi-day views |
| Mobile/desktop integrations | Native iOS/Android widgets, desktop widgets/shortcuts, browser extensions, wearable apps, Siri and other voice assistants, email-to-task integration |
| Capture/AI | Voice input/transcription, browser selected-text capture, AI-assisted task creation, supported email capture and audio summarization |
| Rich content | Full rich-text/Markdown editor, document attachment storage with secure uploads, image gallery, advanced notes folders and reliable full-text indexing |
| Advanced tasks | Full undo/history, advanced custom smart filters, saved filters, full batch-edit fields, sophisticated recurrence rules, reminder rules for checklist items, task dependencies and complete task activity |
| Productivity | Quantitative habit goals/statistics, full focus analytics, stopwatch, ambient audio/white noise, complete Pomodoro/break controls, complete templates and recurring workflow builder |
| UI preferences | Full theme system for productivity views, icon picker, date/time format integration, configurable week start throughout every calendar view, widget configuration |
| Security/operations | Server-side access control, attachment quotas/scanning, data retention controls, robust migrations, import validation for every format, performance and accessibility audits |

## Data and privacy notes
- Productivity records are local to this browser/profile. JSON import/export is the manual backup/transfer mechanism. Existing Calex calendar sync does not automatically imply these new task objects sync.
- Local attachment data is stored as data URLs and limited to 1 MB per file to reduce browser-storage risk. Large or sensitive files should not be attached in this prototype.
- Browser reminders depend on permission and the page being open; they are not a substitute for a server-backed or native background notification service.
- Recurrence supports only daily, weekly and monthly next-occurrence generation and does not yet handle exception dates, missed runs, timezone rules or edits to a recurring series.
- The calendar grid and board drag interactions are intentionally limited; this is not yet a full scheduling engine.
