<!-- Sync Impact Report
Version change: 1.0.0 → 1.1.0 (MINOR: expanded constraints - format, responsive, performance, model source)
Modified principles: V. Web 3D Viewer Purpose → V. GLB Web 3D Viewer (format locked); Technology section expanded (modelos/ folder, no uploads)
Added sections: Responsive & Performance constraints (in Technology section)
Removed sections: none
Follow-up TODOs: none
-->

# Visor_3D Constitution

## Core Principles

### I. English-Only User Interface
All user-visible text in the Visor_3D web application MUST be in English.
No Spanish or mixed-language UI strings are permitted. Rationale: consistent
user experience for the defined audience.

### II. Spec-Defined Scope Only (NON-NEGOTIABLE)
No functionality outside approved specs MUST be implemented. YAGNI applies:
if it is not in a spec, it does not ship. Rationale: prevents scope creep
and keeps the constitution short and enforceable.

### III. Non-Technical Verifiable Success
Every success criterion MUST be verifiable by a non-technical person using
the running application, without reading code. Criteria requiring code
inspection, logs, or dev tools are rejected. Rationale: guarantees
user-observable value.

### IV. Simplicity and Clarity
Prefer the simplest solution that satisfies the spec. Complexity MUST be
justified in the spec. Keep constitution, specs, and UI clear and concise.

### V. GLB Web 3D Viewer
Visor_3D is a web application for visualizing 3D models in .glb format
only. All decisions MUST serve reliable GLB visualization in the browser.

## Technology & Hosting Constraints

The stack MUST be PHP with plain HTML/CSS/JavaScript on the frontend,
compatible with shared hosting at infinityfree.com. No build step, Node.js
runtime dependency, database server requirement, or technology incompatible
with InfinityFree free hosting MUST be introduced unless a spec explicitly
justifies it and proves deployability there. Models MUST load from the
local `modelos/` folder; no file uploads are permitted. The UI MUST be
responsive on desktop and mobile. Each model MUST load and become viewable
within 5 seconds under normal conditions; failure to meet this is a
spec violation verifiable by a non-technical user with a stopwatch.

## Development Workflow & Scope Discipline

Specs govern implementation. Changes to behavior require a spec update
first. Each change MUST be checked against this constitution for conflicts;
constitution supersedes specs and plans on conflict.

## Governance

Amendments require documenting the reason, bumping the version per
semantic versioning (MAJOR: incompatible principle removal/redefinition;
MINOR: new principle or expanded guidance; PATCH: clarifications/wording),
and updating the Last Amended date. All reviews MUST verify constitution
compliance. Brevity is a governance rule: keep this document short and clear.

**Version**: 1.1.0 | **Ratified**: 2026-10-15 | **Last Amended**: 2026-10-15
