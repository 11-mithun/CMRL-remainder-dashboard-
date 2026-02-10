# Reminder Dashboard Backend

Python Flask backend with MySQL database for storing data from the Reminder Dashboard application.

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install MySQL

Make sure MySQL is installed and running on your system.

### 3. Create Database

Connect to MySQL and create the database:

```sql
CREATE DATABASE reminder_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Configure Database Connection

Copy `.env.example` to `.env` and update with your MySQL credentials:

```bash
cp .env.example .env
```

Edit `.env` file:
```
DB_HOST=localhost
DB_NAME=reminder_dashboard
DB_USER=root
DB_PASSWORD=your_password_here
```

### 5. Run the Backend Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Contractor List
- `GET /api/contractor-list` - Get all contractor list records
- `POST /api/contractor-list` - Save contractor list data

### Bill Tracker
- `GET /api/bill-tracker` - Get all bill tracker records
- `POST /api/bill-tracker` - Save bill tracker data

### EPBG
- `GET /api/epbg` - Get all EPBG records
- `POST /api/epbg` - Save EPBG data

### Health Check
- `GET /api/health` - Check server and database status

## Database Schema

### contractor_list
- id, sno, efile, contractor, description, value
- start_date, end_date, duration
- file_name, file_base64, file_type
- created_at, updated_at

### bill_tracker
- id, sno, efile, contractor
- approved_date, approved_amount, bill_frequency
- bill_date, bill_due_date, bill_paid_date, paid_amount
- file_name, file_base64, file_type
- created_at, updated_at

### epbg
- id, sno, contractor, po_no, bg_no
- bg_date, bg_amount, bg_validity
- gem_bid_no, ref_efile_no
- file_name, file_base64, file_type
- created_at, updated_at
