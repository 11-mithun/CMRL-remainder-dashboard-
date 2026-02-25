// Global variables
let history = [];
let historyIndex = -1;
const MAX_HISTORY_SIZE = 50;

// Data persistence keys
const BILL_TRACKER_DATA_KEY = 'billTrackerData'; // Use simple key like contractorListData
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
    
    // Notification bell button - open notification modal
    const notificationBellBtn = document.getElementById('notificationBellBtn');
    if (notificationBellBtn) {
        notificationBellBtn.addEventListener('click', function () {
            openNotificationModal();
        });
    }
    
    // Add event delegation for date inputs to calculate duration
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('start-date-input') || e.target.classList.contains('end-date-input')) {
            calculateDuration(e.target);
        }
    });
    
    // Initialize bulk operations
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('frequency-select')) {
            // Mark as manually edited to prevent auto-sync
            e.target.setAttribute('data-manual-edit', 'true');
        }
    });
    
    // Initialize global months dropdown
    initializeGlobalMonthsDropdown();
    initializeFilterYearDropdown();
    
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
    
    // Initialize table filters dropdown
    initializeTableFilters();
    
    // Theme Toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            const user = Auth.getUser();
            if (user) {
                const currentTheme = user.theme || 'light';
                const newTheme = (currentTheme === 'light') ? 'dark' : 'light';
                Auth.updateTheme(newTheme);
            }
        });
    }
}

// Calculate duration from current date to end date
function calculateDuration(event) {
    const row = event.target.closest('tr');
    const startDateInput = row.querySelector('.start-date-input');
    const endDateInput = row.querySelector('.end-date-input');
    const durationDisplay = row.querySelector('.duration-display');
    const durationCell = durationDisplay.parentElement;

    if (endDateInput.value) {
        const endDate = new Date(endDateInput.value);
        const currentDate = new Date();
        
        // Calculate difference in days from current date to end date
        const diffTime = endDate - currentDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            durationDisplay.textContent = 'Expired';
            durationDisplay.style.color = '#ff4757';
            durationDisplay.style.padding = '4px 8px';
            durationDisplay.style.borderRadius = '4px';
            durationDisplay.style.fontWeight = 'bold';
        } else if (diffDays === 0) {
            durationDisplay.textContent = 'Expires today';
            durationDisplay.style.color = '#ff4757';
            durationDisplay.style.padding = '4px 8px';
            durationDisplay.style.borderRadius = '4px';
            durationDisplay.style.fontWeight = 'bold';
        } else {
                durationDisplay.textContent = diffDays + ' days left';
                
                // Color coding based on days left
                if (diffDays < 30) {
                    // Red for less than 30 days
                    durationDisplay.style.color = '#ff4757';
                } else if (diffDays >= 30 && diffDays <= 90) {
                    // Yellow for 30-90 days
                    durationDisplay.style.color = '#ffa502';
                } else {
                    // Green for more than 90 days
                    durationDisplay.style.color = '#2ed573';
                }
                
                durationDisplay.style.padding = '4px 8px';
                durationDisplay.style.borderRadius = '4px';
                durationDisplay.style.fontWeight = 'bold';
                durationDisplay.classList.remove('duration-left');
                durationDisplay.classList.add('duration-safe');
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

        if (endDateInput && durationDisplay && 
            endDateInput.value) {
            
            const endDate = new Date(endDateInput.value);
            const currentDate = new Date();
            
            // Calculate difference in days from current date to end date
            const diffTime = endDate - currentDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                durationDisplay.textContent = 'Expired';
                durationDisplay.style.color = '#ff4757';
                durationDisplay.style.padding = '4px 8px';
                durationDisplay.style.borderRadius = '4px';
                durationDisplay.style.fontWeight = 'bold';
            } else if (diffDays === 0) {
                durationDisplay.textContent = 'Expires today';
                durationDisplay.style.color = '#ff4757';
                durationDisplay.style.padding = '4px 8px';
                durationDisplay.style.borderRadius = '4px';
                durationDisplay.style.fontWeight = 'bold';
            } else {
                durationDisplay.textContent = diffDays + ' days left';
                
                // Color coding based on days left - Updated logic
                if (diffDays <= 60) {
                    // Red for 60 days or less
                    durationDisplay.style.color = '#ff4757';
                    durationDisplay.classList.add('warning');
                } else if (diffDays > 60 && diffDays <= 90) {
                    // Yellow for 60-90 days
                    durationDisplay.style.color = '#ffa502';
                    durationDisplay.classList.remove('warning');
                } else {
                    // Green for more than 90 days
                    durationDisplay.style.color = '#2ed573';
                    durationDisplay.classList.remove('warning');
                }
                
                durationDisplay.style.padding = '4px 8px';
                durationDisplay.style.borderRadius = '4px';
                durationDisplay.style.fontWeight = 'bold';
                durationDisplay.classList.remove('duration-left');
                durationDisplay.classList.add('duration-safe');
            }
        } else if (durationDisplay) {
            // Handle case where durationDisplay exists but no end date
            durationDisplay.textContent = '-';
            durationDisplay.classList.remove('duration-safe', 'duration-left', 'warning');
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
        // Update durations periodically based on current date
        setInterval(() => {
            updateAllDurations();
        }, 300000); // Update every 5 minutes
    };

    updateStatus();
}

