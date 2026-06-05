---
name: High-Velocity Performance
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#bec7d3'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#88929c'
  outline-variant: '#3f4851'
  surface-tint: '#93ccff'
  primary: '#93ccff'
  on-primary: '#003352'
  primary-container: '#10a0f0'
  on-primary-container: '#003352'
  inverse-primary: '#006398'
  secondary: '#ffb4a1'
  on-secondary: '#611300'
  secondary-container: '#ff5628'
  on-secondary-container: '#550f00'
  tertiary: '#c3c6cd'
  on-tertiary: '#2d3136'
  tertiary-container: '#95999f'
  on-tertiary-container: '#2d3137'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#cde5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d32'
  on-primary-fixed-variant: '#004b74'
  secondary-fixed: '#ffdbd1'
  secondary-fixed-dim: '#ffb4a1'
  on-secondary-fixed: '#3c0800'
  on-secondary-fixed-variant: '#881f00'
  tertiary-fixed: '#e0e2ea'
  tertiary-fixed-dim: '#c3c6cd'
  on-tertiary-fixed: '#181c21'
  on-tertiary-fixed-variant: '#43474d'
  background: '#111317'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
typography:
  display-h1:
    fontFamily: Archivo Narrow
    fontSize: 80px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Archivo Narrow
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
  headline-md:
    fontFamily: Archivo Narrow
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Archivo Narrow
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Fira Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Fira Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Archivo Narrow
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  headline-lg-mobile:
    fontFamily: Archivo Narrow
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  skew-angle: 6deg
---

## Brand & Style
The design system is engineered for a high-performance automotive ecosystem. It targets enthusiasts, professional drivers, and luxury collectors who demand precision and power. The aesthetic is **Technological Brutalism mixed with High-Performance Luxury**, evoking the visceral feeling of a cockpit at night.

The UI utilizes a "stealth-mode" foundation with aggressive high-contrast accents. Visual energy is derived from the tension between deep obsidian surfaces and high-intensity gradients. The style is defined by motion, using skewed geometry and metallic textures to imply speed even in a static state.

**Key Visual Principles:**
- **Kinetic Energy:** Use of italics and angled section breaks (5-10 degree skews) to create a forward-leaning silhouette.
- **Machined Precision:** Surfaces should appear as if they were CNC-milled or layered in carbon fiber, using subtle 1px borders and specular highlights.
- **The Redline Effect:** A signature decorative motif utilizing a tri-color gradient to indicate peak performance, urgency, or critical data points.

## Colors
The palette is rooted in deep, low-luminance values to ensure that the active elements—Electric Blue and the Redline Gradient—pop with maximum intensity.

- **Foundational Surfaces:** Use `#0B0D10` for global backgrounds and `#14181D` for alternating content blocks. 
- **The Redline Gradient:** Specifically reserved for "peak" moments: the top of a performance chart, active navigation states, or high-intensity decorative dividers.
- **Interactive States:** Primary CTAs use the Electric Blue gradient. Hover states should transition to the Azure `#178BD6` with a subtle outer glow (0px 0px 15px) of the same color.

## Typography
The typography system is designed to mimic automotive instrumentation and telemetry displays. 

- **Headlines:** Must be set in **Archivo Narrow**. Use the "Chrome Treatment" (vertical gradient) for H1 and section titles. Ensure all headlines are bold and italicized to reinforce the "forward motion" brand theme.
- **Body:** **Fira Sans** provides a humanist, readable contrast to the industrial headlines. Maintain a relaxed line-height (1.6) to ensure clarity against dark backgrounds.
- **Special Treatment:** For telemetry data or technical labels, use the `label-caps` style with wide letter-spacing to emulate etched metal components.

## Layout & Spacing
This design system utilizes a **12-column Fluid Grid** with specific structural modifications to suggest speed.

- **Skewed Sections:** Major section transitions should not be horizontal. Use a CSS clip-path or transform to create a `-6deg` skew on section dividers. 
- **The Redline Divider:** Use a 2px height line with the signature Redline Gradient to separate distinct content groups. 
- **Mobile Reflow:** On mobile, margins tighten to 20px. The "Mobile Bottom Bar" is a persistent element, using a background blur (`backdrop-filter: blur(12px)`) to stay legible over the dark, textured content.

## Elevation & Depth
Depth in this design system is created through **Tonal Layering and Specular Outlines** rather than traditional soft shadows.

- **Base Level:** `#0B0D10` (the road).
- **Surface Level:** `#14181D` (alternating sections).
- **Component Level (Cards/Inputs):** `#181C22`. Components must feature a `1px` solid border of `#2A2F37`.
- **Glassmorphism:** Navigation headers and mobile bars use a `70%` opacity version of the background base with a heavy backdrop blur.
- **Interactive Depth:** When a card or button is hovered, it should not just lift, but emit an **inner glow** (Electric Blue) and an outer **ambient drop shadow** (Electric Blue at 20% opacity).

## Shapes
Shapes are defined by "Aerodynamic Rigidity." Elements are neither fully sharp nor overly soft.

- **Standard Radius:** 4px to 6px. This provides enough "finish" to feel premium without losing the aggressive industrial edge.
- **Decorative Arcs:** Use the "Redline Gauge" motif—thin, curved lines with a stroke-width of 1px-2px—as background accents or to frame specific data visualizations.
- **Carbon Texture:** Apply a very subtle, low-opacity (5%) diagonal repeating pattern to `#181C22` surfaces to simulate high-end performance materials.

## Components
- **Buttons:** All buttons must be `uppercase` and `bold`. Primary buttons use the Electric Blue gradient. On hover, apply a `1.05x` scale transform and a blue glow. The corners are clipped at 6px.
- **Cards:** Cards use the `#181C22` surface. They feature a `1px` border of `#2A2F37`. On hover, the border color transitions to Electric Blue.
- **Inputs:** Dark backgrounds with a subtle internal shadow to create a "recessed" look, similar to a dashboard vent or port. The active state focus ring is the Redline Gradient.
- **The Redline Gauge (Telemetry):** Use for loading states or progress bars. It should be a thin arc that fills from Yellow to Red as it reaches 100%.
- **Mobile Bottom Bar:** A persistent, dual-action bar. One side handles "Navigation," the other handles the primary "Action" (e.g., Book Test Drive, Configure). It uses a semi-transparent dark finish with a top border in the Redline Gradient.