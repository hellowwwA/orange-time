# Orange Time Constitution

## Core Principles

### I. Glassmorphic & Aesthetic First
Every visual feature must adhere to the modern, aesthetic design system of Orange Time. This includes glassmorphism (backdrop filter blur, semi-transparent borders, and shadows), consistent HSL/Tailwind color palettes, and smooth interactive micro-animations. Plain/default browser elements are prohibited.

### II. Component-Driven Architecture
All UI elements must be built as modular, reusable React components in the `components/` directory. Keep components focused, self-contained, and isolated from global state side effects where possible.

### III. Simple & Clear State Flow
Maintain a clean distinction between UI presentation and data persistence. State transitions must be predictable, and mock/API calls should be abstracted in dedicated utility functions or hooks to keep the frontend logic decoupled.

### IV. Responsive & Accessible Layouts
The layout must be responsive, adapting gracefully from small mobile screens to large desktop monitors. Elements should have proper spacing, sizing, and contrast to ensure a comfortable user experience.

### V. Simplicity & YAGNI (You Aren't Gonna Need It)
Write clean, readable, and maintainable code. Do not implement complex features, abstractions, or libraries ahead of time unless they are actively required to meet project specifications.

## Technology Stack Constraints

- **Frontend**: React 19, Vite, Tailwind CSS
- **Visualization**: Recharts for interactive dashboard statistics
- **State/Persistence**: Local storage or simple REST API client
- **Containerization**: Docker & Docker Compose setup

## Development Workflow & Quality Gates

- **Specification Prior to Coding**: All major changes must have a clear specification (`.specify/` spec) and implementation plan before code modification.
- **Git Hygiene**: Follow clean branching, meaningful commit messages, and document key changes in `walkthrough.md`.

## Governance

This constitution governs all development and code reviews for the Orange Time repository. All changes and pull requests must be validated against these core principles. Any modification to this constitution requires a version increment and updating of dependent templates.

**Version**: 1.0.0 | **Ratified**: 2026-05-27 | **Last Amended**: 2026-05-27