// Calculate duration from current date to end date
function calculateDuration(dateInput) {
    const row = dateInput.closest('tr');
    const startDateInput = row.querySelector('.start-date-input');
    const endDateInput = row.querySelector('.end-date-input');
    const durationDisplay = row.querySelector('.duration-display');
    
    if (!endDateInput.value) {
        durationDisplay.textContent = '-';
        durationDisplay.className = 'duration-display';
        return;
    }
    
    const endDate = new Date(endDateInput.value);
    const currentDate = new Date();
    
    // Calculate duration from current date to end date
    const timeDiff = endDate - currentDate;
    const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));
    
    // Handle expired dates
    if (daysDiff < 0) {
        durationDisplay.textContent = 'Expired';
        durationDisplay.style.color = '#ff4757';
        durationDisplay.style.padding = '4px 8px';
        durationDisplay.style.borderRadius = '4px';
        durationDisplay.style.fontWeight = 'bold';
        return;
    }
    
    // Handle expires today
    if (daysDiff === 0) {
        durationDisplay.textContent = 'Expires today';
        durationDisplay.style.color = '#ff4757';
        durationDisplay.style.padding = '4px 8px';
        durationDisplay.style.borderRadius = '4px';
        durationDisplay.style.fontWeight = 'bold';
        return;
    }
    
    // Set duration value for future dates
    durationDisplay.textContent = daysDiff + ' days left';
    
    // Color coding based on days left
    if (daysDiff < 30) {
        // Red for less than 30 days
        durationDisplay.style.color = '#ff4757';
    } else if (daysDiff >= 30 && daysDiff <= 90) {
        // Yellow for 30-90 days
        durationDisplay.style.color = '#ffa502';
    } else {
        // Green for more than 90 days
        durationDisplay.style.color = '#2ed573';
    }
    
    durationDisplay.style.padding = '4px 8px';
    durationDisplay.style.borderRadius = '4px';
    durationDisplay.style.fontWeight = 'bold';
    durationDisplay.className = 'duration-display duration-safe';
    
    // Add tooltip with date information
    const currentDateStr = currentDate.toLocaleDateString();
    const endDateStr = endDate.toLocaleDateString();
    durationDisplay.title = `Today: ${currentDateStr}\nEnd: ${endDateStr}\nDays left: ${daysDiff}`;
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
        
        // Calculate duration from current date to end date
        const currentDate = new Date();
        const duration = Math.round((endDate - currentDate) / 86400000);
        
        // Determine display text and color based on duration
        let durationDisplayText = '';
        let durationStyle = '';
        let durationColor = '';
        
        if (duration < 0) {
            durationDisplayText = 'Expired';
            durationColor = '#ff4757';
        } else if (duration === 0) {
            durationDisplayText = 'Expires today';
            durationColor = '#ff4757';
        } else {
            durationDisplayText = duration + ' days left';
            if (duration < 30) {
                // Red for less than 30 days
                durationColor = '#ff4757';
            } else if (duration >= 30 && duration <= 90) {
                // Yellow for 30-90 days
                durationColor = '#ffa502';
            } else {
                // Green for more than 90 days
                durationColor = '#2ed573';
            }
        }
        
        durationStyle = `color: ${durationColor}; padding: 4px 8px; border-radius: 4px; font-weight: bold;`;
        
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
        const months = row["Months"] || row["months"] || '';
        
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
        
        console.log('Final values:', { sno, efileNo, contractor, startDate, endDate, duration, handleBy, frequency, months });
        
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
                <input type="text" class="duration-input" placeholder="Duration" value="${durationDisplayText}" readonly style="${durationStyle}">
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
            <td>
                <div class="months-status" style="font-size: 11px; color: #ffa502; margin-top: 2px;">Pending</div>
            </td>
            <td>
                <div class="pending-status" style="font-size: 11px; color: #ffa502; margin-top: 2px;">-</div>
            </td>
            <td>
                <input type="text" class="remarks-input" placeholder="Enter Remarks" value="${row['Remarks'] || row['remarks'] || ''}">
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
    
    // Auto-show expiry alerts after import
    setTimeout(() => {
        checkAllDurations();
        updateNotificationCount();
        const warningCount = getWarningCount();
        if (warningCount > 0) {
            openNotificationModal();
        }
    }, 500);
}

