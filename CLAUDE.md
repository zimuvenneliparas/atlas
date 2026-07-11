# Atlas - Claude Development Guide

## Project

Atlas is an AI-powered SaaS platform that provides dozens of productivity tools for documents, images, data and business workflows.

The objective is to build the best all-in-one toolbox on the web.

Every technical decision must support this objective.

---

## Mission

Build a fast, beautiful and scalable platform.

Priorities:

1. User Experience
2. Performance
3. Clean Architecture
4. Reusable Components
5. Business Value

---

## Technology

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- React

Do not introduce additional libraries unless explicitly requested.

---

## Architecture Rules

Always:

- Create small reusable components.
- Avoid duplicated code.
- Keep business logic separated from UI.
- Prefer composition over large files.
- Reuse existing components whenever possible.

---

## UI Rules

Design style:

- Minimal
- Modern
- Premium
- Apple-like simplicity
- Fast loading

Avoid:

- Heavy animations
- Visual clutter
- Inconsistent spacing

---

## Design System

`docs/DESIGN_SYSTEM.md` is the single source of truth for the Atlas visual language: brand philosophy, brand references, color palette, typography, grid system, spacing, radius, shadows, component architecture, buttons, cards, inputs, badges, icons, animations, responsive rules and accessibility rules.

Every UI/frontend task must follow `docs/DESIGN_SYSTEM.md`. Read it before implementing or modifying any visual component. If a request conflicts with it, flag the conflict before implementing anything.

---

## Coding Rules

Before modifying multiple files:

1. Explain the implementation plan.
2. List every file to create or modify.
3. Wait for approval.

Never:

- Delete files without permission.
- Install packages without permission.
- Change project architecture without permission.

---

## Components

Each component must have a single responsibility.

Example:

Header

Hero

PopularTools

Categories

Footer

instead of a single 500-line page.

---

## Git

After completing a task:

Describe the changes.

Wait for approval before committing.

---

## Goal

The objective is not simply writing code.

The objective is building a scalable business.