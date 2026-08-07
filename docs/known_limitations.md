# CodeMe Academy Known Limitations & Technical Debt

## 1. Features Intentionally Postponed
- **Live Streaming Subsystem**: Real-time video conferencing (WebRTC) is heavily resource-intensive and requires dedicated scaling. It is deferred to Version 2.0.
- **Native Mobile Apps**: Currently, the platform relies purely on responsive web PWA standards. Dedicated iOS/Android wrappers are deferred.
- **Automated Tax Calculation**: Stripe/Tax integration for automatic VAT parsing on international sales is currently deferred in favor of manual reconciliation.

## 2. Technical Debt
- **Monolithic Frontend Asset Size**: Due to the massive scope of the `lucide-react` icons and `recharts`, the primary `index.js` payload is slightly heavy. Code-splitting optimizations should be heavily prioritized in the first maintenance cycle.

## 3. Operational Limitations
- **Manual Payment Workflow**: Staff must manually verify MTCN/receipt numbers. While secure, this limits extreme scaling velocities without expanding the admin workforce.