// Open notification modal and show all duration warnings
function openNotificationModal() {
    // First, check all rows for duration warnings
    checkAllDurations();
    // Update badge to reflect current warnings
    updateNotificationCount();

    // Get or create notification modal
    let modal = document.getElementById('notificationModal');
    if (!modal) {
        // Create modal if it doesn't exist
        modal = document.createElement('div');
        modal.className = 'notification-modal';
        modal.id = 'notificationModal';
        modal.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> Duration Warning</h3>
                    <button class="notification-close" id="closeNotification">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="notification-body" id="notificationBody"></div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add close button event
        const closeBtn = modal.querySelector('#closeNotification');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeNotification);
        }

        // Close on overlay click
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeNotification();
            }
        });
    }

    const notificationBody = document.getElementById('notificationBody');
    if (!notificationBody) return;

    // Clear existing content
    notificationBody.innerHTML = '';

    // Get all rows with warnings
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    const rows = tbody.querySelectorAll('tr');
    let warningFound = false;

    rows.forEach((row, index) => {
        const snoCell = row.querySelector('.sno-input');
        const efileCell = row.querySelector('.efile-no-input');
        const contractorCell = row.querySelector('.contractor-input');
        const startDateInput = row.querySelector('.start-date-input');
        const endDateInput = row.querySelector('.end-date-input');
        const durationDisplay = row.querySelector('.duration-input');

        // Skip rows without required elements
        if (!durationDisplay) {
            console.log(`Row ${index}: No duration display found, skipping`);
            return;
        }

        // Use same logic as getWarningCount to identify warnings
        let isWarning = false;
        let daysLeft = 0;
        let daysText = durationDisplay.textContent || '';
        
        if (startDateInput && endDateInput && startDateInput.value && endDateInput.value) {
            const startDate = new Date(startDateInput.value);
            const endDate = new Date(endDateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (endDate >= startDate) {
                const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                if (diffDays <= 60 && diffDays >= 0) {
                    isWarning = true;
                    daysLeft = diffDays;
                }
            }
        } else if (daysText.includes('days')) {
            const match = daysText.match(/(\d+)\s*days/);
            if (match) {
                const days = parseInt(match[1], 10);
                if (days <= 60) {
                    isWarning = true;
                    daysLeft = days;
                }
            }
        } else if (daysText === 'Expired' || daysText === 'Expires today') {
            isWarning = true;
            daysLeft = 0;
        }

        // Debug logging
        console.log(`Row ${index}: isWarning = ${isWarning}, duration = "${daysText}"`);

        if (isWarning) {
            warningFound = true;
            const sno = snoCell ? snoCell.value : (index + 1);
            const efile = efileCell ? efileCell.value : '';
            const contractor = contractorCell ? contractorCell.value : 'Unknown';
            const startDate = startDateInput ? startDateInput.value : '';
            const endDate = endDateInput ? endDateInput.value : '';

            const notificationItem = document.createElement('div');
            notificationItem.className = 'notification-item';
            notificationItem.innerHTML = `
                <div class="notification-item-title">
                    <i class="fas fa-exclamation-circle"></i>
                    Warning: Only ${daysLeft} days remaining!
                </div>
                <div class="notification-item-details">
                    <div>
                        <strong>S.NO</strong>
                        <span>${sno || 'N/A'}</span>
                    </div>
                    <div>
                        <strong>E-FILE</strong>
                        <span>${efile || 'N/A'}</span>
                    </div>
                    <div>
                        <strong>CONTRACTOR</strong>
                        <span>${contractor || 'N/A'}</span>
                    </div>
                    <div>
                        <strong>START DATE</strong>
                        <span>${startDate || 'N/A'}</span>
                    </div>
                    <div>
                        <strong>END DATE</strong>
                        <span>${endDate || 'N/A'}</span>
                    </div>
                    <div>
                        <strong>DURATION</strong>
                        <span style="color: #ff4444; font-weight: bold;">${daysLeft} days left</span>
                    </div>
                </div>
            `;
            notificationBody.appendChild(notificationItem);
        }
    });

    // If no warnings found, show empty message
    if (!warningFound) {
        notificationBody.innerHTML = `
            <div class="notification-empty">
                <i class="fas fa-check-circle" style="font-size: 48px; color: #00d4ff; margin-bottom: 15px; display: block;"></i>
                <p>No duration warnings found!</p>
                <p style="font-size: 14px; margin-top: 10px; color: rgba(255, 255, 255, 0.5);">All contracts have more than 60 days remaining.</p>
            </div>
        `;
    }

    // Show modal
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close notification modal
function closeNotification() {
    const modal = document.getElementById('notificationModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
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
        <td>
            <div class="months-status" style="font-size: 11px; color: #ffa502; margin-top: 2px;">Pending</div>
        </td>
        <td>
            <div class="pending-status" style="font-size: 11px; color: #ffa502; margin-top: 2px;">-</div>
        </td>
        <td>
            <input type="text" class="remarks-input" placeholder="Enter Remarks">
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
async function saveData() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    
    if (rows.length === 0) {
        alert('No data to save!');
        return;
    }
    
    const data = [];
    
    rows.forEach((row, index) => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const efileNo = row.querySelector('.efile-no-input')?.value || '';
        const contractor = row.querySelector('.contractor-input')?.value || '';
        const startDate = row.querySelector('.start-date-input')?.value || '';
        const endDate = row.querySelector('.end-date-input')?.value || '';
        const duration = row.querySelector('.duration-input')?.value || '';
        const handleBy = row.querySelector('.handle-by-input')?.value || '';
        const frequency = row.querySelector('.frequency-select')?.value || '';
        const months = row.querySelector('.months-status')?.textContent || '';
        const pendingStatus = row.querySelector('.pending-status')?.textContent || '';
        const remarks = row.querySelector('.remarks-input')?.value || '';
        
        // DEBUG: Log data collection
        console.log(`Save Row ${index}: EFILE="${efileNo}", CONTRACTOR="${contractor}", FREQUENCY="${frequency}", MONTHS="${months}", PENDING STATUS="${pendingStatus}", REMARKS="${remarks}"`);

        if (sno || efileNo || contractor || startDate || endDate || handleBy || frequency || months || pendingStatus || remarks) {
            data.push({
                sno,
                efileNo,
                contractor,
                startDate,
                endDate,
                duration,
                handleBy,
                frequency,
                months,
                pendingStatus,
                remarks
            });
        }
    });

    // Save to temporary storage
    try {
        await saveDataToStorage();
        alert('Data saved temporarily (session only)!');
    } catch (error) {
        alert('Error saving data temporarily. Please try again.');
        console.error('Save error:', error);
    }
}

// Save data to sessionStorage (temporary storage)
async function saveDataToStorage() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    const dataToSave = [];

    for (const row of rows) {
        const sno = row.querySelector('.sno-input')?.value || '';
        const efileNo = row.querySelector('.efile-no-input')?.value || '';
        const contractor = row.querySelector('.contractor-input')?.value || '';
        const startDate = row.querySelector('.start-date-input')?.value || '';
        const endDate = row.querySelector('.end-date-input')?.value || '';
        const duration = row.querySelector('.duration-input')?.value || '';
        const handleBy = row.querySelector('.handle-by-input')?.value || '';
        const frequency = row.querySelector('.frequency-select')?.value || '';
        const months = row.querySelector('.months-status')?.textContent || '';
        const pendingStatus = row.querySelector('.pending-status')?.textContent || '';
        const remarks = row.querySelector('.remarks-input')?.value || '';

        dataToSave.push({
            sno,
            efileNo,
            contractor,
            startDate,
            endDate,
            duration,
            handleBy,
            frequency,
            months,
            pendingStatus,
            remarks
        });
    }

    // Save to sessionStorage only (temporary storage)
    try {
        sessionStorage.setItem(BILL_TRACKER_DATA_KEY, JSON.stringify(dataToSave));
        console.log('Data saved to sessionStorage (temporary):', dataToSave.length, 'records');
    } catch (error) {
        console.error('Failed to save to sessionStorage:', error);
    }
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
                        <th>MONTHS</th>
                        <th>PENDING</th>
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
        const duration = row.querySelector('.duration-input')?.value || '-';
        const handleBy = row.querySelector('.handle-by-input')?.value || '';
        const frequency = row.querySelector('.frequency-select')?.value || '';
        const months = row.querySelector('.months-select')?.value || '';
        const remarks = row.querySelector('.remarks-input')?.value || '';
        
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
                        <td>${months}</td>
                        <td>${pending}</td>
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
        'FREQUENCY',
        'MONTHS',
        'PENDING STATUS',
        'REMARKS'
    ]);
    
    rows.forEach(row => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const efileNo = row.querySelector('.efile-no-input')?.value || '';
        const contractor = row.querySelector('.contractor-input')?.value || '';
        const startDate = row.querySelector('.start-date-input')?.value || '';
        const endDate = row.querySelector('.end-date-input')?.value || '';
        const duration = row.querySelector('.duration-input')?.value || '-';
        const handleBy = row.querySelector('.handle-by-input')?.value || '';
        const frequency = row.querySelector('.frequency-select')?.value || '';
        const months = row.querySelector('.months-status')?.textContent || '';
        const pendingStatus = row.querySelector('.pending-status')?.textContent || '';
        const remarks = row.querySelector('.remarks-input')?.value || '';
        
        exportData.push([
            sno,
            efileNo,
            contractor,
            startDate,
            endDate,
            duration,
            handleBy,
            frequency,
            months,
            pendingStatus,
            remarks
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
        const efile = row.querySelector('.efile-no-input')?.value.toLowerCase() || '';
        const contractor = row.querySelector('.contractor-input')?.value.toLowerCase() || '';
        const startDate = row.querySelector('.start-date-input')?.value.toLowerCase() || '';
        const endDate = row.querySelector('.end-date-input')?.value.toLowerCase() || '';
        const duration = row.querySelector('.duration-input')?.value.toLowerCase() || '';
        const handleBy = row.querySelector('.handle-by-input')?.value.toLowerCase() || '';
        const frequency = row.querySelector('.frequency-select')?.value.toLowerCase() || '';
        const remarks = row.querySelector('.remarks-input')?.value.toLowerCase() || '';
        const monthsStatus = row.querySelector('.months-status')?.textContent.toLowerCase() || '';
        const pendingStatus = row.querySelector('.pending-status')?.textContent.toLowerCase() || '';
        
        const matches = sno.includes(searchTerm.toLowerCase()) || 
                       efile.includes(searchTerm.toLowerCase()) || 
                       contractor.includes(searchTerm.toLowerCase()) || 
                       startDate.includes(searchTerm.toLowerCase()) || 
                       endDate.includes(searchTerm.toLowerCase()) || 
                       duration.includes(searchTerm.toLowerCase()) || 
                       handleBy.includes(searchTerm.toLowerCase()) || 
                       frequency.includes(searchTerm.toLowerCase()) ||
                       monthsStatus.includes(searchTerm.toLowerCase()) ||
                       pendingStatus.includes(searchTerm.toLowerCase()) ||
                       remarks.includes(searchTerm.toLowerCase());
        
        row.style.display = matches ? '' : 'none';
    });
    
    updateTotalCount();
}

