# Content Guide (Google Sheets Tabs)

All portal content is authored in a single Google Sheet, split into tabs.

Run `setupSheets()` from `apps-script/Code.gs` once to create all tabs and header rows.

## Special Case: SiteConfig

Tab: `SiteConfig`

Headers: `key`, `value`

Examples:
- `councilName` -> `National Pan-Hellenic Council of Hudson County`
- `footerText` -> `© 2026 ...`
- `presidentMessage_1`, `presidentMessage_2`, `presidentMessage_3` -> message paragraphs

## Home

- `QuickLinks`: `id`, `label`, `iconName`, `url`, `row`
- `Updates`: `id`, `title`, `date`, `type`

## Chapter Info

- `Officers`: `id`, `name`, `title`, `chapter`, `email`, `phone`, `status`
- `Delegates`: `id`, `name`, `chapter`, `role`, `email`, `phone`, `status`
- `GoverningDocs`: `id`, `title`, `type`, `updated`, `fileUrl`

## Meetings

- `UpcomingMeetings`: `id`, `title`, `date`, `time`, `location`, `type`
- `MeetingRecords`: `id`, `date`, `title`, `agendaFile`, `minutesFile`, `status`
- `DelegateReports`: `id`, `meetingCycle`, `chapter`, `submittedBy`, `dateSubmitted`, `status`

## Programs & Events

- `Events`: `id`, `title`, `date`, `location`, `description`, `type`, `registration`
- `EventArchive`: `id`, `title`, `date`, `attendees`, `status`
- `EventFlyers`: `id`, `title`, `type`, `date`, `fileUrl`
- `SignupForms`: `id`, `title`, `description`, `deadline`, `status`, `formUrl`

## Resources

- `SharedForms`: `category`, `id`, `name`, `description`, `link`
- `NationalOrgs`: `id`, `name`, `website`, `founded`
- `TrainingResources`: `id`, `title`, `description`, `type`, `updated`, `fileUrl`

## Council Admin

- `InternalDocs`: `category`, `iconName`, `id`, `name`, `updated`, `status`
- `Tasks`: `id`, `task`, `assignedTo`, `dueDate`, `priority`, `status`

## What Happens After You Edit The Sheet

The build process runs `scripts/sync_sheets.mjs` (via `npm run build`) and writes `src/app/data/generated-data.ts`.
Your hosting provider rebuilds periodically (or via deploy hook), so changes appear after the next deploy.

