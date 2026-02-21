# ParlourOS - Step-by-Step User Guide

A complete walkthrough of every feature in ParlourOS, from login to daily operations.

---

## Table of Contents

1. [Login](#1-login)
2. [Onboarding (New Salon Setup)](#2-onboarding-new-salon-setup)
3. [Dashboard](#3-dashboard)
4. [Managing Services](#4-managing-services)
5. [Managing Customers](#5-managing-customers)
6. [Booking Appointments](#6-booking-appointments)
7. [Billing / POS (Create Invoice)](#7-billing--pos)
8. [Packages / Memberships](#8-packages--memberships)
9. [Inventory Management](#9-inventory-management)
10. [Staff Management](#10-staff-management)
11. [Reports & Analytics](#11-reports--analytics)
12. [Marketing](#12-marketing)
13. [Settings](#13-settings)
14. [Role-Based Access](#14-role-based-access)

---

## 1. Login

**URL:** `https://parlour-os.vercel.app/login`

### What you see:
- ParlourOS logo (pink scissors icon) at the top
- "Welcome to ParlourOS" heading
- Email and Password input fields
- Pink "Sign In" button
- "Don't have an account? Get Started" link
- **Quick Demo Login** section with 4 colored buttons:
  - Purple "Owner" button
  - Blue "Manager" button
  - Pink "Stylist" button
  - Green "Reception" button

### Steps:

**Option A - Demo Login (for testing):**
1. Click any colored role button (e.g., "Owner")
2. The email and password fields auto-fill
3. Click the pink **Sign In** button
4. You are redirected to the Dashboard

**Option B - Manual Login:**
1. Type your email in the Email field
2. Type your password in the Password field
3. Click **Sign In**

**Option C - New Account:**
1. Click "Get Started" to go to the onboarding wizard

> **Screenshot location:** Login page with demo buttons visible

---

## 2. Onboarding (New Salon Setup)

**URL:** `https://parlour-os.vercel.app/onboarding`

This is a 3-step wizard for setting up a new salon.

### Step 1 - Create Your Account
- Enter your full name
- Enter your email address
- Enter a password (min 8 characters)
- Click **Next**

### Step 2 - Salon Details
- Enter your salon/parlour name (e.g., "Glamour Studio")
- A URL slug is auto-generated (e.g., "glamour-studio")
- Click **Next**

### Step 3 - First Branch
- Enter branch name (e.g., "Main Branch")
- Enter address
- Enter city
- Enter phone number
- Click **Complete Setup**

After setup, you are automatically logged in and redirected to the Dashboard.

> **Screenshot location:** Onboarding wizard - Step 2 (salon details)

---

## 3. Dashboard

**URL:** `https://parlour-os.vercel.app/app/dashboard`

### What you see:
The dashboard shows 4 stat cards at the top:

| Card | Icon | Description |
|------|------|-------------|
| **Today's Appointments** | Calendar icon | Number of appointments booked for today |
| **Total Customers** | Users icon | Total registered customers |
| **Month Revenue** | Rupee icon | Total revenue for the current month |
| **Today's Revenue** | TrendingUp icon | Revenue collected today |

Below the cards:
- **Recent Invoices** table showing the last 5 invoices with customer name, amount, status, and date
- **Upcoming Appointments** list showing next appointments with customer name, time, and staff assigned

### Sidebar (left side):
The sidebar shows navigation links filtered by your role. The bottom shows your name and role badge.

> **Screenshot location:** Dashboard with stat cards and recent invoices

---

## 4. Managing Services

**URL:** `https://parlour-os.vercel.app/app/services`

### What you see:
- Page heading "Services" with a pink **+ Add Service** button
- A table listing all services with columns:
  - Service Name
  - Category (Hair, Skin, Nails, etc.)
  - Duration (in minutes)
  - Price (in Rs)
  - GST Rate (%)
  - Status (Active/Inactive)
  - Actions (Edit, Delete)

### How to add a new service:

1. Click the **+ Add Service** button (top right)
2. A dialog/form appears with these fields:
   - **Name** - e.g., "Hair Smoothening"
   - **Category** - dropdown: Hair, Skin, Nails, Makeup, Spa, Hair Removal, Other
   - **Duration** - in minutes, e.g., 120
   - **Price** - in rupees, e.g., 5000
   - **GST Rate** - percentage, default 18
3. Click **Save**
4. The new service appears in the table

### How to edit a service:
1. Click the **Edit** button on any service row
2. Modify the fields
3. Click **Save**

### How to delete a service:
1. Click the **Delete** button on any service row
2. Confirm the deletion

> **Screenshot location:** Services list with Add Service dialog open

---

## 5. Managing Customers

**URL:** `https://parlour-os.vercel.app/app/customers`

### What you see:
- Page heading "Customers" with a **+ Add Customer** button
- Search bar to find customers by name or phone
- Customer table with columns:
  - Name
  - Phone
  - Email
  - Gender
  - Date of Birth
  - Total Visits
  - Actions

### How to add a new customer:

1. Click **+ Add Customer**
2. Fill in the form:
   - **Name** (required) - e.g., "Priya Sharma"
   - **Phone** (required) - e.g., "+919876543210"
   - **Email** (optional)
   - **Gender** - Male / Female / Other
   - **Date of Birth** (optional) - for birthday offers
3. Click **Save**

### How to search for a customer:
1. Type a name or phone number in the search bar
2. The table filters in real-time

> **Screenshot location:** Customer list with Add Customer form

---

## 6. Booking Appointments

**URL:** `https://parlour-os.vercel.app/app/appointments`

### What you see:
- Page heading "Appointments" with a **+ New Appointment** button
- Filter options (date, status)
- Appointments table with columns:
  - Customer Name
  - Phone
  - Staff Assigned
  - Start Time
  - End Time
  - Status (color-coded badge)
  - Source (Walk-in / Phone / Online)

### How to book a new appointment:

1. Click **+ New Appointment**
2. Fill in the form:
   - **Customer** - select from existing customers or type a name
   - **Customer Phone** - auto-filled if customer selected
   - **Staff** - select a stylist to assign
   - **Date** - pick the appointment date
   - **Start Time** - e.g., 10:00 AM
   - **End Time** - e.g., 10:45 AM
   - **Source** - Walk-in / Phone / Online
   - **Notes** (optional) - any special instructions
3. Click **Book Appointment**

### Appointment Status Flow:
```
BOOKED --> CONFIRMED --> IN_PROGRESS --> COMPLETED
                   \--> CANCELLED
                   \--> NO_SHOW
```

### How to update appointment status:
1. Find the appointment in the table
2. Click the status dropdown
3. Select the new status (e.g., "Confirmed" or "Completed")

> **Screenshot location:** Appointments list and New Appointment form

---

## 7. Billing / POS

**URL:** `https://parlour-os.vercel.app/app/pos`

### What you see:
- Page heading "Billing / POS" with a **+ New Invoice** button
- Tabs: All Invoices | Create Invoice
- Invoice table with columns:
  - Invoice Number (e.g., GS-0001)
  - Customer
  - Items
  - Subtotal
  - Tax (GST)
  - Total
  - Status (Paid / Unpaid / Partial)
  - Date

### How to create a new invoice:

1. Click **+ New Invoice**
2. **Select Customer** from dropdown (optional for walk-ins)
3. **Add Line Items:**
   - Click **+ Add Item**
   - Select Type: Service or Product
   - Select the service/product from dropdown
   - Quantity auto-fills to 1
   - Unit price auto-fills from service/product price
   - Line total calculates automatically
   - Repeat for additional items
4. **Discount** - enter a discount amount (optional)
5. The invoice auto-calculates:
   - Subtotal (sum of all line items)
   - GST (based on service/tenant GST rate)
   - CGST (half of GST)
   - SGST (half of GST)
   - **Grand Total** (Subtotal - Discount + GST)
6. **Select Payment Method:** Cash / Card / UPI / Split
7. Click **Create Invoice**
8. Invoice is saved and marked as Paid

### Example Invoice Calculation:
```
Women's Haircut          x1    Rs  500
Manicure                 x1    Rs  800
Eyebrow Threading        x1    Rs   50
                         -----------
Subtotal                       Rs 1,350
Discount                      -Rs   100
CGST (9%)                      Rs   113
SGST (9%)                      Rs   113
                         ===========
TOTAL                          Rs 1,476
```

### How to issue a refund:
1. Find the paid invoice in the table
2. Click **Refund** button
3. Enter refund amount and reason
4. Select refund method (Cash / Card / UPI)
5. Click **Process Refund**

> **Screenshot location:** Invoice creation form with line items and GST calculation

---

## 8. Packages / Memberships

**URL:** `https://parlour-os.vercel.app/app/packages`

### What you see:
- Two tabs: **Packages** | **Customer Memberships**
- Package cards showing: name, price, validity, sessions included
- **+ Create Package** button

### How to create a package:

1. Click **+ Create Package**
2. Fill in:
   - **Name** - e.g., "Monthly Hair Care"
   - **Price** - e.g., Rs 2,500
   - **Validity** - in days, e.g., 30
   - **Total Sessions** - e.g., 5
   - **Services Included** - select which services are part of this package
3. Click **Save**

### How to sell a package to a customer:

1. Go to the **Customer Memberships** tab
2. Click **+ Sell Package**
3. Select the **Customer**
4. Select the **Package**
5. Set **Expiry Date** (auto-calculated from validity)
6. Click **Activate**

### Tracking sessions:
- The membership shows "Sessions Remaining: 3/5"
- Each time a service from the package is used, remaining sessions decrease
- When sessions reach 0 or date expires, status changes to "Completed" or "Expired"

> **Screenshot location:** Packages tab with package cards and Sell Package form

---

## 9. Inventory Management

**URL:** `https://parlour-os.vercel.app/app/inventory`

### What you see:
- Four tabs: **Products** | **Vendors** | **Purchases** | **Stock**
- Products table with stock levels and reorder alerts

### Tab 1 - Products

How to add a product:
1. Click **+ Add Product**
2. Fill in:
   - **Name** - e.g., "L'Oreal Shampoo 500ml"
   - **Type** - Retail (for sale) or Consumable (used in services)
   - **Unit** - bottle, tube, pack, etc.
   - **Cost Price** - purchase cost, e.g., Rs 450
   - **Selling Price** - retail price, e.g., Rs 750 (set to 0 for consumables)
   - **Reorder Level** - minimum stock before alert, e.g., 5
   - **Vendor** - select supplier
3. Click **Save**

### Tab 2 - Vendors

How to add a vendor:
1. Click **+ Add Vendor**
2. Enter: Name, Phone, Email, Address
3. Click **Save**

### Tab 3 - Purchases

How to record a purchase:
1. Click **+ New Purchase**
2. Select **Vendor**
3. Add items: Product, Quantity, Unit Cost
4. Click **Save**
5. Stock is automatically updated in the ledger

### Tab 4 - Stock Ledger

Shows a history of all stock movements:
- PURCHASE: Stock added from vendor purchase
- USAGE: Stock used in a service
- SALE: Stock sold to customer (retail)
- ADJUSTMENT: Manual stock correction

Low stock products are highlighted with a warning badge.

> **Screenshot location:** Products tab with stock levels

---

## 10. Staff Management

**URL:** `https://parlour-os.vercel.app/app/staff`

### What you see:
- Three tabs: **Staff List** | **Attendance** | **Payroll**
- Staff cards/table showing name, designation, commission rate

### Tab 1 - Staff List

Each staff member shows:
- Name and designation
- Joining date
- Base salary
- Commission percentage

How to add staff:
1. Click **+ Add Staff**
2. Fill in user details: Name, Email, Phone, Password
3. Set: Designation, Base Salary, Commission %, Joining Date
4. Assign Role (Staff / Manager / Reception)
5. Assign Branch
6. Click **Save**

### Tab 2 - Attendance

Track daily attendance:
1. Select the **Date** (defaults to today)
2. For each staff member, set status:
   - **Present** (green)
   - **Absent** (red)
   - **Half Day** (yellow)
   - **Leave** (blue)
3. Optionally set Check-in and Check-out times
4. Click **Save Attendance**

### Tab 3 - Payroll

View salary breakdown per staff member:
- Base Pay
- Commission (calculated from completed services)
- Incentives
- Deductions
- **Net Pay**

> **Screenshot location:** Attendance tab with status toggles

---

## 11. Reports & Analytics

**URL:** `https://parlour-os.vercel.app/app/reports`

### What you see:
- Five report tabs with data cards and tables

### Tab 1 - Revenue Report

Shows:
- **Total Revenue** for the selected period
- **Total Invoices** count
- **Average Ticket Size** (revenue per invoice)
- **Total Tax Collected**
- **Total Discounts Given**
- Daily breakdown table

Change period: Day / Week / Month / Year buttons

### Tab 2 - Service Mix

Shows which services are most popular:
- Service name
- Category
- Number of times booked
- Revenue generated
- Sorted by revenue (highest first)

### Tab 3 - Staff Performance

Shows per-staff metrics:
- Staff name
- Total appointments completed
- Revenue attributed

### Tab 4 - Customer Retention

Shows customer health:
- **Active Customers** - visited in last 30 days
- **At-Risk Customers** - last visit 30-60 days ago
- **Lapsed Customers** - no visit in 60+ days
- **New This Month** - recently registered
- **Retention Rate** - percentage of active customers

### Tab 5 - GST Summary

For monthly GST filing:
- Total Taxable Value
- CGST (Central GST)
- SGST (State GST)
- Total Tax
- Total Invoice Value
- Invoice Count

### Export to CSV:
1. Click the **Export CSV** button on any report tab
2. A CSV file downloads with the report data

> **Screenshot location:** Revenue report with daily breakdown

---

## 12. Marketing

**URL:** `https://parlour-os.vercel.app/app/marketing`

### What you see:
- Three tabs: **Templates** | **Campaigns** | **Review Links**

### Tab 1 - Message Templates

Create reusable message templates:
1. Click **+ New Template**
2. Fill in:
   - **Name** - e.g., "Appointment Reminder"
   - **Channel** - WhatsApp / SMS / Email
   - **Content** - the message body with placeholders:
     - `{{name}}` - customer name
     - `{{service}}` - service name
     - `{{time}}` - appointment time
     - `{{reviewLink}}` - review URL
3. Click **Save**

### Tab 2 - Campaigns

Launch marketing campaigns:
1. Click **+ New Campaign**
2. Fill in:
   - **Campaign Name** - e.g., "Diwali Special Offer"
   - **Channel** - WhatsApp / SMS / Email
   - **Segment** - target audience (all / new / inactive)
   - **Scheduled At** (optional) - send later
3. Click **Create**
4. Campaign status: Draft > Scheduled > Running > Completed

### Tab 3 - Review Links

Manage online review links:
1. Click **+ Add Review Link**
2. Enter:
   - **Platform** - Google / JustDial / etc.
   - **URL** - the review page URL
   - **Branch** - which branch this link is for
3. Click **Save**

> **Screenshot location:** Templates tab with message template cards

---

## 13. Settings

**URL:** `https://parlour-os.vercel.app/app/settings`

### What you see:
- Four tabs: **Business** | **Branches** | **Roles** | **Subscription**

### Tab 1 - Business Settings

Edit your salon details:
- **Salon Name**
- **GSTIN** - GST registration number
- **Tax Rate** - default GST percentage (e.g., 18)
- **Invoice Prefix** - e.g., "GS" (invoices will be GS-0001, GS-0002, etc.)
- **Invoice Footer** - thank you message printed on invoices

Click **Save Changes** to update.

### Tab 2 - Branches

Manage multiple locations:
- View all branches with name, address, city, phone, hours
- Click **+ Add Branch** to add a new location
- Click **Edit** to update branch details
- Click **Delete** to remove a branch (only if no data is linked)

### Tab 3 - Roles

View the 5 built-in roles and their permissions:
- **Owner** - all permissions
- **Manager** - everything except subscription
- **Reception** - appointments, billing, customers, packages
- **Staff** - view appointments, services, customers
- **Accountant** - billing, reports, inventory, payroll

Each role shows permission badges (e.g., "appointments:view", "billing:write").

### Tab 4 - Subscription

View and manage your subscription:
- Current plan name and price
- Status (Active / Past Due / Cancelled)
- Billing period (start and end dates)
- Feature limits (branches, staff count)
- **Upgrade Plan** button to switch to a higher tier

> **Screenshot location:** Business settings tab with GSTIN and tax rate fields

---

## 14. Role-Based Access

Different roles see different sidebar menus and have different permissions:

### Owner Login (owner@demo.com)
**Sidebar shows:** Dashboard, Appointments, Services, Billing/POS, Customers, Packages, Inventory, Staff, Reports, Marketing, Settings
**Can do:** Everything - create, edit, delete all records across all modules

### Manager Login (manager@demo.com)
**Sidebar shows:** Dashboard, Appointments, Services, Billing/POS, Customers, Packages, Inventory, Staff, Reports, Marketing, Settings
**Can do:** Everything except manage subscription plans

### Receptionist Login (reception@demo.com)
**Sidebar shows:** Dashboard, Appointments, Services, Billing/POS, Customers, Packages
**Can do:** Book appointments, create invoices, register customers, sell packages
**Cannot access:** Inventory, Staff, Reports, Marketing, Settings

### Stylist Login (anjali@demo.com)
**Sidebar shows:** Dashboard, Appointments, Services, Customers
**Can do:** View their appointments, view services, view customer details
**Cannot access:** Billing, Packages, Inventory, Staff, Reports, Marketing, Settings

### Bottom of Sidebar
Each user sees their name and a colored role badge:
- **Owner** - purple badge
- **Manager** - blue badge
- **Receptionist** - green badge
- **Stylist** - pink badge
- **Accountant** - amber badge

---

## Daily Workflow Example

Here is a typical day using ParlourOS:

### Morning (Opening)
1. **Login** as Receptionist
2. Check **Dashboard** for today's appointments
3. Open **Appointments** to see the day's schedule
4. Mark staff **Attendance** (if you have Staff access)

### During the Day
5. **Walk-in customer arrives** - Create a new appointment (source: Walk-in)
6. **Customer checks in** - Update appointment status to "In Progress"
7. **Service completed** - Update status to "Completed"
8. **Create Invoice** - Go to Billing/POS, add services, collect payment
9. **Sell a package** - If customer wants a membership, go to Packages

### Customer Calls
10. **Phone booking** - Create appointment with source "Phone"
11. **Customer enquiry** - Search customer in Customers module

### Evening (Closing)
12. Check **Dashboard** for today's revenue
13. **Owner/Manager** reviews Reports for daily summary
14. Check **Inventory** for low stock alerts
15. Plan tomorrow's appointments

---

## Tips and Tricks

1. **Quick search:** Use the search bar in Customers to find by name or phone number
2. **Keyboard shortcut:** Press `Ctrl + K` on most pages for quick navigation
3. **Mobile friendly:** The sidebar collapses to a hamburger menu on mobile devices
4. **Multiple payments:** Use "Split" payment method to accept part Cash + part UPI
5. **GST rates:** You can set different GST rates per service (useful if some services are GST-exempt)
6. **Invoice prefix:** Change it in Settings to match your billing book (e.g., "INV", "GS", "MS")
7. **Review links:** Share Google review links with customers after their appointment
8. **CSV exports:** Download any report as CSV for use in Excel or Tally

---

## Getting Help

- **GitHub Issues:** [github.com/chirag202001/ParlourOS/issues](https://github.com/chirag202001/ParlourOS/issues)
- **README:** [github.com/chirag202001/ParlourOS](https://github.com/chirag202001/ParlourOS)
- **Live Demo:** [parlour-os.vercel.app](https://parlour-os.vercel.app)

---

*This guide covers ParlourOS v1.0. Last updated: February 2026.*