// Initialize global months dropdown functionality
function initializeGlobalMonthsDropdown() {
    const globalMonthsSelect = document.getElementById('globalMonthsSelect');
    if (!globalMonthsSelect) return;
    
    globalMonthsSelect.addEventListener('change', function(e) {
        const selectedMonth = e.target.value;
        updateAllMonthsStatus(selectedMonth, '');
    });
}

// Initialize filter year dropdown functionality
function initializeFilterYearDropdown() {
    const filterYearSelect = document.getElementById('filterYearSelect');
    if (!filterYearSelect) return;
    
    filterYearSelect.addEventListener('change', function(e) {
        const selectedYear = e.target.value;
        const globalMonthsSelect = document.getElementById('globalMonthsSelect');
        const selectedMonth = globalMonthsSelect ? globalMonthsSelect.value : '';
        
        // Sync with month column - update status with selected year and month
        updateAllMonthsStatusWithYear(selectedMonth, selectedYear);
        console.log('Filter year selected:', selectedYear);
    });
}

// Update all months status with selected month and year (synced)
function updateAllMonthsStatusWithYear(selectedMonth, selectedYear) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const monthsStatusDiv = row.querySelector('.months-status');
        const pendingStatusDiv = row.querySelector('.pending-status');
        
        // Update months status display with year
        if (monthsStatusDiv) {
            let displayText = '';
            let color = '#ffa502'; // Default orange for pending
            
            if (selectedMonth && selectedYear) {
                displayText = `${selectedMonth} ${selectedYear}`;
                color = '#2ed573'; // Green for selected
            } else if (selectedMonth) {
                displayText = selectedMonth;
                color = '#2ed573'; // Green for selected
            } else if (selectedYear) {
                displayText = selectedYear;
                color = '#2ed573'; // Green for selected
            } else {
                displayText = 'Pending';
                color = '#ffa502'; // Orange for pending
            }
            
            monthsStatusDiv.textContent = displayText;
            monthsStatusDiv.style.color = color;
        }
        
        // Update pending status based on selected month and year
        if (pendingStatusDiv) {
            const pendingStatus = calculatePendingStatusWithYear(row, selectedMonth, selectedYear);
            pendingStatusDiv.textContent = pendingStatus.text;
            pendingStatusDiv.style.color = pendingStatus.color;
        }
    });
}

