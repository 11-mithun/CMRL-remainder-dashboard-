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
- **Multi-Module Navigation**: Contractor List, Bill Tracker, EPBG Management
- **Real-time Data Sync**: Automatic saving to backend with localStorage fallback
- **Excel Integration**: Import/Export functionality for all modules
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Theme System**: Dark/Light mode toggle with persistent preferences
- **Role-Based Access**: Admin/Editor/Viewer permissions

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

### 🏦 EPBG Module
- **Bank Guarantee Tracking**: PO numbers and guarantee details
- **Validity Management**: Expiry date tracking with alerts
- **Amount Management**: Guarantee amount tracking
- **GEM Integration**: Bid number and reference tracking
- **Document Management**: Multiple file attachments per record
- **Dual Attachment System**: BG number and document attachments

---

## 📱 Pages & Modules

### 1. Login Page (`/`)
**Features:**
- Email/Password authentication
- OTP-based password reset
- Session management
- Remember me functionality
- Theme-aware login interface

**UI Components:**
- Animated background
- Glass-morphism form design
- Responsive layout
- Error/success notifications

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

**UI Components:**
- Bill status indicators
- Amount comparison views
- Date range selectors
- Payment status badges

### 4. EPBG Page (`/epbg`)
**Features:**
- Bank guarantee management
- Validity tracking
- Document management
- GEM integration

**UI Components:**
- Guarantee status cards
- Validity countdown
- Document preview
- Multi-file attachment system

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
```

### Bill Tracker Endpoints
```
GET  /api/bill-tracker      - Get all bill records
POST /api/bill-tracker     - Save bill records
```

### EPBG Endpoints
```
GET  /api/epbg             - Get all EPBG records
POST /api/epbg            - Save EPBG records
```

---

## 📁 File Structure

```
CMRL-remainder-dashboard-/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt     # Python dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # Complete styling
│   ├── script.js          # Main JavaScript logic
│   └── api.js            # API communication layer
├── database/
│   └── schema.sql         # Database schema
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

# Run the application
python app.py
```

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
CREATE DATABASE cmrl_dashboard;

-- Use database
USE cmrl_dashboard;

-- Import schema
source database/schema.sql;

-- Create admin user
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

### EPBG Management
1. **Add Guarantees**: Create new bank guarantee entries
2. **Track Validity**: Monitor expiry dates
3. **Upload Documents**: Attach relevant files
4. **GEM Integration**: Link with GEM bid numbers

### Theme Customization
1. **Toggle Theme**: Click theme toggle button
2. **Persistent Preference**: Theme choice is saved
3. **System Sync**: Preference synced with backend

---

## 🔧 Configuration

### Environment Variables (.env)
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cmrl_dashboard

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

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');

// Check API responses
console.log('API Response:', response);

// Monitor data changes
const observer = new MutationObserver(callback);
observer.observe(document.body, { childList: true, subtree: true });
```

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

*Last Updated: February 2026*
*Version: 1.0.0*
