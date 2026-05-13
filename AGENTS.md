<!-- BEGIN:nextjs-agent-rules -->
# Multi-Tenant E-Commerce Strategic Implementation Guide

This project follows strict architectural and design rules for a high-end, multi-tenant e-commerce ecosystem. All agents must adhere to these standards to maintain system integrity and the "Minimalist Sharp" boutique aesthetic across all tenants.

## 1. Visual Identity (Minimalist Sharp)
- **Border Radius:** ALWAYS use `rounded-none` for **Product Cards** only. Buttons, inputs, and other UI elements should use standard or full rounding (e.g., `rounded-full`) to maintain a premium, boutique aesthetic.
- **Color Palette:** 
  - **Dynamic Theme:** ALWAYS use CSS variables (e.g., `var(--primary)`, `bg-primary`, `text-primary`). NEVER hardcode hex codes or specific color names in components.
  - **Single Source of Truth:** All theme variables are defined in `src/app/theme.css`. Refer to this file for available themes (e.g., `.theme-vintage`, `.theme-cyberpunk`, `.theme-ocean`).
  - **Contrast:** Maintain high contrast between background and foreground elements to ensure readability across all themes.

## 2. Navigation Standards
- **Home Page:** Fixed/Transparent at the top, transitioning to solid/blurred on scroll.
- **Other Pages (Shop, Checkout, etc.):** MUST be `sticky top-0` or `relative` with a solid background. Never overlap content on functional pages.
- **Mobile Navigation:** Force `sticky` with a solid background. All UI versions (V1, V2, V3, etc.) MUST use a uniform mobile navigation layout based on the V1 standard. No floating or transparent navbars on mobile to ensure accessibility and professional consistency.

## 3. Hero & Banner Structure
- **Text Stability:** Use a fixed-height container with `flex-col justify-end` for hero text. Content must expand upwards so that action buttons remain at a consistent vertical position regardless of text length.
- **Mobile Optimization:** Hide "Scroll Down" or "Explore" animated hint buttons on mobile viewports.

## 4. Multi-Tenancy & Branding
- **Dynamic Branding:** NEVER hardcode brand names (e.g., "ELYJEN"). Always source the brand name, logo, and metadata from the database/settings provider.
- **Tenant Isolation:** Ensure that configurations, categories, and products are correctly filtered by tenant context.
- **Domain Filtering:** ALL data operations (Fetching, Seeding, Updating) MUST strictly include a domain/tenant filter. Never allow data from one domain to leak into another.
- **Registry Pattern:** All UI variations (V1, V2, V3, etc.) are managed via `src/components/templates/Registry.tsx`. This system is extensible; always follow the established naming and selection pattern when adding new template versions for different tenants.
- **Standardization:** Maintain parity between `QuickViewModal` and the main product details page (e.g., sticky image side, scrollable details side).

## 5. Technical Stack & Tools
- **Framework:** Next.js (Server Components preferred for data fetching).
- **Styling:** Tailwind CSS (Strict adherence to utility-first, no ad-hoc CSS files).
- **Alerts:** Use **SweetAlert2** for all administrative confirmations and success/error notifications. Avoid native browser `alert()` or `confirm()`.
- **Icons:** Use `lucide-react`.

## 6. Data Integrity
- **Database:** MongoDB.
- **Seeding:** Maintain valid seeding scripts in `/scripts`. All seeding operations MUST be scoped to a specific domain. Ensure attribute labels (e.g., "Technology", "Material") are always sourced from the database and not hardcoded.
- **Data Privacy:** Strictly enforce that one tenant's products or orders are never accessible to another tenant via API or UI.

---
*Follow these rules strictly. If a request deviates from these standards, clarify with the user first.*
<!-- END:nextjs-agent-rules -->