// Calculate pending status with year consideration
function calculatePendingStatusWithYear(row, selectedMonth, selectedYear) {
    if (!selectedMonth || !selectedYear) {
        return { text: '-', color: '#ffa502' };
    }
    
    const endDateInput = row.querySelector('.end-date-input');
    if (!endDateInput || !endDateInput.value) {
        return { text: 'Pending', color: '#ffa502' };
    }
    
    const endDate = new Date(endDateInput.value);
    const currentDate = new Date();
    
    // Get month number for comparison
    const monthMap = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3,
        'May': 4, 'June': 5, 'July': 6, 'August': 7,
        'September': 8, 'October': 9, 'November': 10, 'December': 11
    };
    
    const selectedMonthNum = monthMap[selectedMonth];
    const selectedYearNum = parseInt(selectedYear);
    const endMonthNum = endDate.getMonth();
    const endYearNum = endDate.getFullYear();
    const currentYearNum = currentDate.getFullYear();
    const currentMonthNum = currentDate.getMonth();
    
    // Determine status based on comparison
    if (selectedYearNum < endYearNum) {
        return { text: 'Paid', color: '#2ed573' };
    } else if (selectedYearNum === endYearNum) {
        if (selectedMonthNum < endMonthNum) {
            return { text: 'Paid', color: '#2ed573' };
        } else if (selectedMonthNum === endMonthNum) {
            if (currentMonthNum >= endMonthNum && currentYearNum >= endYearNum) {
                return { text: 'Paid', color: '#2ed573' };
            } else {
                return { text: 'Pending', color: '#ffa502' };
            }
        } else {
            return { text: 'Not Paid', color: '#ff4757' };
        }
    } else {
        return { text: 'Not Paid', color: '#ff4757' };
    }
}

// Update all months status with selected month only
function updateAllMonthsStatus(selectedMonth) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const monthsStatusDiv = row.querySelector('.months-status');
        const pendingStatusDiv = row.querySelector('.pending-status');
        
        // Update months status display
        if (monthsStatusDiv) {
            let displayText = '';
            let color = '#ffa502'; // Default orange for pending
            
            if (selectedMonth) {
                displayText = selectedMonth;
                color = '#2ed573'; // Green for selected
            } else {
                displayText = 'Pending';
                color = '#ffa502'; // Orange for pending
            }
            
            monthsStatusDiv.textContent = displayText;
            monthsStatusDiv.style.color = color;
        }
        
        // Update pending status based on selected month only
        if (pendingStatusDiv) {
            const pendingStatus = calculatePendingStatus(row, selectedMonth);
            pendingStatusDiv.textContent = pendingStatus.text;
            pendingStatusDiv.style.color = pendingStatus.color;
        }
    });
}

