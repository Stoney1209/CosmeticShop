---
name: Luminous Editorial
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#50443f'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#82746e'
  outline-variant: '#d4c3bc'
  surface-tint: '#7a5646'
  primary: '#7a5646'
  on-primary: '#ffffff'
  primary-container: '#b78d7a'
  on-primary-container: '#44281a'
  inverse-primary: '#ebbda8'
  secondary: '#695b58'
  on-secondary: '#ffffff'
  secondary-container: '#eedcd7'
  on-secondary-container: '#6d605c'
  tertiary: '#5e5e5c'
  on-tertiary: '#ffffff'
  tertiary-container: '#979693'
  on-tertiary-container: '#2e2f2c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#ebbda8'
  on-primary-fixed: '#2e1508'
  on-primary-fixed-variant: '#603f30'
  secondary-fixed: '#f1dfda'
  secondary-fixed-dim: '#d4c3be'
  on-secondary-fixed: '#231917'
  on-secondary-fixed-variant: '#504441'
  tertiary-fixed: '#e4e2de'
  tertiary-fixed-dim: '#c8c6c3'
  on-tertiary-fixed: '#1b1c1a'
  on-tertiary-fixed-variant: '#474744'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  h1:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
  h3:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin: 64px
  stack-sm: 16px
  stack-md: 32px
  stack-lg: 80px
---

## Brand & Style

The design system is anchored in "Quiet Luxury"—a philosophy that prioritizes intentionality, space, and sensory grace over visual noise. Designed for a discerning clientele in the high-end beauty sector, the system evokes a sense of indulgence and professional-grade efficacy.

The aesthetic blends **Minimalism** with **Modern Editorial** influences. It utilizes expansive whitespace to frame products like art pieces, while incorporating subtle depth through soft shadows and layered textures. The interface is designed to feel as smooth and premium as the products it showcases, providing a serene digital environment that builds trust and reinforces brand authority.

## Colors

The palette is a sophisticated curation of warm, skin-adjacent tones designed to feel organic yet polished. 

- **Rose Gold (Primary):** Used for primary actions, accents, and high-priority states. It conveys a metallic luster without being gaudy.
- **Soft Pink (Secondary):** Employed for backgrounds, chips, and subtle highlights. It provides a feminine, soft touch that balances the stronger charcoal.
- **Creamy White (Tertiary):** The foundational surface color. It is warmer and more luxurious than pure white, reducing eye strain and feeling more "boutique."
- **Deep Charcoal (Neutral):** The core for all typography and iconography to ensure AAA accessibility and a modern, high-contrast legibility against the softer backgrounds.

## Typography

This design system employs a classic editorial pairing to establish a clear information hierarchy.

- **Headlines:** `Noto Serif` brings a timeless, literary authority. It should be used for product names, section headers, and storytelling elements. Tighten letter spacing slightly for larger display sizes to maintain a cohesive look.
- **Body & Interface:** `Manrope` provides a clean, geometric sans-serif contrast. Its high x-height ensures readability for product descriptions, ingredient lists, and checkout flows.
- **Utility:** Small labels and navigational elements should use `Manrope` in SemiBold with increased letter spacing and uppercase styling to create a distinct visual "tag" feel.

## Layout & Spacing

The layout philosophy is a **Fixed Grid** system for desktop (12 columns, 1200px max-width) and a **Fluid** model for mobile. 

- **The Breathable Margin:** Substantial outer margins (64px+) are required to maintain the "high-end" feel. 
- **Rhythm:** Use an 8px base unit for most spacing, but expand to 80px or 120px for vertical section separation (Stack-LG) to allow the high-quality product photography room to breathe. 
- **Content Density:** Keep character counts per line in body text between 45-75 for optimal readability.

## Elevation & Depth

Visual hierarchy is managed through **Ambient Shadows** and **Tonal Layers**.

- **Shadow Character:** Use extremely diffused, low-opacity shadows (Opacity 4-8%) with a slight warm tint (#2C2C2C with a hint of #B78D7A) rather than pure black. This creates a soft "lift" off the page that feels like natural lighting in a studio.
- **Layering:** Backgrounds use Creamy White, while elevated cards or "floating" elements use pure White (#FFFFFF) to create a subtle but perceptible difference in depth.
- **Transitions:** Hover states should involve a slight vertical shift (2-4px) and an increase in shadow diffusion to simulate the element moving closer to the user.

## Shapes

The design system utilizes **Rounded** geometry to evoke softness and accessibility.

- **Primary Radius:** A consistent 10px (0.5rem-0.625rem) radius is applied to buttons, input fields, and product cards.
- **Large Radius:** 24px (1.5rem) is used for containers like modals or "Quick View" panels to create a welcoming, soft-edged container.
- **Images:** All product photography should have the Primary Radius applied to avoid sharp corners that clash with the organic nature of beauty products.

## Components

### Buttons
- **Primary:** Solid Rose Gold with White text. No border. Subtle shadow on hover.
- **Secondary:** Transparent background with a 1px Rose Gold border and Rose Gold text.
- **Tertiary:** Underlined text link in Deep Charcoal for low-priority actions.

### Form Fields
- Inputs feature a light Cream background with a 1px border (#EBE2DE).
- On focus, the border transitions to Rose Gold, and the background remains clear.
- Error states use a muted terracotta rather than a harsh bright red.

### Product Cards
- Minimalist design: High-res image takes 70% of the card.
- Text is center-aligned below the image using Noto Serif for the name and Manrope for the price.
- "Add to Cart" appears as a subtle overlay or a clean icon on hover to minimize visual clutter during browsing.

### Icons
- Use 1.5pt stroke weight icons.
- Icons should have slightly rounded terminals to match the shape language.
- Avoid filled icons unless indicating an "Active" state (e.g., a filled heart for Favorites).

### Additional Components
- **The "Story" Component:** A full-bleed image/video background with Noto Serif typography overlaid, used for brand values or ingredient highlights.
- **The Ingredient Chip:** Small, rounded-pill tags in Soft Pink with Charcoal text to highlight "Vegan," "Cruelty-Free," etc.