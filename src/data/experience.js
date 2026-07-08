/**
 * EXPERIENCE TREE — rendered exactly like the Linux `tree` command.
 *
 * Editing rules:
 *   - `label`  : the bold part of the line (role, company, degree)
 *   - `detail` : optional muted text after the label (dates, notes)
 *   - `children`: nest as deep as you like; glyphs are computed
 *
 * Add a job = add one object. Reorder = move it. That's it.
 */
export const EXPERIENCE_TREE = [
  {
    label: 'rocket-mortgage/',
    detail: 'Detroit, MI',
    children: [
      {
        label: 'swe-intern',
        detail: 'may 2026 → present',
        children: [
          { label: 'data-governance backend: legal-hold overrides for GDPR/CCPA deletions' },
          { label: 'REST API refactors + data-validation bug fixes' },
        ],
      },
      {
        label: 'swe-intern',
        detail: 'may 2025 → aug 2025',
        children: [
          { label: 'Dynatrace dashboard from scratch → observability for 9 engineers' },
          { label: 'Terraform hardening: reduced cloud attack surface' },
        ],
      },
    ],
  },
  {
    label: 'eeci/',
    detail: 'Electronics & Engineering Co. of India',
    children: [
      {
        label: 'junior-software-engineer',
        detail: 'jun 2020 → may 2022',
        children: [
          { label: 'real-time sensor viz on handheld devices: 100-200ms → 15ms (C#/C++)' },
          { label: 'hardware abstraction layer: new-variant integration in ~4h' },
          { label: 'standardized git workflows + onboarding docs for a team of 11' },
        ],
      },
      {
        label: 'swe-intern',
        detail: 'jul 2019 → may 2020',
        children: [
          { label: 'shared C# library for firmware flashing + address-space init' },
          { label: 'pub-sub migration: −900 polling calls/min across 30 machines' },
        ],
      },
    ],
  },
  {
    label: 'education/',
    children: [
      {
        label: 'arizona-state-university',
        detail: 'MS Software Engineering · GPA 3.97 · 2024 → 2026',
      },
      {
        label: 'nmims-mpstme',
        detail: 'BTech Computer Engineering · 2014 → 2020',
      },
    ],
  },
];
