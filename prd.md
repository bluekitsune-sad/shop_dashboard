# Phone & Accessories Shop Management Dashboard

## MVP Product Requirements Document

Github_REPO_URL=https://github.com/bluekitsune-sad/shop_dashboard.git

---

# 1. Project Overview

Build a responsive web-based inventory management dashboard for a small retail shop selling:

* Mobile phones
* Phone accessories
* Perfumes / fragrances

The shop currently manages inventory manually using pen and paper.

The purpose of this application is to replace the manual inventory process with a simple digital system.

The first version must remain an **MVP**.

Do not attempt to build a complete ERP, accounting system, or advanced POS.

The MVP should focus on:

> **Products → Stock Added → Products Sold → Stock Updated → Activity Monitored**

The application must be easy enough for a shop owner who is accustomed to pen-and-paper management.

---

# 2. Primary MVP Objective

The MVP must allow the shop owner to:

1. Add products
2. Categorize products
3. View products and current stock
4. Add stock
5. Mark products as sold
6. Automatically decrease stock when a sale is recorded
7. Manually adjust stock when necessary
8. View inventory movement history
9. Identify low-stock products
10. Identify out-of-stock products
11. Monitor basic daily activity
12. View basic revenue information
13. Search and filter inventory
14. Use the application comfortably on an iPhone and a regular laptop

Everything else is secondary.

---

# 3. Technology Stack

Use the following stack unless there is a strong technical reason to change it.

## Application

* Next.js
* TypeScript
* App Router

## UI

* Tailwind CSS
* shadcn/ui
* Lucide icons

## Database

* SQLite/libSQL
* Turso for hosted database

## ORM

* Drizzle ORM

## Validation

* Zod

## Forms

* React Hook Form

## Testing

* Vitest
* Playwright

## Source Control

* GitHub

## Deployment

* Vercel for application hosting/development previews

Production hosting must use a plan appropriate for the client's commercial use. Do not assume a free/personal hosting plan is appropriate for a commercial client.

---

# 4. Architecture

Use a simple monolithic Next.js architecture.

Do NOT create a separate Express, NestJS, or FastAPI backend for the MVP.

Preferred structure:

```text
Browser
   │
   ▼
Next.js
   │
   ├── React UI
   ├── Server Components
   ├── Server Actions
   └── Route Handlers where appropriate
          │
          ▼
      Drizzle ORM
          │
          ▼
     Turso / libSQL
```

The goal is to keep the project easy to develop, deploy, understand, and maintain.

---

# 5. Core Design Principle

The most important rule is:

> **Do not over-engineer the MVP.**

The shop does not need an enterprise inventory system.

Every feature should be evaluated against:

> "Does this help the owner know what products they have, what came in, what was sold, and what needs attention?"

If not, defer it.

---

# 6. MVP Scope

## IN SCOPE

### Products

* Create product
* Edit product
* View product
* Delete/archive product where appropriate
* Categorize product
* Search products
* Filter products
* Product pricing
* Product stock
* Minimum stock level

### Inventory

* Add stock
* Sell stock
* Adjust stock
* Inventory movement history
* Stock status
* Low-stock monitoring
* Out-of-stock monitoring

### Monitoring

* Total products
* Total stock units
* Low-stock products
* Out-of-stock products
* Today's sales
* Today's items sold
* Today's stock additions
* Basic revenue

### UI

* Mobile-first design
* iPhone support
* Laptop support
* Responsive dashboard
* Touch-friendly controls

---

# 7. OUT OF MVP SCOPE

Do NOT implement these initially:

* Advanced POS
* Barcode scanner
* Barcode printer integration
* Receipt printer
* Customer management
* Supplier management
* Purchase orders
* Expense management
* Accounting
* Staff management
* Complex roles/permissions
* Multiple branches
* Multiple warehouses
* Loyalty programs
* Customer credit
* Advanced analytics
* Forecasting
* Automated purchasing
* Notifications
* Email/SMS
* Payment gateway integration

These belong to future phases.

---

# 8. Navigation

Keep navigation minimal.

Recommended sections:

```text
Dashboard
Inventory
Sell
Activity
```

Optional:

```text
Categories
```

Categories may be managed from the inventory/product area instead of having a separate navigation item if that creates unnecessary complexity.

---

# 9. Dashboard

