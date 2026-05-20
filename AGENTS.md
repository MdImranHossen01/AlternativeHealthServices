<!-- BEGIN:nextjs-agent-rules -->
# Multi-Version E-Commerce Platform Implementation Guide

This project is a multi-version e-commerce platform (not a multi-tenant project). It is designed to customize storefronts for different clients by selecting and combining specific versions of UI components (such as Navbar V1-V6, Footer V1-V6, and Product Card V1-V6).

## 1. Project Architecture
- **Component Versioning:** The platform supports multiple versions (V1 to V6) of core UI components:
  - **Navbars:** V1 - V6
  - **Footers:** V1 - V6
  - **Product Cards:** V1 - V6
- **Client Selection:** Each client uses a specific version of these components to customize their storefront.
- **Registry Pattern:** Variations are registered and selected dynamically. Always follow the established registration pattern when adding or modifying component versions.

## 2. Visual Identity & Styling
- **Dynamic Themes:** Always use CSS variables (defined in `src/app/theme.css`) for branding and styling. Do not hardcode hex codes or color names directly.
- **Aesthetic Quality:** Maintain high-quality visual standards across all versions of the components.

## 3. Technical Stack & Tools
- **Framework:** Next.js.
- **Styling:** Tailwind CSS.
- **UI Components:** shadcn/ui.
- **Toasts:** Use **shadcn/ui Sonner** (sonner) for toast notifications.
- **Alerts:** Use **SweetAlert2** for all administrative confirmations and success/error notifications. Avoid native browser `alert()` or `confirm()`.
- **Icons:** Use `lucide-react`.
- **Database:** MongoDB.
<!-- END:nextjs-agent-rules -->
