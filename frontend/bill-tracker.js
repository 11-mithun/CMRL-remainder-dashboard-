// Global variables
let history = [];
let historyIndex = -1;
const MAX_HISTORY_SIZE = 50;

// Data persistence keys
const BILL_TRACKER_DATA_KEY = 'billTrackerData';
const BILL_TRACKER_HISTORY_KEY = 'billTrackerHistory';
const BILL_TRACKER_HISTORY_INDEX_KEY = 'billTrackerHistoryIndex';
const ANALYTICS_DATA_KEY = 'analyticsData'; // Add analytics key

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadDataFromStorage(); // Load saved data
    updateTotalCount();
    setupLiveUpdates(); // Setup live data updates
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('addRowBtn').addEventListener('click', addRow);
    document.getElementById('saveBtn').addEventListener('click', saveData);
    document.getElementById('refreshBtn').addEventListener('click', refreshPage);
    document.getElementById('printBtn').addEventListener('click', printTable);
    document.getElementById('exportBtn').addEventListener('click', exportToExcel);
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('redoBtn').addEventListener('click', redo);
    
    // Import button functionality
    document.getElementById('importBtn').addEventListener('click', function() {
        document.getElementById('excelFileInput').click();
    });
    
    // File input change event
    document.getElementById('excelFileInput').addEventListener('change', handleFileImport);
    
    // Add event delegation for date inputs to calculate duration
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('start-date-input') || e.target.classList.contains('end-date-input')) {
            calculateDuration(e.target);
        }
    });
    
    // Initialize duration calculations after page load
    setTimeout(() => {
        updateAllDurations();
        startRealTimeDurationUpdates();
    }, 500);
    
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterTable(e.target.value);
        });
    }
}

// Calculate duration between start and end date
function calculateDuration(event) {
    const row = event.target.closest('tr');
    const startDateInput = row.querySelector('.start-date-input');
    const endDateInput = row.querySelector('.end-date-input');
    const durationDisplay = row.querySelector('.duration-display');
    const durationCell = durationDisplay.parentElement;

    if (startDateInput.value && endDateInput.value) {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        
        // Calculate difference in days
        const diffTime = endDate - startDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            durationDisplay.textContent = 'Invalid dates';
            durationDisplay.classList.remove('duration-safe');
            durationDisplay.classList.add('duration-left');
        } else if (diffDays === 0) {
            durationDisplay.textContent = 'Same day';
            durationDisplay.classList.remove('duration-safe');
            durationDisplay.classList.add('duration-left');
        } else {
                durationDisplay.textContent = diffDays;
                durationDisplay.classList.remove('duration-left');
                durationDisplay.classList.add('duration-safe');

                // Color coding: red if <= 60 days
                if (diffDays <= 60) {
                    durationDisplay.classList.add('duration-left');
                }
            }
    } else {
        durationDisplay.textContent = '-';
        durationDisplay.classList.remove('duration-safe', 'duration-left');
    }

    // Auto-save after calculation
    updateNotificationCount();
}

// Update all durations to show current days left from today
function updateAllDurations() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    const rows = tbody.querySelectorAll('tr');

    rows.forEach(row => {
        const startDateInput = row.querySelector('.start-date-input');
        const endDateInput = row.querySelector('.end-date-input');
        const durationDisplay = row.querySelector('.duration-display');

        if (startDateInput && endDateInput && durationDisplay && 
            startDateInput.value && endDateInput.value) {
            
            const startDate = new Date(startDateInput.value);
            const endDate = new Date(endDateInput.value);
            
            const diffTime = endDate - startDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                durationDisplay.textContent = 'Invalid dates';
                durationDisplay.classList.remove('duration-safe');
                durationDisplay.classList.add('duration-left');
            } else if (diffDays === 0) {
                durationDisplay.textContent = 'Same day';
                durationDisplay.classList.remove('duration-safe');
                durationDisplay.classList.add('duration-left');
            } else {
                durationDisplay.textContent = diffDays;
                durationDisplay.classList.remove('duration-left');
                durationDisplay.classList.add('duration-safe');

                // Color coding: red if <= 60 days
                if (diffDays <= 60) {
                    durationDisplay.classList.add('duration-left');
                }
            }
        } else {
            durationDisplay.textContent = '-';
            durationDisplay.classList.remove('duration-safe', 'duration-left');
        }
    });

    // Update notification badge after updating all durations
    updateNotificationCount();
}