The dashboard is the application's home screen.

It should immediately answer:

> "What is happening with my shop's inventory?"

## Summary cards

Display:

### Total Products

Number of active products.

### Total Stock

Total number of physical units currently in inventory.

### Low Stock

Number of products where:

```text
stock_quantity > 0
AND
stock_quantity <= minimum_stock
```

### Out of Stock

Number of products where:

```text
stock_quantity = 0
```

### Today's Sales

Number of sales recorded today.

### Today's Items Sold

Total quantity sold today.

### Today's Revenue

Total selling value recorded today.

---

# 10. Dashboard Low-Stock Section

Show products that require attention.

Example:

```text
Low Stock

USB-C Cable             3 left
iPhone 13 Case          2 left
20W Charger              1 left
```

Selecting a product should open its product details.

Provide a quick:

```text
Add Stock
```

action.

---

# 11. Dashboard Out-of-Stock Section

Show products with:

```text
stock_quantity = 0
```

Example:

```text
Out of Stock

iPhone 14 Case
20W Charger
AirPods Case
```

The user should be able to open the product and add stock.

---

# 12. Recent Activity

Display recent inventory activity.

Example:

```text
Today

Sold
USB-C Cable
-2

Stock Added
USB-C Cable
+20

Adjusted
iPhone 13 Case
-1
Reason: Damaged
```

The dashboard should show the most recent activity rather than an enormous history table.

Provide a way to view the complete activity history.

---

# 13. Product Management

Products share a common base model.

Required fields:

```text
Product Name
Category
Brand
SKU / Product Code
Purchase Price
Selling Price
Current Stock
Minimum Stock
Image (optional)
Notes (optional)
```

Do not force every product to use every possible field.

---

# 14. Product Categories

Initial top-level categories:

```text
Phones
Accessories
Perfumes
```

The category system should be extensible.

Example subcategories:

### Phones

* Apple
* Samsung
* Xiaomi
* Oppo
* Vivo
* Other

### Accessories

* Charger
* Cable
* Case
* Screen Protector
* Earbuds
* Headphones
* Power Bank
* Other

### Perfumes

* Men's
* Women's
* Unisex
* Other

Do not hard-code the system so that additional categories become impossible later.

---

# 15. Phone Products

Phones may contain additional information.

Potential fields:

```text
IMEI
RAM
Storage
Color
Condition
Warranty
PTA Status
```

These fields should only be displayed when the product belongs to the phone category.

Do not make accessory and perfume products fill phone-specific fields.

---

# 16. Accessory Products

Accessories should remain simple.

Potential fields:

```text
Brand
Model
Variant
Color
Compatibility
```

Only show relevant fields.

---

# 17. Perfume Products

Potential fields:

```text
Brand
Fragrance Name
Volume
Variant
```

Again, keep the interface simple.

---

# 18. Product Status

Every product should automatically receive a stock status.

## In Stock

```text
stock_quantity > minimum_stock
```

## Low Stock

```text
stock_quantity > 0
AND
stock_quantity <= minimum_stock
```

## Out of Stock

```text
stock_quantity = 0
```

The status must be derived from the current stock rather than manually entered by the user.

---

# 19. Inventory Management

Inventory is the most important module.

The owner must be able to perform three fundamental operations:

```text
ADD STOCK
SELL
ADJUST STOCK
```

---

# 20. Add Stock

Example workflow:

```text
Inventory
   ↓
Select Product
   ↓
Add Stock
   ↓
Enter Quantity
   ↓
Optional Note
   ↓
Confirm
```

Example:

```text
USB-C Cable

Current Stock: 10

Quantity to Add:
20

New Stock:
30
```

After confirmation:

```text
stock_quantity = 30
```

and an inventory movement must be recorded.

---

# 21. Sell Product

The MVP does NOT need a complicated shopping cart.

The simplest workflow is:

```text
Inventory
   ↓
Select Product
   ↓
Sell
   ↓
Enter Quantity
   ↓
Confirm
```

Example:

```text
USB-C Cable

Current Stock: 30

Quantity Sold:
2

Confirm Sale
```

After confirmation:

```text
Stock: 28
```

A sale record and inventory movement must be created.

---

# 22. Selling Rules

The system must prevent:

```text
Quantity Sold > Current Stock
```

Example:

```text
Stock: 3

Attempted Sale: 5

→ Reject transaction
```

