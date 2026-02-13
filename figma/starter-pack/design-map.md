# Design Map

## Route Map

- `/#/` -> Home
- `/#/chapter-information` -> Chapter Information
- `/#/meetings-delegates` -> Meetings & Delegates
- `/#/programs-events` -> Programs & Events
- `/#/resources` -> Resources
- `/#/council-admin` -> Council Admin
- `/#/council-admin/compliance` -> Compliance Checklist
- `/#/council-admin/content` -> Content Manager (Leadership)

## Global Layout Blocks

- Sticky top nav (desktop tabs + mobile drawer)
- Main content container (`max-w-7xl` or page-specific widths)
- Black footer with legal/internal text

## Core Page Sections

### Home
- President welcome block
- Quick links
- Internal updates/news cards

### Chapter Information
- Officers & Contact card grid
- Delegates table/cards
- Governing documents list

### Meetings & Delegates
- Upcoming meetings cards/calendar
- Records archive
- Delegate reports status blocks

### Programs & Events
- Upcoming events
- Event archive
- Signup forms and flyer links

### Resources
- Shared forms by category
- National org links
- Training resources

### Council Admin
- Restricted banner
- Compliance launch card
- Content manager launch card
- Internal documents
- Task tracker

### Compliance Checklist
- Dark hero with completion status
- Progress bar and save/reset row
- 3 timeline sections (financial/admin/programmatic)
- Expandable requirement details

### Content Manager
- Editable Executive Board list
- Editable Additional Chairs list
- Save to D1-backed API

## Shared Components Inventory

- `MainLayout` navigation + footer
- `Card`, `Badge`, `Tabs`, `Table`, `Button`
- `StatusBadge`
- `CouncilAdminGate` access lock view
- Form inputs (`Input`, `Label`) in content manager

## Visual Direction Notes

- Primary palette is black/white/gray with subtle accent colors by section.
- Heavy use of rounded cards, thin borders, and soft shadows.
- Iconography is Lucide, line style.
- Motion is entry/fade/slide (small distances, fast durations).