// Start duration updates (no current date logic)
function startRealTimeDurationUpdates() {
    // Create status indicator for duration updates
    const createStatusIndicator = () => {
        const indicator = document.createElement('div');
        indicator.id = 'durationStatus';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #28a745;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
        indicator.textContent = 'Duration Calculator Active';
        return indicator;
    };

    const updateStatus = () => {
        // Update durations periodically (no current date dependency)
        setInterval(() => {
            updateAllDurations();
        }, 300000); // Update every 5 minutes instead of every minute
    };

    updateStatus();
}

// Calculate duration between start and end dates (no current date)
function calculateDuration(dateInput) {
    const row = dateInput.closest('tr');
    const startDateInput = row.querySelector('.start-date-input');
    const endDateInput = row.querySelector('.end-date-input');
    const durationDisplay = row.querySelector('.duration-display');
    
    if (!startDateInput.value || !endDateInput.value) {
        durationDisplay.textContent = '-';
        durationDisplay.className = 'duration-display';
        return;
    }
    
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    
    // Calculate duration between start and end dates
    const timeDiff = endDate - startDate;
    const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));
    
    // Handle invalid date ranges
    if (daysDiff < 0) {
        durationDisplay.textContent = 'Invalid';
        durationDisplay.className = 'duration-display duration-left';
        return;
    }
    
    // Set duration value
    durationDisplay.textContent = daysDiff;
    durationDisplay.className = 'duration-display duration-safe';
    
    // Color coding based on duration length
    if (daysDiff <= 60) {
        durationDisplay.classList.add('duration-left');
    }
    
    // Add tooltip with date information
    const startDateStr = startDate.toLocaleDateString();
    const endDateStr = endDate.toLocaleDateString();
    durationDisplay.title = `Start: ${startDateStr}\nEnd: ${endDateStr}\nDuration: ${daysDiff} days`;
}

// Handle file import
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get the first worksheet
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // Convert to JSON with raw:true to preserve Excel serial numbers
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { raw: true });
            
            // Process the imported data
            processImportedData(jsonData);
            
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Error reading file. Please ensure it is a valid Excel file.');
        }
    };
    
    reader.readAsArrayBuffer(file);
    
    // Reset the file input
    event.target.value = '';
}

// Convert Excel date to JavaScript Date
function excelDateToJS(v) {
    if (!v && v !== 0) return null;
    
    console.log('Converting value:', v, 'Type:', typeof v);
    
    // Excel numeric date
    if (typeof v === "number") {
        const jsDate = new Date(Math.round((v - 25569) * 86400 * 1000));
        console.log('Excel serial date:', v, '→ JS Date:', jsDate);
        return jsDate;
    }

    // Already string date - try to parse
    if (typeof v === "string") {
        console.log('String date:', v);
        const d = new Date(v);
        if (!isNaN(d)) {
            console.log('Parsed string date:', v, '→ JS Date:', d);
            return d;
        }
        
        // Try common date formats
        const formats = [
            /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/, // DD/MM/YYYY or DD-MM-YYYY
            /^(\d{4})[\/\-](\d{2})[\/\-](\d{2})$/, // YYYY/MM/DD or YYYY-MM-DD
        ];
        
        for (const format of formats) {
            const match = v.match(format);
            if (match) {
                let parsedDate;
                if (match[1].length === 4) {
                    // Year first
                    parsedDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
                } else {
                    // Day first
                    parsedDate = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
                }
                
                if (!isNaN(parsedDate)) {
                    console.log('Format matched:', v, '→ JS Date:', parsedDate);
                    return parsedDate;
                }
            }
        }
    }
    
    console.warn('Could not parse date:', v);
    return null;
}