Show a clear message to the user.

Never allow inventory to become negative.

---

# 23. Manual Stock Adjustment

Sometimes physical inventory will differ from the recorded inventory.

The owner must be able to adjust stock.

Example:

```text
Current Stock: 28
Actual Stock: 27

Adjustment:
-1

Reason:
Damaged
```

Possible reasons:

* Damaged
* Lost
* Found
* Counting correction
* Other

The adjustment must create an inventory movement.

Do not silently overwrite stock.

---

# 24. Inventory Movement

Every stock change must have a corresponding inventory movement.

Movement types:

```text
STOCK_ADDED
SOLD
ADJUSTMENT
```

Future types can be added later.

Each movement should contain enough information to explain why stock changed.

---

# 25. Inventory Movement Data

Conceptually:

```text
InventoryMovement
-----------------
id
product_id
type
quantity
unit_price
reason
reference_id
created_at
```

Quantity should clearly represent the movement.

For example:

```text
+20 STOCK_ADDED
-2 SOLD
-1 ADJUSTMENT
```

---

# 26. Stock as a Business Invariant

The system must maintain:

```text
stock_quantity >= 0
```

No transaction should be able to create negative stock.

Stock changes must be performed through controlled business logic.

Do not allow arbitrary client-side updates to stock.

---

# 27. Sales

The MVP only needs basic sales records.

A sale should contain:

```text
id
product_id
quantity
selling_price
purchase_price
total_amount
created_at
```

Store the prices at the time of sale.

Do not rely on the current product price when calculating historical sales.

For example:

```text
Product selling price today = $15

Product was sold last week for = $12
```

The historical sale should remain:

```text
selling_price = $12
```

---

# 28. Revenue

For a sale:

```text
total_amount =
selling_price × quantity
```

Today's revenue:

```text
SUM(total_amount)
```

for sales created today.

Revenue is not the same as profit.

---

# 29. Basic Estimated Profit

The MVP may display basic estimated profit.

For each sale:

```text
profit =
(selling_price - purchase_price) × quantity
```

Do not build full accounting functionality.

Clearly label this as:

> Estimated Profit

because the MVP does not include expenses, supplier costs, refunds, or accounting adjustments.

---

# 30. Product Detail Page

Each product should have a detail page or detail view.

Display:

### Product Information

```text
Name
Category
Brand
SKU
Purchase Price
Selling Price
Current Stock
Minimum Stock
Status
```

### Quick Actions

```text
Add Stock
Sell
Adjust Stock
Edit
```

### Recent Stock Activity

Example:

```text
+20 Stock Added
21 Sep

-2 Sold
21 Sep

-1 Adjusted
20 Sep
```

---

# 31. Inventory Screen

The inventory screen should provide search and filtering.

## Search by

* Product name
* Brand
* SKU
* Model

## Filter by

* Category
* Stock status
* Brand

## Stock status filters

```text
All
In Stock
Low Stock
Out of Stock
```

---

# 32. Mobile Inventory UI

On mobile, avoid wide data tables.

Use product cards.

Example:

```text
┌────────────────────────────┐
│ USB-C Fast Charger         │
│ Accessories • Charger      │
│                            │
│ Stock: 8                   │
│ Status: In Stock           │
│                            │
│ [Add Stock] [Sell]         │
└────────────────────────────┘
```

Cards should prioritize:

1. Product name
2. Stock
3. Status
4. Quick actions

---

# 33. Desktop Inventory UI

On laptop/desktop screens, use a table where appropriate.

Example:

```text
Product       Category      Stock   Status        Actions
------------------------------------------------------------
USB Charger   Accessories   8       In Stock      ...
USB Cable     Accessories   2       Low Stock     ...
iPhone 13     Phone         0       Out of Stock  ...
```

The desktop interface can show more information without making the mobile interface unnecessarily complicated.

---

# 34. Mobile-First Requirements

The application must be designed around approximately:

```text
375px – 430px
```

before expanding to desktop layouts.

Requirements:

* No unnecessary horizontal scrolling
* Touch-friendly buttons
* Large tap targets
* Readable text
* Mobile-friendly forms
* Mobile-friendly number inputs
* Clear confirmation dialogs
* Bottom navigation or compact navigation
* Important actions easily accessible
* Avoid excessive modal usage
* Avoid very wide tables

