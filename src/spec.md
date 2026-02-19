# Specification

## Summary
**Goal:** Fix the BillGenerator component to properly populate and display farmer billing data in the PDF print dialog instead of showing an empty page.

**Planned changes:**
- Debug and fix the BillGenerator component to ensure farmer details (name, customer ID, phone), billing period dates, collection data table, and totals are rendered correctly in the print dialog
- Verify that print styles in frontend/src/index.css are properly applied to show all bill elements with correct layout and formatting

**User-visible outcome:** When users click "Generate PDF" in the BillGenerator, the browser print dialog will open with a fully populated bill showing all farmer information, collection entries, and calculated totals ready to print or save.