// Process imported data
function processImportedData(jsonData) {
    if (jsonData.length === 0) {
        alert('No data found in the file.');
        return;
    }
    
    console.log('Raw Excel data structure:', jsonData);
    console.log('First row sample:', jsonData[0]);
    console.log('Row count:', jsonData.length);
    
    // Clear existing table
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    let validRows = 0;
    let skippedRows = 0;
    
    // Process each data row
    for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        console.log(`\n=== Processing row ${i} ===`);
        console.log('Raw row data:', row);
        
        // Apply strict date conversion
        const startDate = excelDateToJS(row["Start Date"]);
        const endDate = excelDateToJS(row["End Date"]);
        
        // Log each row for debugging
        console.log('Start Date - Raw:', row["Start Date"], '→ Converted:', startDate);
        console.log('End Date - Raw:', row["End Date"], '→ Converted:', endDate);
        
        // Reject row if either date missing
        if (!startDate || !endDate) {
            console.warn(`Skipping row ${i}: Missing start or end date`, row);
            skippedRows++;
            continue;
        }
        
        // Calculate duration between start and end dates
        const duration = Math.round((endDate - startDate) / 86400000);
        
        // Get other values (including S.NO from Excel)
        const sno = row["S.NO"] || row["S.No"] || row["SNo"] || (i + 1); // Auto-fill if not present
        console.log('S.NO extraction - Raw row data:', row);
        console.log('S.NO extraction - Available keys:', Object.keys(row));
        console.log('S.NO extraction - Looking for: S.NO, S.No, SNo');
        console.log('S.NO extraction - Final value:', sno);
        console.log('S.NO extraction - Type:', typeof sno);
        console.log('S.NO extraction - Length:', sno.length);
        const efileNo = row["Efile No"] || row["Efile"] || '';
        const contractor = row["Company"] || row["Contractor"] || '';
        const handleBy = row["Handle By"] || '';
        let frequency = row["Frequency"] || row["frequency"] || '';
        
        // Clean up frequency value
        if (frequency) {
            frequency = frequency.toString().trim().toLowerCase();
            console.log('Original frequency:', row["Frequency"], 'Cleaned frequency:', frequency);
        }
        
        // Map frequency variations to standard values
        const frequencyMap = {
            'yearly': 'yearly',
            'year': 'yearly',
            'annually': 'yearly',
            'half-yearly': 'half-yearly',
            'half yearly': 'half-yearly',
            'semi-annually': 'half-yearly',
            'quarterly': 'quarterly',
            'quarter': 'quarterly',
            'monthly': 'monthly',
            'month': 'monthly'
        };
        
        frequency = frequencyMap[frequency] || frequency;
        
        console.log('Final values:', { sno, efileNo, contractor, startDate, endDate, duration, handleBy, frequency });
        
        // Format date as YYYY-MM-DD for HTML date inputs
        const formatYYYYMMDD = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        // Create new table row
        const tableRow = document.createElement('tr');
        console.log('About to generate HTML with sno:', sno);
        tableRow.innerHTML = `
            <td>
                <input type="text" class="sno-input" placeholder="S.NO" value="${sno}">
            </td>
            <td>
                <input type="text" class="efile-no-input" placeholder="Enter Efile No" value="${efileNo}">
            </td>
            <td>
                <input type="text" class="contractor-input" placeholder="Enter Contractor" value="${contractor}">
            </td>
            <td>
                <input type="date" class="start-date-input" value="${formatYYYYMMDD(startDate)}">
            </td>
            <td>
                <input type="date" class="end-date-input" value="${formatYYYYMMDD(endDate)}">
            </td>
            <td>
                <input type="text" class="duration-input" placeholder="Duration" value="${duration}" readonly>
            </td>
            <td>
                <input type="text" class="handle-by-input" placeholder="Enter Handle By" value="${handleBy}">
            </td>
            <td>
                <select class="frequency-select">
                    <option value="">Select Frequency</option>
                    <option value="yearly" ${frequency === 'yearly' ? 'selected' : ''}>Yearly</option>
                    <option value="half-yearly" ${frequency === 'half-yearly' ? 'selected' : ''}>Half-Yearly</option>
                    <option value="quarterly" ${frequency === 'quarterly' ? 'selected' : ''}>Quarterly</option>
                    <option value="monthly" ${frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                </select>
            </td>
        `;
        
        tbody.appendChild(tableRow);
        validRows++;
        
        // Debug: Check what was actually rendered
        const snoInput = tableRow.querySelector('.sno-input');
        console.log('S.NO input after append - Element:', snoInput);
        console.log('S.NO input after append - Value:', snoInput?.value);
        console.log('S.NO input after append - HTML:', snoInput?.outerHTML);
    }
    
    // Update all durations after import
    setTimeout(() => {
        updateAllDurations();
    }, 100);
    
    updateTotalCount();
    
    const message = `Successfully imported ${validRows} rows${skippedRows > 0 ? ` (skipped ${skippedRows} invalid rows)` : ''}!`;
    alert(message);
}