// Calculate pending status (Paid/Not Paid/Pending) based on selected month only and end date
function calculatePendingStatus(row, selectedMonth) {
    if (!selectedMonth) {
        return { text: '-', color: '#ffa502' };
    }
    
    const endDateInput = row.querySelector('.end-date-input');
    if (!endDateInput || !endDateInput.value) {
        return { text: 'Pending', color: '#ffa502' };
    }
    
    const endDate = new Date(endDateInput.value);
    const currentDate = new Date();
    
    // Get month number for comparison
    const monthMap = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3,
        'May': 4, 'June': 5, 'July': 6, 'August': 7,
        'September': 8, 'October': 9, 'November': 10, 'December': 11
    };
    
    const selectedMonthNum = monthMap[selectedMonth];
    const endMonthNum = endDate.getMonth();
    const endYearNum = endDate.getFullYear();
    const currentYearNum = currentDate.getFullYear();
    const currentMonthNum = currentDate.getMonth();
    
    // Determine status based on comparison (using current year)
    if (selectedMonthNum < endMonthNum) {
        return { text: 'Paid', color: '#2ed573' };
    } else if (selectedMonthNum === endMonthNum) {
        if (currentMonthNum >= endMonthNum && currentYearNum >= endYearNum) {
            return { text: 'Paid', color: '#2ed573' };
        } else {
            return { text: 'Pending', color: '#ffa502' };
        }
    } else {
        return { text: 'Not Paid', color: '#ff4757' };
    }
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
            sno: row.querySelector('.sno-input')?.value || '',
            efileNo: row.querySelector('.efile-no-input')?.value || '',
            contractor: row.querySelector('.contractor-input')?.value || '',
            startDate: row.querySelector('.start-date-input')?.value || '',
            endDate: row.querySelector('.end-date-input')?.value || '',
            duration: row.querySelector('.duration-input')?.value || '',
            handleBy: row.querySelector('.handle-by-input')?.value || '',
            frequency: row.querySelector('.frequency-select')?.value || ''
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
        
        // Validate data before saving
        if (tableData.length === 0) {
            console.warn('No data to save');
            return;
        }
        
        // Simple direct save like contractorListData
        localStorage.setItem(BILL_TRACKER_DATA_KEY, JSON.stringify(tableData));
        localStorage.setItem(BILL_TRACKER_HISTORY_KEY, JSON.stringify(history));
        localStorage.setItem(BILL_TRACKER_HISTORY_INDEX_KEY, historyIndex.toString());
        
        // Also save to analytics data
        saveToAnalyticsData(tableData);
        
        console.log('Bill tracker data saved to localStorage:', tableData.length, 'records');
        
        // Trigger analytics update if on analytics page
        if (window.location.pathname.includes('analytics.html')) {
            setTimeout(() => {
                if (typeof loadAnalyticsData === 'function') {
                    loadAnalyticsData();
                }
            }, 200);
        }
    } catch (error) {
        console.error('Error saving data to localStorage:', error);
    }
}

function loadDataFromStorage() {
    try {
        // Load from sessionStorage only (temporary storage)
        const savedData = sessionStorage.getItem(BILL_TRACKER_DATA_KEY);
        
        if (savedData) {
            const tableData = JSON.parse(savedData);
            restoreTableFromData(tableData);
            console.log('Bill tracker data loaded from sessionStorage (temporary):', tableData.length, 'records');
        } else {
            console.log('No temporary data found in sessionStorage');
        }
    } catch (error) {
        console.error('Error loading data from sessionStorage:', error);
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
        // Simple save to analytics for charts
        let analyticsData = localStorage.getItem(ANALYTICS_DATA_KEY);
        analyticsData = analyticsData ? JSON.parse(analyticsData) : {};
        
        // Update bill tracker data
        analyticsData.billTracker = {
            data: tableData,
            lastUpdated: new Date().toISOString(),
            count: tableData.length
        };
        
        localStorage.setItem(ANALYTICS_DATA_KEY, JSON.stringify(analyticsData));
        console.log('Bill tracker data saved to analytics:', tableData.length, 'records');
    } catch (error) {
        console.error('Error saving to analytics data:', error);
    }
}

// Live Updates Functions
function setupLiveUpdates() {
    // Save data on any input change with debounce
    document.addEventListener('input', function(e) {
        if (e.target.matches('input, select, textarea')) {
            // Debounce auto-save
            clearTimeout(window.autoSaveTimeout);
            window.autoSaveTimeout = setTimeout(() => {
                saveDataToStorage();
            }, 1000);
        }
    });
    
    // Save data on row deletion
    document.addEventListener('click', function(e) {
        if (e.target.matches('.delete-row-btn')) {
            // Debounce auto-save
            clearTimeout(window.autoSaveTimeout);
            window.autoSaveTimeout = setTimeout(() => {
                saveDataToStorage();
            }, 1000);
        }
    });
    
    // Note: Removed page unload save to keep data temporary
    // Note: Removed periodic save to keep data temporary
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

// Check all durations and update warnings
function checkAllDurations() {
    updateAllDurations();
}

// Update notification badge count (duration <= 60)
function updateNotificationCount() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;

    const count = getWarningCount();

    if (count > 0) {
        badge.textContent = count;
        badge.classList.add('active');
    } else {
        badge.textContent = '0';
        badge.classList.remove('active');
    }
}

