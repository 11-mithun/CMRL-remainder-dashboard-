# CMRL Dashboard - Complete Documentation

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Pages & Modules](#pages--modules)
- [UI Components & Styling](#ui-components--styling)
- [Algorithm Flow](#algorithm-flow)
- [Theme System](#theme-system)
- [Button Styles](#button-styles)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [File Structure](#file-structure)
- [Installation](#installation)
- [Usage](#usage)

---

## 🎯 Project Overview

CMRL Dashboard is a comprehensive web-based management system for tracking contractors, bills, and EPBG (Earnest Performance Bank Guarantee) documents. It features a modern dark/light theme interface with real-time data synchronization, Excel import/export capabilities, and role-based access control.

**Key Technologies:**
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Python Flask, MySQL
- **Styling**: Custom CSS with CSS variables for theming
- **Authentication**: Session-based with role management
- **Data Handling**: Excel import/export, Base64 file encoding

---

## ✨ Features

### 🏠 Dashboard Features
- **Multi-Module Navigation**: Contractor List, Bill Tracker, EPBG Management, Analytics Dashboard
- **Real-time Data Sync**: Automatic saving to backend with localStorage fallback
- **Excel Integration**: Import/Export functionality for all modules
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Theme System**: Dark/Light mode toggle with persistent preferences
- **Role-Based Access**: Admin/Editor/Viewer permissions
- **Mobile Navigation**: Hamburger menu with overlay for mobile devices
- **Sidebar Navigation**: Collapsible sidebar with module shortcuts
- **Notification System**: Real-time alerts and expiry warnings
- **AI-Powered Analytics**: Intelligent insights and predictions
- **KPI Tracking**: Key performance indicators and metrics
- **Interactive Charts**: Data visualization with Chart.js
- **Bulk Operations**: Multi-row selection and actions
- **Advanced Filtering**: Column-based filtering and search
- **Audit Trail**: Complete operation logging and tracking

### 📊 Contractor List Module
- **Dynamic Row Management**: Add/remove rows with automatic serial numbering
- **Date Calculations**: Automatic duration calculation between start/end dates
- **File Attachments**: Base64 encoded file upload with preview
- **GST Dropdown**: Pre-configured GST percentage options
- **Data Validation**: Input validation with error handling
- **Export to Excel**: Formatted data export with proper column mapping

### 💰 Bill Tracker Module
- **Bill Lifecycle Tracking**: From approval to payment
- **Frequency Management**: Monthly/Quarterly/Annual bill tracking
- **Amount Calculations**: Approved vs Paid amount tracking
- **Due Date Management**: Automatic due date calculations
- **Payment Status**: Visual indicators for payment status
- **File Attachments**: Bill document management
- **Duration Calculation**: Real-time calculation from current date to end date
- **Color-Coded Duration**: Visual urgency indicators (Red: ≤60 days, Yellow: 60-90 days, Green: >90 days)
- **Multi-Level Filtering**: Column-based filtering by months, payment status, and other criteria
- **Real-time Updates**: Automatic duration updates every 5 minutes
- **Bulk Operations**: Multi-row selection with bulk edit/delete functionality
- **Notification System**: Automatic expiry alerts with detailed modal display
- **Advanced Filtering**: Column hiding/showing with proper alignment maintenance
- **Checkbox Selection**: Individual row selection with bulk action controls
- **Audit Trail**: Complete logging of all bulk operations

### 🏦 EPBG Module
- **Bank Guarantee Tracking**: PO numbers and guarantee details
- **Validity Management**: Expiry date tracking with alerts
- **Amount Management**: Guarantee amount tracking
- **GEM Integration**: Bid number and reference tracking
- **Document Management**: Multiple file attachments per record
- **Dual Attachment System**: BG number and document attachments

### 📈 Analytics Dashboard Module
- **Data Visualization**: Interactive charts with Chart.js
- **KPI Tracking**: Real-time key performance indicators
- **AI Analytics**: Machine learning-powered insights
- **Trend Analysis**: Historical data patterns and predictions
- **Performance Metrics**: Module-specific performance tracking
- **Export Reports**: PDF and Excel report generation
- **Real-time Updates**: Live data synchronization
- **Mobile Responsive**: Touch-optimized interface
- **Custom Dashboards**: Configurable widget layouts
- **Data Filtering**: Advanced filter controls
- **Comparative Analysis**: Multi-module data comparison

---

## 📱 Pages & Modules

### 1. Login Page (`/`)
**Features:**
- Email/Password authentication
- OTP-based password reset
- Session management
- Remember me functionality
- Theme-aware login interface
- Video background with animated effects
- Animated falling leaves effect
- CMRL branding with logo

**UI Components:**
- Animated video background (Train_Video_Generation_With_Effects.mp4)
- Glass-morphism form design
- Animated leaf particles
- CMRL logo display
- Responsive layout
- Error/success notifications
- Username and password input fields
- Remember me checkbox
- Forgot password link
- Theme toggle integration

### 2. Contractor List Page (`/contractor-list`)
**Features:**
- Dynamic table with inline editing
- Real-time data synchronization
- Excel import/export
- File attachment management
- Date picker with duration calculation

**UI Components:**
- Header with action buttons (Save, Undo, Redo, Refresh, Print, Export, Import)
- Dynamic data table with 11 columns
- Add row functionality
- Delete row with confirmation
- Attachment preview modal

### 3. Bill Tracker Page (`/bill-tracker`)
**Features:**
- Bill lifecycle management
- Payment status tracking
- Due date calculations
- Frequency-based billing
- Duration calculation from current date to end date
- Color-coded duration display (Red/Yellow/Green)
- Multi-level column-based filtering
- Real-time duration updates
- Bulk operations with multi-row selection
- Notification system for expiry alerts
- Advanced column filtering with hide/show functionality
- Checkbox-based row selection
- Audit trail for all operations

**UI Components:**
- Bill status indicators
- Amount comparison views
- Date range selectors
- Payment status badges
- Duration display with color coding
- Column-based filter dropdowns
- Real-time update indicators
- Bulk operations toolbar (Edit Selected/Delete Selected)
- Selection counter showing "X selected"
- Notification bell with badge count
- Detailed notification modal with contract information
- Checkbox controls in S.NO column for row selection

### 4. EPBG Page (`/epbg`)
**Features:**
- Bank guarantee management
- Validity tracking
- Document management
- GEM integration
- Dual attachment system (BG number + documents)
- Multi-file upload capability
- Validity countdown display

**UI Components:**
- Guarantee status cards
- Validity countdown timers
- Document preview modals
- Multi-file attachment system
- BG number upload interface
- Document management controls

### 5. Analytics Dashboard (`/analytics`)
**Features:**
- Data visualization with Chart.js
- KPI tracking and metrics
- AI-powered analytics insights
- Real-time data updates
- Interactive charts and graphs
- Performance analytics
- Trend analysis
- Export capabilities

**UI Components:**
- Interactive charts (line, bar, pie, doughnut)
- KPI cards with metrics
- Data filtering controls
- Export buttons for reports
- AI insights panel
- Responsive grid layout
- Mobile menu toggle
- Sidebar navigation

**Mobile Features:**
- Mobile menu toggle button
- Mobile overlay for navigation
- Responsive sidebar
- Touch-friendly interface
- Adaptive chart sizing

---

## 🎨 UI Components & Styling

### Color Scheme
```css
/* Primary Colors */
--primary: #6e8efb;
--secondary: #a777e3;
--accent: #4dadf7;

/* Status Colors */
--success: #2ecc71;
--warning: #f39c12;
--danger: #ff6b6b;
--info: #3498db;

/* Background Colors */
--bg-primary: #1a1a2e;
--bg-secondary: #16213e;
--bg-tertiary: #0f3460;
```

### Typography
```css
/* Font Hierarchy */
--font-primary: 'Inter', sans-serif;
--font-size-xs: 10px;
--font-size-sm: 12px;
--font-size-base: 14px;
--font-size-lg: 16px;
--font-size-xl: 18px;
--font-size-2xl: 24px;
```

### Layout System
- **CSS Grid**: Main layout structure
- **Flexbox**: Component layouts
- **CSS Variables**: Dynamic theming
- **Responsive Units**: rem, em, vh, vw

---

## 🔄 Algorithm Flow

### Data Flow Architecture
```
Frontend (Browser) 
    ↓ (HTTP Request)
Backend (Flask API)
    ↓ (Database Query)
MySQL Database
    ↓ (Response)
Frontend (Update UI)
```

### Authentication Flow
```
1. User Login → Validate Credentials
2. Create Session → Store User Data
3. Role Check → Grant Permissions
4. Access Control → Show/Hide Features
5. Session Timeout → Auto Logout
```

### Data Synchronization
```
1. User Input → Form Validation
2. LocalStorage → Immediate Save
3. API Call → Backend Sync
4. Database → Persistent Storage
5. Response → UI Update
```

### Excel Import/Export Flow
```
Import:
1. File Selection → Read Excel
2. Parse Data → Map Columns
3. Validate → Check Required Fields
4. Convert → JSON Format
5. Update → Table Rows

Export:
1. Collect Data → Table Rows
2. Format → Excel Structure
3. Generate → Workbook
4. Download → File Response
```

---

## 🌓 Theme System

### Dark Theme (Default)
```css
:root {
    --bg-primary: #1a1a2e;
    --bg-secondary: #16213e;
    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.7);
    --border-color: rgba(255, 255, 255, 0.1);
    --card-bg: rgba(255, 255, 255, 0.05);
}
```

### Light Theme
```css
[data-theme="light"] {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --text-primary: #1f2937;
    --text-secondary: #6b7280;
    --border-color: rgba(0, 0, 0, 0.1);
    --card-bg: rgba(0, 0, 0, 0.02);
}
```

### Theme Toggle Implementation
```javascript
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update backend preference
    fetch('/api/user/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme })
    });
}
```

---

## 🔘 Button Styles

### Header Action Buttons
```css
.header-action-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.header-action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
```

### Specific Button Variants
```css
/* Save Button */
.save-btn:hover {
    background: rgba(46, 204, 113, 0.3);
    border-color: rgba(46, 204, 113, 0.5);
}

/* Export Button */
.export-btn:hover {
    background: rgba(202, 255, 191, 0.3);
    border-color: rgba(202, 255, 191, 0.5);
}

/* Import Button */
.import-btn {
    color: #4dadf7;
}

.import-btn:hover {
    transform: scale(1.2);
    text-shadow: 0 0 10px rgba(77, 173, 247, 0.5);
}

/* Delete Button */
.delete-btn {
    color: #ff6b6b;
}

.delete-btn:hover {
    transform: scale(1.2);
    text-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
}
```

### Form Buttons
```css
.add-row-btn {
    background: linear-gradient(135deg, #1a81ef 0%, #40a2de 100%);
    border: none;
    color: #fff;
    padding: 10px 20px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s;
    box-shadow: 0 4px 15px rgba(26, 129, 239, 0.3);
}

.add-row-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(26, 129, 239, 0.5);
}
```

### Bulk Action Buttons
```css
.bulk-btn {
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.bulk-btn.edit {
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4);
}

.bulk-btn.delete {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.bulk-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}
```

### Mobile Navigation Buttons
```css
.mobile-menu-toggle {
    display: none;
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 1000;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.sidebar-toggle-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: var(--text-primary);
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.sidebar-toggle-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}
```

### Theme Toggle Button
```css
.theme-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 50px;
    padding: 8px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    z-index: 1000;
}

.theme-toggle:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
```

### Notification Badge
```css
.notification-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: var(--danger);
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
    theme_preference ENUM('light', 'dark') DEFAULT 'dark',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Contractor List Table
```sql
CREATE TABLE contractor_list (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sno VARCHAR(50),
    efile VARCHAR(100),
    contractor VARCHAR(255),
    description TEXT,
    value DECIMAL(15,2),
    gst VARCHAR(50),
    start_date DATE,
    end_date DATE,
    duration VARCHAR(100),
    file_name VARCHAR(255),
    file_base64 LONGTEXT,
    file_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Bill Tracker Table
```sql
CREATE TABLE bill_tracker (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sno VARCHAR(50),
    efile VARCHAR(100),
    contractor VARCHAR(255),
    approved_date DATE,
    approved_amount DECIMAL(15,2),
    bill_frequency VARCHAR(50),
    bill_date DATE,
    bill_due_date DATE,
    bill_paid_date DATE,
    paid_amount DECIMAL(15,2),
    file_name VARCHAR(255),
    file_base64 LONGTEXT,
    file_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### EPBG Table
```sql
CREATE TABLE epbg (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sno VARCHAR(50),
    contractor VARCHAR(255),
    po_no VARCHAR(100),
    bg_no VARCHAR(100),
    bg_date DATE,
    bg_amount DECIMAL(15,2),
    bg_validity VARCHAR(100),
    gem_bid_no VARCHAR(100),
    ref_efile_no VARCHAR(100),
    file_name VARCHAR(255),
    file_base64 LONGTEXT,
    file_type VARCHAR(100),
    bg_no_attachment_name VARCHAR(255),
    bg_no_attachment_base64 LONGTEXT,
    bg_no_attachment_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🔌 API Endpoints

### Authentication Endpoints
```
POST /api/login              - User login
POST /api/logout             - User logout
POST /api/forgot-password    - Request password reset
POST /api/reset-password     - Reset password with OTP
GET  /api/check-auth        - Check authentication status
PUT  /api/user/theme       - Update user theme preference
```

### Contractor List Endpoints
```
GET  /api/contractor-list    - Get all contractor records
POST /api/contractor-list   - Save contractor records
PUT  /api/contractor-list   - Update contractor record
DELETE /api/contractor-list - Delete contractor record
```

### Bill Tracker Endpoints
```
GET  /api/bill-tracker      - Get all bill records
POST /api/bill-tracker     - Save bill records
PUT  /api/bill-tracker     - Update bill record
DELETE /api/bill-tracker   - Delete bill record
GET  /api/bill-tracker/warnings - Get expiry warnings
```

### EPBG Endpoints
```
GET  /api/epbg             - Get all EPBG records
POST /api/epbg            - Save EPBG records
PUT  /api/epbg            - Update EPBG record
DELETE /api/epbg          - Delete EPBG record
POST /api/epbg/upload-bg  - Upload BG number attachment
```

### Analytics Endpoints
```
GET  /api/analytics/kpi    - Get KPI metrics
GET  /api/analytics/trends - Get trend analysis
GET  /api/analytics/reports - Generate reports
POST /api/analytics/ai-insights - Get AI-powered insights
```

### User Management Endpoints
```
GET  /api/users            - Get all users (admin only)
POST /api/users           - Create new user (admin only)
PUT  /api/users           - Update user (admin/self)
DELETE /api/users         - Delete user (admin only)
```

### API Response Format
```json
{
    "success": true,
    "data": {...},
    "message": "Operation successful",
    "timestamp": "2026-02-25T14:39:00Z"
}
```

### Error Response Format
```json
{
    "success": false,
    "error": "Error message",
    "code": "ERROR_CODE",
    "timestamp": "2026-02-25T14:39:00Z"
}
```

---

## 📁 File Structure

```
CMRL-remainder-dashboard-/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── init_db.py          # Database initialization script
│   ├── check_users.py      # User management utility
│   ├── requirements.txt     # Python dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── index.html          # Main HTML file (Contractor List)
│   ├── login.html          # Login page
│   ├── bill-tracker.html   # Bill Tracker page
│   ├── epbg.html           # EPBG management page
│   ├── analytics.html      # Analytics dashboard
│   ├── styles.css          # Complete styling
│   ├── login.css           # Login page specific styles
│   ├── script.js          # Main JavaScript logic (Contractor List)
│   ├── login.js            # Login page JavaScript
│   ├── bill-tracker.js    # Bill Tracker JavaScript
│   ├── epbg.js            # EPBG JavaScript
│   ├── analytics.js       # Analytics JavaScript
│   ├── kpi-dashboard.js   # KPI dashboard functionality
│   ├── ai-analytics.js   # AI-powered analytics
│   ├── auth.js            # Authentication module
│   └── api.js            # API communication layer
├── database/
│   ├── database.sql        # Complete database schema
│   └── add_bg_no_attachment_columns.sql  # EPBG table migration
├── assets/
│   ├── CMRL.png           # CMRL logo
│   ├── favicon.ico        # Website favicon
│   └── Train_Video_Generation_With_Effects.mp4  # Login background video
└── README.md             # This documentation
```

---

## 🚀 Installation

### Prerequisites
- Python 3.8+
- MySQL 5.7+
- Node.js 14+ (for development tools)

### Backend Setup
```bash
# Clone the repository
git clone <repository-url>
cd CMRL-remainder-dashboard-

# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Initialize database
python init_db.py

# Check users (optional)
python check_users.py

# Run the application
python app.py
```

### Backend Utilities
- **init_db.py**: Database initialization script
  - Creates all required tables
  - Sets up admin user account
  - Returns success/failure status
  
- **check_users.py**: User management utility
  - Lists all current users in database
  - Displays user roles and credentials
  - Useful for debugging authentication issues

### Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Start a simple HTTP server (for development)
python -m http.server 8000
# Or use Node.js
npx serve .

# Open browser
http://localhost:8000
```

### Database Setup
```sql
-- Create database
CREATE DATABASE reminder_dashboard;

-- Use database
USE reminder_dashboard;

-- Import main schema
source database/database.sql;

-- Run EPBG migration (if needed)
source database/add_bg_no_attachment_columns.sql;

-- Create admin user (handled by init_db.py)
INSERT INTO users (name, email, password, role) 
VALUES ('Admin', 'admin@cmrl.com', 'admin123', 'admin');
```

---

## 📖 Usage

### Login
1. Open the application in browser
2. Enter credentials (default: admin@cmrl.com / admin123)
3. Select theme preference (optional)

### Contractor List Management
1. **Add Records**: Click "Add Row" button
2. **Edit Data**: Click on any cell to edit
3. **Upload Files**: Click attachment button in last column
4. **Calculate Duration**: Enter start/end dates for auto-calculation
5. **Save Data**: Click save button or auto-save triggers
6. **Export**: Click export button for Excel download
7. **Import**: Click import button to upload Excel file

### Bill Tracking
1. **Add Bills**: Click "Add Row" for new bill entries
2. **Set Dates**: Enter approval, bill, due, and paid dates
3. **Track Payments**: Update paid amounts and dates
4. **Monitor Status**: Visual indicators for payment status
5. **Duration Tracking**: Automatic calculation from current date to end date
6. **Color-Coded Urgency**: 
   - 🔴 Red text: ≤60 days (urgent)
   - 🟡 Yellow text: 60-90 days (warning)
   - 🟢 Green text: >90 days (safe)
7. **Filter Data**: Use column-based filters for months, payment status, and more
8. **Real-time Updates**: Duration automatically updates every 5 minutes
9. **Bulk Operations**: 
   - Select rows using checkboxes in S.NO column
   - Use "Edit Selected" to modify multiple rows
   - Use "Delete Selected" to remove multiple rows
10. **Notification System**: 
    - Automatic expiry alerts for bills ≤60 days
    - Click notification bell to view detailed warnings
    - Badge shows count of urgent bills
11. **Advanced Filtering**: 
    - Hide/show specific columns using filter dropdown
    - Maintains proper table alignment
    - Always keeps S.NO and ACTION columns visible

### EPBG Management
1. **Add Guarantees**: Create new bank guarantee entries
2. **Track Validity**: Monitor expiry dates
3. **Upload Documents**: Attach relevant files
4. **GEM Integration**: Link with GEM bid numbers

### Analytics Dashboard
1. **View KPIs**: Monitor key performance indicators
2. **Interactive Charts**: Click and interact with data visualizations
3. **AI Insights**: Review AI-powered analytics and predictions
4. **Export Reports**: Generate PDF/Excel reports
5. **Filter Data**: Apply advanced filters for specific analysis
6. **Compare Modules**: View comparative analysis across modules
7. **Mobile Access**: Use touch-optimized interface on mobile devices

### Theme Customization
1. **Toggle Theme**: Click theme toggle button
2. **Persistent Preference**: Theme choice is saved
3. **System Sync**: Preference synced with backend

### Mobile Navigation
1. **Hamburger Menu**: Click mobile menu toggle to open navigation
2. **Overlay Navigation**: Use mobile overlay for module access
3. **Touch Gestures**: Swipe and tap for navigation
4. **Responsive Layout**: Automatic adaptation to screen size

---

## 🎯 Bill Tracker Features

### Duration Calculation System
The Bill Tracker includes an intelligent duration calculation system that provides real-time tracking of bill deadlines:

#### **Calculation Logic**
- **Current Date to End Date**: Duration is calculated from today's date to the bill's end date
- **Real-time Updates**: Automatically updates every 5 minutes
- **Manual Updates**: Instant updates when dates are changed
- **Import Integration**: Applies duration calculation during Excel import

#### **Color-Coded Urgency System**
| Days Remaining | Text Color | Status | Action Required |
|-----------------|------------|--------|----------------|
| **≤60 days** | 🔴 #ff4757 | **Urgent** | Immediate attention needed |
| **60-90 days** | 🟡 #ffa502 | **Warning** | Plan ahead for payment |
| **>90 days** | 🟢 #2ed573 | **Safe** | Plenty of time remaining |
| **Expired** | 🔴 #ff4757 | **Expired** | Follow-up required |
| **Expires Today** | 🔴 #ff4757 | **Critical** | Action needed today |

#### **Visual Features**
- **Bold Text**: Enhanced visibility with font-weight: bold
- **Padding**: 4px 8px for better readability
- **Border Radius**: 4px for modern appearance
- **No Background**: Clean, text-only design for better integration

### Notification System
Advanced notification system for bill expiry management:

#### **Automatic Alerts**
- **Expiry Detection**: Automatically identifies bills ≤60 days from expiry
- **Badge Counter**: Shows count of urgent bills on notification bell
- **Auto-Popup**: Alerts appear automatically after Excel import
- **Real-time Updates**: Badge updates when durations change

#### **Notification Modal**
- **Detailed Information**: Shows S.NO, E-FILE, CONTRACTOR, START DATE, END DATE, DURATION
- **Color-Coded Warnings**: Red highlighting for urgent items
- **Click to View**: Click notification badge to open detailed modal
- **Empty State**: Friendly message when no warnings exist

### Bulk Operations System
Multi-row selection and bulk action capabilities:

#### **Selection Mechanism**
- **Checkbox Controls**: Individual checkboxes in S.NO column
- **Selection Counter**: Shows "X selected" in real-time
- **Visual Feedback**: Selected rows are clearly indicated
- **Persistent Selection**: Maintains selection during operations

#### **Bulk Actions**
- **Bulk Edit**: Enable editing mode for multiple selected rows
- **Bulk Delete**: Remove multiple rows with confirmation
- **Audit Trail**: Complete logging of all bulk operations
- **Auto S.NO Reassignment**: Renumbering after deletion

#### **Audit System**
- **Operation Logging**: Records all bulk edit/delete actions
- **Timestamp Tracking**: Exact time of each operation
- **User Attribution**: Tracks which user performed actions
- **Session Storage**: Temporary audit log for current session

### Advanced Filtering System
Column-based filtering with hide/show functionality:

#### **Filter Logic**
- **Column Hiding**: Select columns to hide (reverse logic)
- **Proper Alignment**: Maintains table structure during filtering
- **Always Visible**: S.NO and ACTION columns always remain visible
- **Apply/Clear**: Easy filter management with buttons

#### **Filter Features**
- **Multi-Column Selection**: Can hide multiple columns simultaneously
- **Instant Application**: Filters apply immediately on "Apply Filters"
- **Clear All**: Reset to show all columns
- **Status Indicators**: Visual feedback when filters are active

### Multi-Level Filtering System
Advanced filtering capabilities using existing column values:

#### **Filter Categories**
- **Months**: Filter bills by specific months based on frequency and dates
- **Payment Status**: Filter by Paid/Unpaid/All status
- **Frequency**: Filter by Monthly/Quarterly/Annual billing cycles
- **Contractor**: Filter by specific contractor names
- **Other Columns**: All existing columns support filtering

#### **Filter Features**
- **Column-Based**: Uses existing column data, no separate filter controls
- **Multi-Select**: Can apply multiple filters simultaneously
- **Real-time**: Filters apply instantly as you select options
- **Persistent**: Filter selections are maintained during session

---

## 🔧 JavaScript Modules

### Core JavaScript Files

#### **login.js** - Authentication Module
```javascript
// Features:
- Form validation and submission
- Loading states and error handling
- Session management
- Theme integration
- Redirect after successful login
- Password visibility toggle
- Remember me functionality
```

#### **auth.js** - Authentication Service
```javascript
// Features:
- Session token management
- Auto-logout on session expiry
- Role-based access control
- API authentication headers
- User profile management
- Theme preference sync
```

#### **api.js** - API Communication Layer
```javascript
// Features:
- HTTP request/response handling
- Error handling and retry logic
- Data serialization/deserialization
- Request queuing and caching
- Backend synchronization
- Offline mode support
```

#### **kpi-dashboard.js** - KPI Metrics
```javascript
// Features:
- Real-time KPI calculations
- Sparkline charts generation
- Data caching and optimization
- Auto-refresh functionality
- Performance metrics tracking
- Business intelligence logic
```

#### **ai-analytics.js** - AI-Powered Analytics
```javascript
// Features:
- Machine learning predictions
- Trend analysis algorithms
- Anomaly detection
- Data pattern recognition
- Predictive analytics
- Insight generation
```

### Module-Specific JavaScript Files

#### **script.js** - Contractor List Logic
- Dynamic row management
- Excel import/export
- File attachment handling
- Bulk operations
- Duration calculations
- Data validation

#### **bill-tracker.js** - Bill Tracker Logic
- Bill lifecycle management
- Notification system
- Real-time duration updates
- Bulk operations
- Advanced filtering
- Payment tracking

#### **epbg.js** - EPBG Management Logic
- Bank guarantee tracking
- Validity monitoring
- Dual attachment system
- GEM integration
- Document management
- Expiry alerts

#### **analytics.js** - Analytics Dashboard Logic
- Chart.js integration
- Interactive visualizations
- Data filtering
- Report generation
- Mobile responsiveness
- Real-time updates

### JavaScript Architecture
```javascript
// Module Pattern Structure
const ModuleName = {
    // Private variables
    privateVar: value,
    
    // Public methods
    publicMethod() {
        // Implementation
    },
    
    // Initialization
    init() {
        this.setupEventListeners();
        this.loadData();
    }
};

// Event-driven architecture
document.addEventListener('DOMContentLoaded', () => {
    ModuleName.init();
});
```

---

## 🔧 Configuration

### Environment Variables (.env)
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=reminder_dashboard

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Session Configuration
SECRET_KEY=your_secret_key_here
```

### Customization Options
- **Colors**: Modify CSS variables in styles.css
- **Fonts**: Update font-family declarations
- **Layout**: Adjust grid and flexbox properties
- **Animations**: Modify transition and transform properties

---

## 🐛 Troubleshooting

### Common Issues
1. **Date Picker Not Visible**: Check CSS for browser-specific selectors
2. **File Upload Not Working**: Verify file size limits and permissions
3. **Theme Not Persisting**: Check localStorage and backend sync
4. **API Errors**: Verify database connection and endpoint URLs
5. **Mobile Menu Not Working**: Check JavaScript event listeners and CSS media queries
6. **Charts Not Loading**: Verify Chart.js library inclusion and data format
7. **Notifications Not Showing**: Check browser permissions and JavaScript console
8. **Bulk Operations Failing**: Verify checkbox event listeners and selectedRows Set
9. **Excel Import Errors**: Check file format and column mapping
10. **Video Background Not Playing**: Verify video file path and browser compatibility

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');

// Check API responses
console.log('API Response:', response);

// Monitor data changes
const observer = new MutationObserver(callback);
observer.observe(document.body, { childList: true, subtree: true });

// Debug bulk operations
console.log('Selected rows:', selectedRows);
console.log('Bulk operations status:', updateBulkActionsUI());

// Debug notifications
console.log('Warning count:', getWarningCount());
console.log('Notification badge:', document.getElementById('notificationBadge'));

// Debug mobile navigation
console.log('Mobile menu state:', document.getElementById('mobileMenuToggle'));
console.log('Sidebar state:', document.getElementById('sidebar'));

// Debug theme system
console.log('Current theme:', document.body.getAttribute('data-theme'));
console.log('Theme preference:', localStorage.getItem('theme'));
```

### Performance Optimization
- **Lazy Loading**: Charts load data on demand
- **Debounced Updates**: Input changes debounced to reduce API calls
- **Caching**: LocalStorage caching for frequently accessed data
- **Minified Assets**: Production uses minified CSS and JavaScript
- **Image Optimization**: Logo and assets optimized for web
- **Video Compression**: Background video compressed for faster loading

---

## 📄 License

This project is proprietary to CMRL. All rights reserved.

---

## 🤝 Support

For technical support and feature requests:
- Contact: IT Support Team
- Email: support@cmrl.com
- Documentation: Internal Wiki

---

## 📋 Complete Feature Summary

### **Core Features Implemented:**
✅ **Authentication System** - Login/logout with session management  
✅ **Multi-Module Dashboard** - 5 interconnected modules  
✅ **Real-time Data Sync** - Backend + localStorage fallback  
✅ **Excel Integration** - Import/export for all modules  
✅ **Theme System** - Dark/light mode with persistence  
✅ **Mobile Responsive** - Touch-optimized interface  
✅ **Bulk Operations** - Multi-row selection and actions  
✅ **Notification System** - Real-time alerts and expiry warnings  
✅ **Advanced Filtering** - Column-based hide/show functionality  
✅ **Audit Trail** - Complete operation logging  
✅ **AI Analytics** - Machine learning-powered insights  
✅ **Interactive Charts** - Data visualization with Chart.js  
✅ **KPI Tracking** - Performance metrics and monitoring  

### **Backend Features:**
✅ **Flask Application** - RESTful API with proper error handling  
✅ **Database Management** - MySQL with proper schema and migrations  
✅ **User Authentication** - Session-based with role management  
✅ **File Upload Handling** - Base64 encoding for attachments  
✅ **API Endpoints** - Complete CRUD operations for all modules  
✅ **Database Utilities** - init_db.py and check_users.py scripts  
✅ **Environment Configuration** - Secure .env file management  

### **Frontend JavaScript Modules:**
✅ **login.js** - Authentication form handling and validation  
✅ **auth.js** - Session management and role-based access  
✅ **api.js** - HTTP communication layer with error handling  
✅ **script.js** - Contractor list management logic  
✅ **bill-tracker.js** - Bill lifecycle and notification system  
✅ **epbg.js** - Bank guarantee and document management  
✅ **analytics.js** - Chart.js integration and data visualization  
✅ **kpi-dashboard.js** - Real-time KPI calculations and sparklines  
✅ **ai-analytics.js** - Machine learning insights and predictions  

### **UI Components & Elements:**
✅ **Animated Login** - Video background + particle effects  
✅ **Sidebar Navigation** - Collapsible with module shortcuts  
✅ **Mobile Menu** - Hamburger menu with overlay  
✅ **Header Actions** - Save, undo, redo, refresh, print, export, import  
✅ **Bulk Action Toolbar** - Edit selected, delete selected  
✅ **Notification Bell** - Badge counter with modal  
✅ **Theme Toggle** - Fixed position theme switcher  
✅ **Filter Dropdowns** - Multi-select column filters  
✅ **Checkbox Selection** - Row selection controls  
✅ **Status Indicators** - Color-coded urgency displays  
✅ **Progress Bars** - Visual progress tracking  
✅ **Modal Windows** - File preview, notifications, confirmations  

### **Technical Features:**
✅ **CSS Variables** - Dynamic theming system  
✅ **Flexbox/Grid** - Modern layout system  
✅ **ES6+ JavaScript** - Modern syntax and features  
✅ **Base64 Encoding** - File attachment handling  
✅ **Session Storage** - Temporary data persistence  
✅ **Debounced Events** - Performance optimization  
✅ **Lazy Loading** - On-demand data loading  
✅ **Error Handling** - Comprehensive error management  
✅ **Cross-browser Support** - Compatible with major browsers  
✅ **Accessibility** - ARIA labels and keyboard navigation  

### **Database Features:**
✅ **MySQL Database** - Proper relational schema design  
✅ **User Management** - Role-based authentication system  
✅ **Data Migrations** - Schema updates and versioning  
✅ **Audit Logging** - Operation tracking and history  
✅ **File Storage** - Base64 encoded attachments  
✅ **Data Integrity** - Proper constraints and validation  

---

*Last Updated: February 25, 2026*
*Version: 1.2.0*
*Files: 9 JavaScript modules, 3 Python utilities, 2 SQL schemas*
*Features: 60+ documented features and components*