// Assign sequential S.NO numbers to all rows in the table
function assignSequentialSNO() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    
    // Find the highest existing S.NO to continue numbering
    let startNumber = 1;
    rows.forEach(row => {
        const snoInput = row.querySelector('.sno-input');
        if (snoInput && snoInput.value) {
            const currentSNO = parseInt(snoInput.value);
            if (!isNaN(currentSNO) && currentSNO >= startNumber) {
                startNumber = currentSNO + 1;
            }
        }
    });
    
    // Now assign sequential numbers to all rows that don't have S.NO
    rows.forEach(row => {
        const snoInput = row.querySelector('.sno-input');
        if (snoInput && !snoInput.value) {
            snoInput.value = startNumber++;
        }
    });
    
    console.log('Assigned sequential S.NO numbers starting from:', startNumber - (rows.length - 1));
}

// Check if row is a header row
function isHeaderRow(row) {
    const headerKeywords = ['s.no', 'efile', 'contractor', 'start date', 'end date', 'duration', 'handle', 'frequency'];
    return row.some(cell => 
        cell && typeof cell === 'string' && 
        headerKeywords.some(keyword => cell.toLowerCase().includes(keyword))
    );
}

// Get column mapping from headers
function getColumnMapping(headerRow) {
    const mapping = {
        sno: -1,
        efile: -1,
        contractor: -1,
        startDate: -1,
        endDate: -1,
        duration: -1,
        handleBy: -1,
        frequency: -1
    };
    
    headerRow.forEach((header, index) => {
        if (!header) return;
        const headerLower = header.toString().toLowerCase().trim();
        
        // Explicit matching by header name
        if (headerLower === 's.no' || headerLower === 'serial no' || headerLower === 'sl no') {
            mapping.sno = index;
        } else if (headerLower === 'efile no' || headerLower === 'e-file no' || headerLower === 'efile no') {
            mapping.efile = index;
        } else if (headerLower === 'company' || headerLower === 'contractor' || headerLower === 'vendor') {
            mapping.contractor = index;
        } else if (headerLower === 'start date' || headerLower === 'from date') {
            mapping.startDate = index;
        } else if (headerLower === 'end date' || headerLower === 'to date') {
            mapping.endDate = index;
        } else if (headerLower === 'duration' || headerLower === 'days') {
            mapping.duration = index;
        } else if (headerLower === 'handle by' || headerLower === 'assigned to') {
            mapping.handleBy = index;
        } else if (headerLower === 'frequency') {
            mapping.frequency = index;
        }
    });
    
    return mapping;
}

// Format date for input field
function formatDate(dateValue) {
    // Handle null, undefined, or empty values
    if (dateValue === null || dateValue === undefined || dateValue === '') {
        return '';
    }
    
    // Handle Excel serial dates (numbers like 46112, 46843)
    if (typeof dateValue === 'number') {
        // Excel dates are stored as days since 1900-01-01
        // Convert to JavaScript Date (days since 1970-01-01)
        const excelEpoch = new Date(1900, 0, 1); // 1900-01-01
        const jsDate = new Date(excelEpoch.getTime() + (dateValue - 25569) * 86400 * 1000);
        
        if (isNaN(jsDate.getTime())) return '';
        
        // Format as YYYY-MM-DD
        const year = jsDate.getFullYear();
        const month = String(jsDate.getMonth() + 1).padStart(2, '0');
        const day = String(jsDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // If it's already a string in YYYY-MM-DD format, return as is
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
    }
    
    // Handle string dates (like "15/02/2024", "02-15-2024", etc.)
    if (typeof dateValue === 'string') {
        // Try different date formats
        const formats = [
            /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
            /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
            /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
            /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        ];
        
        for (const format of formats) {
            if (format.test(dateValue)) {
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                }
            }
        }
    }
    
    // Try to parse as regular date
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
        console.warn('Invalid date value:', dateValue);
        return '';
    }
    
    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// Add new row