// Get count of rows with duration <= 60
function getWarningCount() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return 0;

    let count = 0;
    const rows = tbody.querySelectorAll('tr');
    console.log(`Total rows found: ${rows.length}`);
    
    rows.forEach((row, index) => {
        const startDateInput = row.querySelector('.start-date-input');
        const endDateInput = row.querySelector('.end-date-input');
        const durationCell = row.querySelector('.duration-cell');
        const durationDisplay = row.querySelector('.duration-display');

        // Check for warning class first (most reliable)
        if (durationDisplay && durationDisplay.classList.contains('warning')) {
            console.log(`Row ${index}: Found warning class, count = ${count + 1}`);
            count++;
        } else if (startDateInput && endDateInput && startDateInput.value && endDateInput.value) {
            // Calculate days remaining
            const startDate = new Date(startDateInput.value);
            const endDate = new Date(endDateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to start of day for accurate calculation
            
            if (endDate >= startDate) {
                const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                // Use same logic as duration colors: ≤60 days = warning
                if (diffDays <= 60 && diffDays >= 0) {
                    console.log(`Row ${index}: Calculated ${diffDays} days <= 60, count = ${count + 1}`);
                    count++;
                }
            }
        } else if (durationDisplay && durationDisplay.textContent.includes('days')) {
            // Fallback: parse from text
            const match = durationDisplay.textContent.match(/(\d+)\s*days/);
            if (match) {
                const days = parseInt(match[1], 10);
                if (days <= 60) {
                    console.log(`Row ${index}: Parsed ${days} days <= 60, count = ${count + 1}`);
                    count++;
                }
            }
        } else if (durationDisplay && (durationDisplay.textContent === 'Expired' || durationDisplay.textContent === 'Expires today')) {
            // Count expired and expires today as warnings
            console.log(`Row ${index}: Found expired/expires today, count = ${count + 1}`);
            count++;
        }
    });

    console.log(`Final warning count: ${count}`);
    return count;
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

// Initialize table filters dropdown
function initializeTableFilters() {
    const filterDropdownBtn = document.getElementById('filterDropdownBtn');
    const filterDropdownMenu = document.getElementById('filterDropdownMenu');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    
    // Toggle dropdown
    if (filterDropdownBtn) {
        filterDropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = filterDropdownMenu.classList.contains('show');
            
            // Close any other open dropdowns
            document.querySelectorAll('.filter-dropdown-menu').forEach(menu => {
                if (menu !== filterDropdownMenu) {
                    menu.classList.remove('show');
                }
            });
            
            if (!isOpen) {
                filterDropdownMenu.classList.add('show');
                filterDropdownBtn.classList.add('active');
            } else {
                filterDropdownBtn.classList.remove('active');
            }
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.filter-dropdown-container')) {
            filterDropdownMenu.classList.remove('show');
            filterDropdownBtn.classList.remove('active');
        }
    });
    
    // Apply filters button
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            applyNewFilters();
            filterDropdownMenu.classList.remove('show');
            filterDropdownBtn.classList.remove('active');
        });
    }
    
    // Clear filters button
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            clearNewFilters();
            filterDropdownMenu.classList.remove('show');
            filterDropdownBtn.classList.remove('active');
        });
    }
}

// Apply filters with clean logic - HIDE SELECTED COLUMNS
function applyNewFilters() {
    console.log('=== DEBUGGING FILTER APPLICATION ===');
    
    const selectedColumns = getSelectedColumns();
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    
    console.log('1. Selected columns to HIDE:', selectedColumns);
    console.log('2. Total rows found:', rows.length);
    
    // Get column indices for selected columns
    const columnIndices = getColumnIndices(selectedColumns);
    console.log('3. Column indices to HIDE:', columnIndices);
    
    let visibleRowCount = 0;
    let hiddenRowCount = 0;
    
    rows.forEach((row, index) => {
        console.log(`4. Row ${index}: Processing row`);
        
        // If no columns selected, show all rows with all columns
        if (selectedColumns.length === 0) {
            console.log(`5. Row ${index}: No columns selected - showing all columns`);
            showAllRowCells(row);
            row.style.display = '';
            visibleRowCount++;
            return;
        }
        
        // Show row and hide selected columns
        console.log(`6. Row ${index}: Hiding selected columns`);
        row.style.display = '';
        showAllRowCells(row); // Show all first
        
        // Hide selected columns
        columnIndices.forEach(colIndex => {
            const cells = row.querySelectorAll('td');
            if (cells[colIndex]) {
                cells[colIndex].style.display = 'none';
                console.log(`   Hiding cell ${colIndex} in row ${index}`);
            }
        });
        
        visibleRowCount++;
    });
    
    // Show/hide table headers based on selected columns
    updateTableHeaders(selectedColumns);
    
    console.log('7. Final counts - Visible:', visibleRowCount, 'Hidden:', hiddenRowCount);
    console.log('=== DEBUGGING COMPLETE ===');
    
    // Update status
    updateFilterStatus(selectedColumns.length > 0);
    updateTotalCount();
}