---

# 35. Desktop Requirements

Support normal laptop resolutions including:

```text
1366 × 768
1440 × 900
```

Use additional space for:

* Tables
* Filters
* Dashboard cards
* Product information
* Activity history

Do not simply stretch the mobile interface across the desktop.

---

# 36. Database Schema

Start with a minimal relational schema.

Core tables:

```text
categories
products
inventory_movements
sales
```

Potential later tables:

```text
users
customers
suppliers
expenses
purchases
locations
```

Do not create future tables unless they are actually needed.

---

# 37. Categories Table

Conceptually:

```text
categories
----------
id
name
parent_id
created_at
updated_at
```

`parent_id` may be used for future subcategories.

---

# 38. Products Table

Conceptually:

```text
products
--------
id
category_id
name
brand
sku
purchase_price
selling_price
stock_quantity
minimum_stock
image_url
notes
created_at
updated_at
```

Use appropriate numeric types/precision for prices.

Do not use floating-point numbers for money if the chosen database strategy provides a safer representation.

---

# 39. Phone Details

Do not overload the main products table with every possible phone field.

If phone-specific functionality is implemented:

```text
phone_details
-------------
product_id
imei
ram
storage
color
condition
warranty
pta_status
```

This can be introduced when the phone workflow is implemented.

The initial MVP may keep phone-specific fields minimal if they are not required for the first release.

---

# 40. Inventory Movements Table

Conceptually:

```text
inventory_movements
-------------------
id
product_id
type
quantity
unit_price
reason
reference_id
created_at
```

This table provides an audit trail for inventory changes.

---

# 41. Sales Table

Conceptually:

```text
sales
-----
id
product_id
quantity
selling_price
purchase_price
total_amount
created_at
```

For the initial MVP, one sale can represent one product.

A future POS can introduce:

```text
sales
sale_items
```

when multi-product carts are required.

Do not introduce that complexity unless needed.

---

# 42. Database Relationships

Basic relationship:

```text
Category
   │
   └── Products
          │
          ├── Inventory Movements
          │
          └── Sales
```

---

# 43. Transaction Safety

Stock changes and their corresponding records must be atomic.

For example, when selling two products:

```text
1. Validate stock
2. Create sale
3. Create inventory movement
4. Update product stock
5. Commit transaction
```

If any operation fails:

```text
ROLLBACK
```

Do not allow:

```text
Sale created ✓
Stock update failed ✗
```

The application must never leave inventory and sales records inconsistent.

---

# 44. Server-Side Business Logic

Do not trust the client to perform stock calculations.

For example, the browser should not simply send:

```text
stock = 28
```

and directly update the database.

Instead:

```text
Client
   ↓
Request: Sell 2
   ↓
Server validates
   ↓
Server checks current stock
   ↓
Server calculates new stock
   ↓
Transaction
   ↓
Database
```

All important inventory mutations must be validated server-side.

---

# 45. Validation

Use Zod for request/form validation.

Validate:

* Required product fields
* Prices
* Quantities
* Minimum stock
* SKU format where applicable
* Category
* Sale quantity
* Stock adjustment quantity

Examples:

```text
quantity must be > 0
price must not be negative
stock must not become negative
```

---

# 46. Forms

Use React Hook Form for complex forms.

Forms should:

* Show validation errors clearly
* Work well on mobile
* Preserve user input when validation fails
* Use appropriate input types
* Avoid unnecessary fields

Example:

```text
Product Name
[________________]

Category
[ Accessories ▼ ]

Selling Price
[________________]

Purchase Price
[________________]

Minimum Stock
[________________]

[ Save Product ]
```

---

# 47. UI Design Principles

The target user is not a technical user.

Prioritize:

* Simplicity
* Clarity
* Speed
* Large readable values
* Obvious actions
* Minimal steps
* Consistent terminology

Avoid:

* Technical terminology
* Excessive configuration
* Dense dashboards
* Too many charts
* Complex navigation
* Unnecessary animations

---

# 48. Important User Actions

The most common actions should be immediately accessible.

From a product:

```text
[ Add Stock ]
[ Sell ]
[ Adjust ]
```

From the dashboard:

```text
[ Add Product ]
[ View Inventory ]
```

The user should not have to navigate through several unrelated screens to perform common inventory operations.

---

