# Specification

## Summary
**Goal:** Add printable sell bill functionality with company header and transaction details.

**Planned changes:**
- Create a printable sell bill template that displays company header "ANMOL DAIRY LIFE", farmer name, product details (name, price per unit, quantity), total amount, and transaction date/time
- Trigger browser's native print dialog automatically after successfully saving a product sale
- Build a reusable utility function to generate HTML content for the sell bill with print-optimized styling

**User-visible outcome:** When saving a product sale, users can immediately print a formatted bill containing all transaction details with the company header.