// Helper: Get selected column names
function getSelectedColumns() {
    const selectedColumns = [];
    const allFilterCheckboxes = document.querySelectorAll('.filter-checkbox');
    
    console.log('   getSelectedColumns: Total filter checkboxes found:', allFilterCheckboxes.length);
    
    allFilterCheckboxes.forEach((checkbox, index) => {
        console.log(`   Filter ${index}: ${checkbox.dataset.column} = ${checkbox.checked}`);
        if (checkbox.checked) {
            selectedColumns.push(checkbox.dataset.column);
        }
    });
    
    console.log('   getSelectedColumns: Returning:', selectedColumns);
    return selectedColumns;
}

// Helper: Get column indices (0-based) - BILL TRACKER MAPPING
function getColumnIndices(columnNames) {
    const columnMap = {
        'sno': 0,
        'efile': 1, 
        'contractor': 2,
        'startDate': 3,
        'endDate': 4,
        'duration': 5,
        'handleBy': 6,
        'frequency': 7,
        'months': 8,
        'remarks': 9
    };
    
    return columnNames.map(name => columnMap[name]).filter(index => index !== undefined);
}

// Helper: Show all cells in a row
function showAllRowCells(row) {
    const cells = row.querySelectorAll('td');
    cells.forEach(cell => {
        cell.style.display = '';
    });
}

// Helper: Hide all cells in a row
function hideAllRowCells(row) {
    const cells = row.querySelectorAll('td');
    cells.forEach(cell => {
        cell.style.display = 'none';
    });
}

// Helper: Show selected cells in a row
function showSelectedRowCells(row, columnIndices) {
    const cells = row.querySelectorAll('td');
    console.log(`   showSelectedRowCells: Total cells = ${cells.length}, indices to show = ${columnIndices}`);
    
    // Always show S.NO (index 0) and ACTION (index 10) columns
    if (cells[0]) cells[0].style.display = ''; // S.NO
    if (cells[10]) cells[10].style.display = ''; // ACTION
    
    // Show selected columns
    columnIndices.forEach(index => {
        if (cells[index]) {
            cells[index].style.display = '';
            console.log(`   Showing cell ${index}: ${cells[index].textContent.substring(0, 20)}`);
        } else {
            console.log(`   Cell ${index} not found`);
        }
    });
}

// Show/hide table headers based on selected columns - HIDE SELECTED COLUMNS
function updateTableHeaders(selectedColumns) {
    const table = document.querySelector('.data-table');
    if (!table) return;
    
    const headers = table.querySelectorAll('th');
    const columnMap = {
        'sno': 0,
        'efile': 1, 
        'contractor': 2,
        'startDate': 3,
        'endDate': 4,
        'duration': 5,
        'handleBy': 6,
        'frequency': 7,
        'months': 8,
        'remarks': 9,
        'action': 10
    };
    
    // If no columns selected, show all headers
    if (selectedColumns.length === 0) {
        headers.forEach(header => {
            header.style.display = '';
        });
        return;
    }
    
    // Show all headers first
    headers.forEach(header => {
        header.style.display = '';
    });
    
    // Hide selected column headers
    selectedColumns.forEach(columnName => {
        const index = columnMap[columnName];
        if (index !== undefined && headers[index]) {
            headers[index].style.display = 'none';
            console.log(`   Hiding header ${index} for column ${columnName}`);
        }
    });
    
    // Always show S.NO and ACTION columns for usability
    if (headers[0]) headers[0].style.display = ''; // S.NO
    if (headers[10]) headers[10].style.display = ''; // ACTION
}

// Clear all filters
function clearNewFilters() {
    // Uncheck all filter checkboxes
    const filterCheckboxes = document.querySelectorAll('.filter-checkbox');
    filterCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Show all rows
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        row.style.display = '';
    });
    
    updateFilterStatus(false);
    updateTotalCount();
}

// Helper: Get selected column names
function getSelectedColumns() {
    const selectedColumns = [];
    const allFilterCheckboxes = document.querySelectorAll('.filter-checkbox');
    
    allFilterCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            selectedColumns.push(checkbox.dataset.column);
        }
    });
    
    return selectedColumns;
}

// Update filter status UI
function updateFilterStatus(isFiltered) {
    const filterBtn = document.getElementById('filterDropdownBtn');
    const totalBadge = document.getElementById('totalBadge');
    
    if (isFiltered) {
        filterBtn.classList.add('filtered');
        if (totalBadge) {
            totalBadge.classList.add('filtered');
        }
    } else {
        filterBtn.classList.remove('filtered');
        if (totalBadge) {
            totalBadge.classList.remove('filtered');
        }
    }
}
