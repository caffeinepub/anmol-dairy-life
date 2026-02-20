# Specification

## Summary
**Goal:** Add edit functionality to Cash, Sell, and Milk Collection entries so users can modify existing records.

**Planned changes:**
- Add edit buttons to each cash transaction entry (Cash Payment and Cash Received)
- Add edit buttons to each product sale entry
- Add edit buttons to each milk collection entry in data reports
- Create edit forms pre-populated with existing data for all three entry types
- Implement backend update functions for CollectionEntry, Transaction, and ProductSale records
- Auto-recalculate milk collection amounts when fat/SNF/weight values are edited
- Refresh entry lists after successful edits

**User-visible outcome:** Users can click an edit button on any cash transaction, product sale, or milk collection entry to modify its details, with changes immediately reflected in the lists.
