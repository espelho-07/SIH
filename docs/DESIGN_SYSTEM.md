# HealthConnect Design System (HCDS)

**Version:** 1.0.0  
**Platform Code:** SIH26133  
**Status:** Canonical Design & Engineering Specification  
**Governing Principles:** Google-level simplicity, Apple-level polish, Stripe-level refinement, radical public-healthcare empathy, WCAG 2.2 Level AA accessibility.

---

## 1. Product Positioning & Visual Identity

HealthConnect is an integrated public-healthcare access and care-continuity platform for Indian citizens, frontline health workers (ASHA/ANM), and clinicians.

### Core Philosophy
1. **Public Healthcare First:** Government hospitals (District Hospitals, Community Health Centres [CHCs], Primary Health Centres [PHCs], and Sub-Centres) are primary. They must look dignified, capable, and trustworthy—never bureaucratic or substandard. Private empaneled facilities appear only as secondary options.
2. **Mobile-First for Web Now, Mobile App Later:** Every interaction pattern, touch target, and component must translate naturally to native mobile iOS/Android applications without architectural redesign.
3. **Calm, High-Contrast Surfaces:** Minimal visual noise. Whitespace is an intentional design feature. No AI gimmickry, no neon gradients, and no generic card overload.
4. **English-First Default:** The default UI language is polished, natural English, backed by an accessible 10-language regional switcher in the header.

---

## 2. Color Palette & Semantic Tokens

The palette is anchored in **Deep Forest Teal** (`#0F5147`), evoking clinical stability, hygiene, and calm assurance.

### 2.1 Brand & Neutral Tokens

| Token | Hex Value | Purpose & Usage |
| :--- | :--- | :--- |
| `--color-primary` | `#0F5147` | Primary brand color: buttons, active tabs, major headers, brand marks |
| `--color-primary-hover` | `#0B3D35` | Interactive hover/focus state for primary elements |
| `--color-primary-surface` | `#F2F9F8` | Soft brand-tinted background for active cards, chips, and banners |
| `--color-primary-border` | `#D0EAE6` | Delicate tinted border for primary callouts |
| `--color-background` | `#F8FAFC` | Page canvas background (warm, soft neutral to reduce eye strain) |
| `--color-surface` | `#FFFFFF` | Primary card and sheet container surface |
| `--color-surface-subtle` | `#F1F5F9` | Secondary card background, dividers, neutral chip surfaces |
| `--color-text-primary` | `#0F172A` | High-contrast body text and headings (Slate 900, ratio $> 11:1$) |
| `--color-text-secondary` | `#475569` | Secondary captions, sub-labels, metadata (Slate 600, ratio $> 5.5:1$) |
| `--color-text-tertiary` | `#94A3B8` | Watermark text, placeholders, disabled states (Slate 400) |
| `--color-border` | `#E2E8F0` | Subtle hairline dividers and card boundaries (Slate 200) |

### 2.2 Semantic & Healthcare Status Tokens

| Semantic Role | Background | Border | Text | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Available / Normal** | `#ECFDF5` | `#A7F3D0` | `#065F46` | Beds available, doctor on duty, equipment operational |
| **Limited / Warning** | `#FFFBEB` | `#FDE68A` | `#92400E` | High patient load, few beds remaining, minor delay |
| **Unavailable / Critical** | `#FEF2F2` | `#FECACA` | `#991B1B` | 108 Emergency, beds full, service disrupted |
| **Stale Telemetry** | `#FFF7ED` | `#FED7AA` | `#9A3412` | Telemetry unverified $> 8\text{ h}$ ("Call to verify") |
| **Government Healthcare** | `#E6F4F1` | `#B2DFDB` | `#004D40` | Dignified badge for public healthcare institutions |

---

## 3. Typography Hierarchy

The type system pairs **Plus Jakarta Sans** (editorial clarity, confident geometry) with **Inter** (clinical precision, micro-copy, and tabular numbers).

| Level | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | 32px / 2rem | 800 (Bold) | 1.2 | Patient Home hero greeting, critical token number |
| **H1** | 24px / 1.5rem | 700 (Bold) | 1.25 | Page titles (Find Care, Treatment Matcher) |
| **H2** | 20px / 1.25rem | 600 (Semibold) | 1.3 | Facility title, section headers |
| **H3** | 16px / 1rem | 600 (Semibold) | 1.4 | Card titles, department names, modal titles |
| **Body** | 15px / 0.9375rem | 400 (Regular) | 1.5 | Primary descriptions, physician notes |
| **Secondary** | 13px / 0.8125rem | 400 / 500 | 1.4 | Metadata, distance, addresses, wait times |
| **Caption** | 12px / 0.75rem | 500 / 600 | 1.3 | Badges, timestamps, small tags |
| **Tabular Data** | 16px - 28px | 700 (Bold) | 1.0 | Bed counts, queue position, token tickets (`font-mono`) |

---

## 4. Spacing & Rhythm System

All layouts adhere to an **8px base grid** with 4px micro-steps:

| Token | Size | Application |
| :--- | :--- | :--- |
| `space-1` | 4px | Internal badge padding, icon-to-label inline gap |
| `space-2` | 8px | Button internal padding, chip spacing, dense lists |
| `space-3` | 12px | Card internal padding on small mobile (< 380px) |
| `space-4` | 16px | Standard card padding, input height gutter, mobile margins |
| `space-5` | 20px | Section gap on mobile devices |
| `space-6` | 24px | Standard desktop card padding, section separation |
| `space-8` | 32px | Major layout block margins |
| `space-12` | 48px | Minimum touch target bounding box, hero vertical padding |

---

## 5. Component Standards

### 5.1 Primary Touch Targets
- All interactive elements (buttons, filter chips, navigation items, search bars) maintain a **minimum touch bounding box of $48 \times 48\text{ px}$**.
- Adjacent touch targets must maintain at least **8px** of separation.

### 5.2 Facility Result Card
A facility result card must answer **"Should I go here?"** within 3 seconds:
1. **Facility Name** with **Government Healthcare** badge.
2. **Distance & Travel Time** (`4.2 km • ~15 mins`).
3. **Clinical Match / Specialty** (`Cardiology OPD active today`).
4. **Key Resource Telemetry** (`ICU: 3 Available`, `Oxygen: 14 Available`).
5. **Operational Status** (Operational / High Load).
6. **Data Freshness** (`Updated 8 min ago`).
7. **Primary Action** (`View facility`).

### 5.3 Treatment Matcher Rationale ("Why this facility?")
Every clinical recommendation must provide a transparent, multi-point verification checklist:
- `✓ Required treatment available`
- `✓ Specialist on duty`
- `✓ Diagnostic equipment operational`
- `✓ Closest government facility with capacity`
- `✓ 100% Free Public Hospital / PM-JAY Cashless`

---

## 6. Accessibility (WCAG 2.2 AA)

1. **Contrast Ratios:**
   - Normal text: $\ge 4.5:1$ against adjacent surfaces.
   - Large text ($\ge 18\text{pt}$ or $\ge 14\text{pt}$ bold): $\ge 3:1$.
   - Interactive borders and icons carrying meaning: $\ge 3:1$.
2. **Keyboard Navigation:** Full keyboard focus traps for modals, visible focus rings (`ring-2 ring-primary ring-offset-2`).
3. **Screen Readers:** Semantic HTML (`<nav>`, `<main>`, `<article>`, `<header>`), descriptive `aria-label` for icon-only buttons, `aria-live="polite"` for queue and telemetry updates.
4. **Reduced Motion:** All CSS animations and transitions respect `prefers-reduced-motion: reduce`.
