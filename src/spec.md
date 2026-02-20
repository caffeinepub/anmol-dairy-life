# Specification

## Summary
**Goal:** Add a read-only farmer portal page where farmers can view their bill and transaction history without any ability to modify data.

**Planned changes:**
- Create new route `/farmer-portal/:farmerId` for read-only access
- Display farmer details (name, customer ID) at the top
- Show current balance prominently
- List all transactions in chronological order
- Remove all navigation, edit, add, and delete functionality from this page
- Style with clean, mobile-friendly, print-ready layout

**User-visible outcome:** Farmers can access a dedicated page showing their complete bill and transaction history in a read-only format by visiting a URL with their farmer ID.