function addRow() {
    const tbody = document.getElementById('tableBody');
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>
            <input type="text" class="sno-input" placeholder="S.NO" value="">
        </td>
        <td>
            <input type="text" class="efile-no-input" placeholder="Enter Efile No">
        </td>
        <td>
            <input type="text" class="contractor-input" placeholder="Enter Contractor">
        </td>
        <td>
            <input type="date" class="start-date-input" placeholder="Enter Start Date">
        </td>
        <td>
            <input type="date" class="end-date-input" placeholder="Enter End Date">
        </td>
        <td>
            <input type="text" class="duration-input" placeholder="Duration" readonly>
        </td>
        <td>
            <input type="text" class="handle-by-input" placeholder="Enter Handle By">
        </td>
        <td>
            <select class="frequency-select">
                <option value="">Select Frequency</option>
                <option value="yearly">Yearly</option>
                <option value="half-yearly">Half-Yearly</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
            </select>
        </td>
    `;
    
    tbody.appendChild(row);
    updateTotalCount();
    
    // Assign sequential S.NO number to the new row
    assignSequentialSNO();
}

// Delete row
function deleteRow(btn) {
    const row = btn.closest('tr');
    row.remove();
    updateTotalCount();
}

// Save data
function saveData() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    
    if (rows.length === 0) {
        alert('No data to save!');
        return;
    }
    
    const data = [];
    
    rows.forEach(row => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const efileNo = row.querySelector('.efile-no-input')?.value || '';
        const contractor = row.querySelector('.contractor-input')?.value || '';
        const startDate = row.querySelector('.start-date-input')?.value || '';
        const endDate = row.querySelector('.end-date-input')?.value || '';
        const duration = row.querySelector('.duration-display')?.textContent || '-';
        const handleBy = row.querySelector('.handle-by-input')?.value || '';
        const frequency = row.querySelector('.frequency-select')?.value || '';
        
        if (sno || efileNo || contractor || startDate || endDate || handleBy || frequency) {
            data.push({
                sno,
                efileNo,
                contractor,
                startDate,
                endDate,
                duration,
                handleBy,
                frequency
            });
        }
    });
    
    // Here you would normally send data to server
    console.log('Saving data:', data);
    alert('Data saved successfully!');
}

// Refresh page
function refreshPage() {
    location.reload();
}

// Print table
function printTable() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    
    if (rows.length === 0) {
        alert('No data to print!');
        return;
    }
    
    let printContent = `
        <html>
        <head>
            <title>Bill Tracker</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
            </style>
        </head>
        <body>
            <h2>Bill Tracker Report</h2>
            <table>
                <thead>
                    <tr>
                        <th>S.NO</th>
                        <th>EFILE NO</th>
                        <th>CONTRACTOR</th>
                        <th>START DATE</th>
                        <th>END DATE</th>
                        <th>DURATION</th>
                        <th>HANDLE BY</th>
                        <th>FREQUENCY</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    rows.forEach(row => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const efileNo = row.querySelector('.efile-no-input')?.value || '';
        const contractor = row.querySelector('.contractor-input')?.value || '';
        const startDate = row.querySelector('.start-date-input')?.value || '';
        const endDate = row.querySelector('.end-date-input')?.value || '';
        const duration = row.querySelector('.duration-display')?.textContent || '-';
        const handleBy = row.querySelector('.handle-by-input')?.value || '';
        const frequency = row.querySelector('.frequency-select')?.value || '';
        
        printContent += `
                    <tr>
                        <td>${sno}</td>
                        <td>${efileNo}</td>
                        <td>${contractor}</td>
                        <td>${startDate}</td>
                        <td>${endDate}</td>
                        <td>${duration}</td>
                        <td>${handleBy}</td>
                        <td>${frequency}</td>
                    </tr>
        `;
    });
    
    printContent += `
                </tbody>
            </table>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// Export to Excel
function exportToExcel() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    
    if (rows.length === 0) {
        alert('No data to export!');
        return;
    }
    
    // Prepare data for export
    const exportData = [];
    
    // Add headers
    exportData.push([
        'S.NO',
        'EFILE NO',
        'CONTRACTOR',
        'START DATE',
        'END DATE',
        'DURATION',
        'HANDLE BY',
        'FREQUENCY'
    ]);
    
    rows.forEach(row => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const efileNo = row.querySelector('.efile-no-input')?.value || '';
        const contractor = row.querySelector('.contractor-input')?.value || '';
        const startDate = row.querySelector('.start-date-input')?.value || '';
        const endDate = row.querySelector('.end-date-input')?.value || '';
        const duration = row.querySelector('.duration-display')?.textContent || '-';
        const handleBy = row.querySelector('.handle-by-input')?.value || '';
        const frequency = row.querySelector('.frequency-select')?.value || '';
        
        exportData.push([
            sno,
            efileNo,
            contractor,
            startDate,
            endDate,
            duration,
            handleBy,
            frequency
        ]);
    });
    
    // Create CSV content
    let csvContent = '';
    exportData.forEach(row => {
        csvContent += row.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'bill_tracker_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Data exported successfully!');
}

// Filter table
function filterTable(searchTerm) {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const sno = row.querySelector('.sno-input')?.value.toLowerCase() || '';
        const efile = row.querySelector('.efile-input')?.value.toLowerCase() || '';
        const contractor = row.querySelector('.contractor-input')?.value.toLowerCase() || '';
        const startDate = row.querySelector('.start-date-input')?.value.toLowerCase() || '';
        const endDate = row.querySelector('.end-date-input')?.value.toLowerCase() || '';
        const duration = row.querySelector('.duration-display')?.textContent.toLowerCase() || '';
        const handleBy = row.querySelector('.handle-by-input')?.value.toLowerCase() || '';
        const frequency = row.querySelector('.frequency-select')?.value.toLowerCase() || '';
        
        const matches = sno.includes(searchTerm.toLowerCase()) || 
                       efile.includes(searchTerm.toLowerCase()) || 
                       contractor.includes(searchTerm.toLowerCase()) || 
                       startDate.includes(searchTerm.toLowerCase()) || 
                       endDate.includes(searchTerm.toLowerCase()) || 
                       duration.includes(searchTerm.toLowerCase()) || 
                       handleBy.includes(searchTerm.toLowerCase()) || 
                       frequency.includes(searchTerm.toLowerCase());
        
        row.style.display = matches ? '' : 'none';
    });
    
    updateTotalCount();
}

// Update total count
function updateTotalCount() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
    
    const totalBadge = document.getElementById('totalBadge');
    if (totalBadge) {
        totalBadge.textContent = `Total: ${visibleRows.length}`;
    }
}

// Undo function
function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        restoreState(history[historyIndex]);
        updateUndoRedoButtons();
    }
}

// Redo function
function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        restoreState(history[historyIndex]);
        updateUndoRedoButtons();
    }
}

// Update undo/redo button states
function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) undoBtn.disabled = historyIndex <= 0;
    if (redoBtn) redoBtn.disabled = historyIndex >= history.length - 1;
}

// Save current state to history
function saveState() {
    const currentState = getTableData();
    
    // Remove any states after current index
    history = history.slice(0, historyIndex + 1);
    
    // Add new state
    history.push(JSON.stringify(currentState));
    
    // Limit history size
    if (history.length > MAX_HISTORY_SIZE) {
        history.shift();
    } else {
        historyIndex++;
    }
    
    updateUndoRedoButtons();
}

// Get current table data
function getTableData() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    const data = [];
    
    rows.forEach(row => {
        const rowData = {
            sno: row.querySelector('.sno-input').value,
            efile: row.querySelector('.efile-input').value,
            contractor: row.querySelector('.contractor-input').value,
            approvedDate: row.querySelector('.approved-date-input').value,
            approvedAmount: row.querySelector('.approved-amount-input').value,
            frequency: row.querySelector('.frequency-input').value
        };
        data.push(rowData);
    });
    
    return data;
}

// Restore table from state
function restoreState(stateString) {
    const state = JSON.parse(stateString);
    const tbody = document.getElementById('tableBody');
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    // Recreate rows from state
    state.forEach(rowData => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="text" class="sno-input" placeholder="Enter S.No" value="${rowData.sno}">
            </td>
            <td>
                <input type="text" class="efile-no-input" placeholder="Enter Efile No" value="${rowData.efileNo || ''}">
            </td>
            <td>
                <input type="text" class="contractor-input" placeholder="Enter Contractor" value="${rowData.contractor}">
            </td>
            <td>
                <input type="date" class="start-date-input" value="${rowData.startDate || ''}">
            </td>
            <td>
                <input type="date" class="end-date-input" value="${rowData.endDate || ''}">
            </td>
            <td>
                <span class="duration-display">${rowData.duration || '-'}</span>
            </td>
            <td>
                <input type="text" class="handle-by-input" placeholder="Enter Handle By" value="${rowData.handleBy || ''}">
            </td>
            <td>
                <select class="frequency-select">
                    <option value="">Select Frequency</option>
                    <option value="yearly" ${rowData.frequency === 'yearly' ? 'selected' : ''}>Yearly</option>
                    <option value="half-yearly" ${rowData.frequency === 'half-yearly' ? 'selected' : ''}>Half-Yearly</option>
                    <option value="quarterly" ${rowData.frequency === 'quarterly' ? 'selected' : ''}>Quarterly</option>
                    <option value="monthly" ${rowData.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                </select>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    updateTotalCount();
    
    // Re-assign sequential S.NO numbers after restoring state
    assignSequentialSNO();
}

// Navigate through table cells using arrow keys
function navigateTable(direction) {
    const activeElement = document.activeElement;
    const tbody = document.getElementById('tableBody');
    
    // Check if we're in an input/select element within the table
    if (!activeElement || !activeElement.closest('#tableBody')) {
        // If not focused on table, focus on first input of first row
        const firstRow = tbody.querySelector('tr');
        if (firstRow) {
            const firstInput = firstRow.querySelector('input, select');
            if (firstInput) {
                firstInput.focus();
                highlightCell(firstInput);
            }
        }
        return;
    }
    
    const currentRow = activeElement.closest('tr');
    const currentCell = activeElement.closest('td');
    const allRows = Array.from(tbody.querySelectorAll('tr'));
    const currentRowIndex = allRows.indexOf(currentRow);
    const allCells = Array.from(currentRow.querySelectorAll('td'));
    const currentCellIndex = allCells.indexOf(currentCell);
    
    let nextElement = null;
    let nextRowIndex = currentRowIndex;
    let nextCellIndex = currentCellIndex;
    
    switch (direction) {
        case 'ArrowUp':
            nextRowIndex = Math.max(0, currentRowIndex - 1);
            nextCellIndex = currentCellIndex;
            break;
        case 'ArrowDown':
            nextRowIndex = Math.min(allRows.length - 1, currentRowIndex + 1);
            nextCellIndex = currentCellIndex;
            break;
        case 'ArrowLeft':
            nextRowIndex = currentRowIndex;
            nextCellIndex = Math.max(0, currentCellIndex - 1);
            break;
        case 'ArrowRight':
            nextRowIndex = currentRowIndex;
            nextCellIndex = Math.min(allCells.length - 1, currentCellIndex + 1);
            break;
    }
    
    // Get the next row and cell
    const nextRow = allRows[nextRowIndex];
    if (nextRow) {
        const nextCell = nextRow.querySelectorAll('td')[nextCellIndex];
        if (nextCell) {
            // Find the next input/select element in the cell
            nextElement = nextCell.querySelector('input, select');
        }
    }
    
    // Focus on the next element
    if (nextElement) {
        nextElement.focus();
        highlightCell(nextElement);
        
        // Scroll the element into view if needed
        nextElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest', 
            inline: 'nearest' 
        });
    }
}

// Highlight the current cell for visual feedback
function highlightCell(element) {
    // Remove previous highlights
    document.querySelectorAll('.cell-highlight').forEach(cell => {
        cell.classList.remove('cell-highlight');
    });
    
    // Add highlight to current cell
    const cell = element.closest('td');
    if (cell) {
        cell.classList.add('cell-highlight');
    }
}

// Add keyboard shortcuts for undo/redo and navigation
document.addEventListener('keydown', function(e) {
    // Ctrl+Y or Ctrl+Shift+Z for redo
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
    }
    
    // Arrow key navigation for table rows
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        navigateTable(e.key);
    }
});

// Data Persistence Functions
function saveDataToStorage() {
    try {
        const tableData = getTableData();
        localStorage.setItem(BILL_TRACKER_DATA_KEY, JSON.stringify(tableData));
        localStorage.setItem(BILL_TRACKER_HISTORY_KEY, JSON.stringify(history));
        localStorage.setItem(BILL_TRACKER_HISTORY_INDEX_KEY, historyIndex.toString());
        
        // Also save to analytics data
        saveToAnalyticsData(tableData);
        
        console.log('Data saved to localStorage');
    } catch (error) {
        console.error('Error saving data to localStorage:', error);
    }
}

function loadDataFromStorage() {
    try {
        const savedData = localStorage.getItem(BILL_TRACKER_DATA_KEY);
        const savedHistory = localStorage.getItem(BILL_TRACKER_HISTORY_KEY);
        const savedHistoryIndex = localStorage.getItem(BILL_TRACKER_HISTORY_INDEX_KEY);
        
        if (savedData) {
            const tableData = JSON.parse(savedData);
            restoreTableFromData(tableData);
            console.log('Data loaded from localStorage');
        }
        
        if (savedHistory) {
            history = JSON.parse(savedHistory);
        }
        
        if (savedHistoryIndex) {
            historyIndex = parseInt(savedHistoryIndex);
        }
    } catch (error) {
        console.error('Error loading data from localStorage:', error);
    }
}

function restoreTableFromData(data) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    data.forEach(rowData => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="text" class="sno-input" placeholder="S.NO" value="${rowData.sno}">
            </td>
            <td>
                <input type="text" class="efile-no-input" placeholder="Enter Efile No" value="${rowData.efileNo}">
            </td>
            <td>
                <input type="text" class="contractor-input" placeholder="Enter Contractor" value="${rowData.contractor}">
            </td>
            <td>
                <input type="date" class="start-date-input" value="${rowData.startDate}">
            </td>
            <td>
                <input type="date" class="end-date-input" value="${rowData.endDate}">
            </td>
            <td>
                <input type="text" class="duration-input" placeholder="Duration" value="${rowData.duration}" readonly>
            </td>
            <td>
                <input type="text" class="handle-by-input" placeholder="Enter Handle By" value="${rowData.handleBy}">
            </td>
            <td>
                <select class="frequency-select">
                    <option value="">Select Frequency</option>
                    <option value="yearly" ${rowData.frequency === 'yearly' ? 'selected' : ''}>Yearly</option>
                    <option value="half-yearly" ${rowData.frequency === 'half-yearly' ? 'selected' : ''}>Half-Yearly</option>
                    <option value="quarterly" ${rowData.frequency === 'quarterly' ? 'selected' : ''}>Quarterly</option>
                    <option value="monthly" ${rowData.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                </select>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Recalculate durations
    updateAllDurations();
}

function saveToAnalyticsData(tableData) {
    try {
        // Get existing analytics data or create new
        let analyticsData = localStorage.getItem(ANALYTICS_DATA_KEY);
        analyticsData = analyticsData ? JSON.parse(analyticsData) : {};
        
        // Update bill tracker data with exact current data
        analyticsData.billTracker = {
            data: tableData,
            lastUpdated: new Date().toISOString(),
            count: tableData.length
        };
        
        // Also save to legacy key for compatibility
        localStorage.setItem(BILL_TRACKER_DATA_KEY, JSON.stringify(tableData));
        
        localStorage.setItem(ANALYTICS_DATA_KEY, JSON.stringify(analyticsData));
        console.log('Bill tracker data saved to analytics:', tableData.length, 'records');
        
        // Trigger analytics update if on analytics page
        if (window.location.pathname.includes('analytics.html')) {
            setTimeout(() => {
                if (typeof loadAnalyticsData === 'function') {
                    loadAnalyticsData();
                }
            }, 100);
        }
    } catch (error) {
        console.error('Error saving to analytics data:', error);
    }
}

// Live Updates Functions
function setupLiveUpdates() {
    // Save data on any input change
    document.addEventListener('input', function(e) {
        if (e.target.matches('input, select')) {
            saveDataToStorage();
            updateTotalCount();
        }
    });
    
    // Save data on row deletion
    document.addEventListener('click', function(e) {
        if (e.target.matches('.delete-row-btn')) {
            setTimeout(() => {
                saveDataToStorage();
                updateTotalCount();
            }, 100);
        }
    });
    
    // Listen for storage changes from other tabs/pages
    window.addEventListener('storage', function(e) {
        if (e.key === ANALYTICS_DATA_KEY && e.newValue) {
            // If on analytics page, reload data when bill tracker updates
            if (window.location.pathname.includes('analytics.html')) {
                setTimeout(() => {
                    if (typeof loadAnalyticsData === 'function') {
                        loadAnalyticsData();
                    }
                }, 100);
            }
        }
    });
}

// Override saveData function to include localStorage
const originalSaveData = saveData;
saveData = function() {
    originalSaveData();
    saveDataToStorage();
    showNotification('Data saved successfully!', 'success');
};

// Override addRow function to include localStorage
const originalAddRow = addRow;
addRow = function() {
    originalAddRow();
    saveDataToStorage();
};

// Override deleteRow function to include localStorage
const originalDeleteRow = deleteRow;
deleteRow = function(btn) {
    originalDeleteRow(btn);
    setTimeout(() => {
        saveDataToStorage();
    }, 100);
};

// Notification function
function showNotification(message, type = 'info') {
    // Update notification badge
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        const currentCount = parseInt(badge.textContent) || 0;
        badge.textContent = currentCount + 1;
        
        // Show notification animation
        badge.style.animation = 'none';
        setTimeout(() => {
            badge.style.animation = 'pulse 0.5s ease-in-out';
        }, 10);
    }
    
    // Create notification toast
    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #2ecc71, #27ae60)' : 
                    type === 'error' ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 
                    'linear-gradient(135deg, #3498db, #2980b9)'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