# 49. Confirmation & Error Handling

Require confirmation for actions that change inventory.

For example:

```text
Sell 3 USB-C Cables?

Stock will change:

8 → 5

[Cancel] [Confirm Sale]
```

For errors, use human-readable messages.

Bad:

```text
SQLITE_CONSTRAINT_FOREIGNKEY
```

Good:

```text
Unable to complete the sale.
Please check the product and try again.
```

---

# 50. Loading & Empty States

Every major screen needs useful states.

Examples:

### Empty inventory

```text
No products yet.

Add your first product to start tracking inventory.

[ Add Product ]
```

### No low-stock products

```text
All products are sufficiently stocked.
```

### No activity

```text
No inventory activity yet.
```

Do not leave blank screens.

---

# 51. Image Handling

Product images are optional for the MVP.

If implemented:

* Compress images before storage
* Avoid unnecessarily large files
* Store image references rather than binary image data in the database

The MVP should still work completely without product images.

Image functionality should not block the core inventory workflow.

---

# 52. Authentication

Authentication is not part of the initial core MVP unless the application is going to be publicly accessible before the inventory system is complete.

Build the core application first.

Later add:

```text
Authentication
      ↓
User
      ↓
Shop
      ↓
Permissions
```

Do not build complex role-based access initially.

---

# 53. MVP Development Milestones

Build incrementally.

## Milestone 1 — Project Setup

Set up:

* Next.js
* TypeScript
* Tailwind
* shadcn/ui
* Drizzle
* Turso/libSQL
* Zod
* React Hook Form
* Testing infrastructure

Deliverable:

```text
Application runs locally
Database connects
Basic UI works
```

---

## Milestone 2 — Categories

Implement:

* Category model
* Create category
* List categories
* Assign category to products

Deliverable:

```text
Categories work.
```

---

## Milestone 3 — Products

Implement:

* Create product
* Edit product
* View product
* Product list
* Product search
* Product filtering

Deliverable:

```text
Products can be managed.
```

---

## Milestone 4 — Add Stock

Implement:

* Add stock
* Quantity validation
* Inventory movement
* Stock update
* Activity history

Deliverable:

```text
Product stock can be increased safely.
```

---

## Milestone 5 — Sell

Implement:

* Sell action
* Quantity validation
* Sale record
* Inventory movement
* Stock decrease
* Transaction safety

Deliverable:

```text
Products can be sold and stock automatically decreases.
```

---

## Milestone 6 — Stock Adjustment

Implement:

* Manual adjustment
* Reason
* Inventory movement
* Stock validation

Deliverable:

```text
Physical inventory discrepancies can be corrected.
```

---

## Milestone 7 — Monitoring

Implement dashboard:

* Total products
* Total stock
* Low stock
* Out of stock
* Today's sales
* Today's items sold
* Today's revenue
* Recent activity

Deliverable:

```text
The owner can understand the current state of the shop immediately.
```

---

## Milestone 8 — Search & Filters

Implement:

* Product search
* Category filter
* Stock status filter
* Brand filter

Deliverable:

```text
Products can be found quickly.
```

---

## Milestone 9 — Responsive UI

Test and refine:

### Mobile

* iPhone-sized screens
* Touch interaction
* Forms
* Navigation
* Product cards
* Dashboard

### Desktop

* Laptop screens
* Tables
* Dashboard layout
* Filters
* Product details

Deliverable:

```text
The same application is comfortable on mobile and desktop.
```

---

## Milestone 10 — Testing

Use Vitest for business logic.

Test:

* Stock calculations
* Sale calculations
* Low-stock calculation
* Out-of-stock calculation
* Validation
* Revenue calculation
* Profit calculation

Use Playwright for end-to-end workflows.

Test:

```text
Create Product
      ↓
Add Stock
      ↓
Verify Stock
      ↓
Sell Product
      ↓
Verify Stock Decreased
      ↓
Verify Sale
      ↓
Verify Activity
      ↓
Verify Dashboard
```

This is the most important end-to-end test.

---

# 54. MVP Definition of Done

The MVP is complete when a shop owner can independently perform:

## Product Management

* Add a product
* Edit a product
* Categorize a product
* Search for a product
* View product details

## Inventory

* Add stock
* Sell stock
* Adjust stock
* View stock history
* Identify low-stock products
* Identify out-of-stock products

