# TaskFlow - Team Task Manager

TaskFlow is a dynamic, client-side project management web application built using vanilla HTML, CSS, and JavaScript. It provides a role-based workflow tailored for team managers and employees, complete with a real-time tracking dashboard, interactive sidebar controls, custom modals, and an integrated event calendar.

---

## Features

### Role-Based Access Control
The application features a built-in login overlay that supports distinct management permissions:
* **Managers:** Complete administrative oversight. Managers can view all project scopes, check aggregated team progress, add/delete projects, and create or reassign tasks across the entire employee register.
* **Employees:** Focus-centric environment. Employees see tailored views containing only their uniquely assigned tasks and collaborative projects. They can mark milestones complete but are limited from deleting or modifying administrative entities.

### Metric and KPI Dashboards
* Features a modular statistics array summarizing active project loads, raw task counters, and aggregate workforce statistics.
* Dynamic progress tracking automatically evaluates real-time workspace productivity using percentage visual cues.

### Integrated Scheduling Calendar
* An interactive dual-pane modal system built natively around standard dialog specifications.
* Left-pane features a responsive grid matrix for month-to-month calendar mapping.
* Right-pane handles dedicated logging for scheduling target points and persistent date-linked task summaries.

### Local Storage Persistence
* Leverages standard localStorage serialization to preserve user registers, multi-project workflows, custom task models, and standalone calendar events between active runtime sessions.

---

## Project Architecture

The core of the application relies directly on three interconnected foundational files:

```text
├── index.html     # Application layouts, interactive modals, and semantic structures
├── main.js        # Workspace data model logic, local state evaluation, and UI rendering updates
└── manager.css    # Flex/Grid application styling layouts, responsive cards, and animation states