## Monitoring

* See total products
* See total stock
* See low stock
* See out-of-stock products
* See today's sales
* See today's revenue
* See recent activity

## Reliability

* Stock cannot become negative
* Sales and stock changes remain consistent
* Inventory changes have history
* Invalid data is rejected
* Important operations are tested

## Responsive UI

* Works on iPhone
* Works on laptop
* No unnecessary horizontal scrolling on mobile
* Buttons are touch-friendly
* Forms are usable on mobile

If these requirements work reliably, the MVP is finished.

---

# 55. Future Roadmap

After the MVP is stable, expand in phases.

## Phase 2 — POS

* Multi-product cart
* Barcode scanning
* Barcode generation
* Receipts
* Discounts
* Payment methods
* Returns
* Refunds

## Phase 3 — Purchases

* Suppliers
* Purchase records
* Purchase invoices
* Supplier balances
* Purchase history

## Phase 4 — Customers

* Customer profiles
* Customer history
* Customer contact information
* Credit/debt tracking

## Phase 5 — Expenses & Finance

* Expenses
* Expense categories
* Profit/loss
* Financial reports
* Cash flow

## Phase 6 — Advanced Inventory

* Multiple locations
* Stock transfers
* Automated stock alerts
* Reorder suggestions
* Batch/serial tracking

## Phase 7 — Authentication & Permissions

* Authentication
* Staff accounts
* Permission-based access
* Audit logs

## Phase 8 — Analytics

* Sales trends
* Best-selling products
* Slow-moving products
* Category performance
* Inventory valuation
* Advanced reporting

---

# 56. Future Architecture Principle

Do not implement future features now, but avoid architectural decisions that make them unnecessarily difficult later.

The MVP should make it possible to eventually add:

```text
Users
   ↓
Shop
   ↓
Products
   ↓
Inventory
   ↓
Sales
   ↓
Customers
   ↓
Suppliers
   ↓
Expenses
   ↓
Reports
```

However, only implement the entities required by the current MVP.

---

# 57. Development Rules for the Coding Agent

Act as a senior full-stack engineer and product designer.

Build this application incrementally.

## Rules

1. Do not implement the entire project at once.
2. Work milestone by milestone.
3. Do not add features outside the MVP unless explicitly requested.
4. Explain architectural decisions briefly before implementing them.
5. Keep the UI mobile-first.
6. Keep desktop usability in mind.
7. Validate all user input.
8. Perform important business logic server-side.
9. Never allow negative stock.
10. Record every inventory change.
11. Keep sales and inventory changes transaction-safe.
12. Do not duplicate business logic unnecessarily.
13. Keep components reusable.
14. Keep database schemas simple.
15. Do not introduce unnecessary libraries.
16. Write tests for important business logic.
17. Use Playwright for critical user workflows.
18. Do not add authentication until it is actually needed.
19. Do not add advanced POS functionality to the MVP.
20. Prefer a simple working feature over an elaborate unfinished feature.
21. add the audit logs for everything that will save withing the db.
---

# 58. Core MVP Mental Model

The entire application should revolve around this:

```text
                 PRODUCTS
                    │
                    ▼
              CURRENT STOCK
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
      STOCK IN              SOLD
          │                   │
          └─────────┬─────────┘
                    ▼
            INVENTORY HISTORY
                    │
                    ▼
               MONITORING
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
       LOW STOCK  OUT STOCK  SALES
```

The MVP is successful when this workflow is reliable, simple, and fast.

---

# 59. Final Product Principle

Do not build a complicated business management system.

Build a tool that answers four questions extremely well:

> **What do I have?**

> **What came in?**

> **What was sold?**

> **What needs my attention?**

Everything else comes after the MVP.


Act as a senior product engineer and UX designer.

Your job is to help me build this application incrementally.

Do not immediately generate the entire application.

For every development step:

Explain what we are building.
Explain why it is needed.
Define the data and UI requirements.
Identify dependencies on previous features.
Implement only the current milestone.
Test the feature before moving forward.
Keep the architecture extensible for future phases.
Avoid unnecessary features.
Prioritize simplicity and reliability.
Ensure every UI decision works on both mobile and desktop.

The MVP must remain focused on:

Products → Stock → Selling → Monitoring.

Everything else is secondary and should be deferred until the MVP is stable.