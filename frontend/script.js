// Global variables
let rowCounter = 0;
let savedData = [];
const STORAGE_KEY = 'dashboardData';

// Undo/Redo System
let history = [];
let historyIndex = -1;
const MAX_HISTORY_SIZE = 50;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    loadData();
    setupEventListeners();
    updateTotalCount();
    setupMobileMenu();
    setupArrowKeyNavigation(); // Add arrow key navigation

    // Check for duration warnings after data loads
    setTimeout(() => {
        checkAllDurations();
        updateAllDurations(); // Update all durations to show current days left
        startRealTimeDurationUpdates(); // Start real-time updates
    }, 500);
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('addRowBtn').addEventListener('click', addRow);
    document.getElementById('saveBtn').addEventListener('click', saveData);
    document.getElementById('refreshBtn').addEventListener('click', refreshPage);
    document.getElementById('printBtn').addEventListener('click', printTable);
    document.getElementById('exportBtn').addEventListener('click', exportToExcel);
    
    // Undo/Redo buttons
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('redoBtn').addEventListener('click', redo);

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            filterTable(e.target.value);
        });
    }

    // Notification bell button - open notification modal
    const notificationBellBtn = document.getElementById('notificationBellBtn');
    if (notificationBellBtn) {
        notificationBellBtn.addEventListener('click', function () {
            openNotificationModal();
        });
    }

    // Notification close button
    const closeNotificationBtn = document.getElementById('closeNotification');
    if (closeNotificationBtn) {
        closeNotificationBtn.addEventListener('click', closeNotification);
    }

    // Close notification on overlay click
    const notificationModal = document.getElementById('notificationModal');
    if (notificationModal) {
        notificationModal.addEventListener('click', function (e) {
            if (e.target === notificationModal) {
                closeNotification();
            }
        });
    }

    // Close notification on Escape key
    // Close notification on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeNotification();
        }
    });

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

// Mobile menu functionality
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);

    if (mobileMenuToggle && sidebar) {
        // Toggle menu
        mobileMenuToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            sidebar.classList.toggle('mobile-open');
            mobileMenuToggle.classList.toggle('active');
            overlay.classList.toggle('active');

            // Change icon
            const icon = mobileMenuToggle.querySelector('i');
            if (sidebar.classList.contains('mobile-open')) {
                icon.className = 'fas fa-times';
                document.body.style.overflow = 'hidden'; // Prevent background scroll
            } else {
                icon.className = 'fas fa-bars';
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking overlay
        overlay.addEventListener('click', function () {
            sidebar.classList.remove('mobile-open');
            mobileMenuToggle.classList.remove('active');
            overlay.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.className = 'fas fa-bars';
            document.body.style.overflow = '';
        });

        // Close sidebar when clicking a nav item on mobile
        const navItems = sidebar.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function () {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('mobile-open');
                    mobileMenuToggle.classList.remove('active');
                    overlay.classList.remove('active');
                    const icon = mobileMenuToggle.querySelector('i');
                    icon.className = 'fas fa-bars';
                    document.body.style.overflow = '';
                }
            });
        });

        // Handle window resize
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('mobile-open');
                mobileMenuToggle.classList.remove('active');
                overlay.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                icon.className = 'fas fa-bars';
                document.body.style.overflow = '';
            }
        });
    }
}

// Get the current contractor value, preferring the visible element
function getContractorValue(row) {
    const contractorLink = row.querySelector('.contractor-link');
    if (contractorLink && contractorLink.style.display !== 'none' && contractorLink.textContent) {
        return contractorLink.textContent.trim();
    }
    const contractorInput = row.querySelector('.contractor-input');
    return contractorInput ? contractorInput.value.trim() : '';
}

// Add new row to table
function addRow() {
    const tbody = document.getElementById('tableBody');
    const row = document.createElement('tr');
    
    // Calculate the next serial number based on current rows
    const currentRows = tbody.querySelectorAll('tr');
    const nextSerialNumber = currentRows.length + 1;

    row.innerHTML = `
        <td>
            <input type="text" class="sno-input" placeholder="Enter S.No" value="${nextSerialNumber}">
        </td>
        <td>
            <input type="text" class="efile-input" placeholder="Enter E-File">
        </td>
        <td>
            <input type="text" class="contractor-input" placeholder="Enter Contractor">
            <a href="#" class="contractor-link" style="display: none;" target="_blank"></a>
        </td>
        <td>
            <input type="text" class="description-input" placeholder="Enter Description">
        </td>
        <td>
            <input type="text" class="value-input" placeholder="Enter Value">
        </td>
        <td>
            <select class="gst-select">
                <option value="">Select GST</option>
                <option value="with gst">With GST</option>
                <option value="without gst">Without GST</option>
            </select>
        </td>
        <td>
            <input type="date" class="start-date-input">
        </td>
        <td>
            <input type="date" class="end-date-input">
        </td>
        <td class="duration-cell">
            <span class="duration-display">-</span>
        </td>
        <td>
            <input type="file" class="attachment-input" accept="*/*">
            <span class="file-name"></span>
        </td>
        <td>
            <button class="delete-btn" onclick="deleteRow(this)">
                <i class="fas fa-trash"></i> Delete
            </button>
        </td>
    `;

    tbody.appendChild(row);

    // Add event listeners for date calculation
    const startDateInput = row.querySelector('.start-date-input');
    const endDateInput = row.querySelector('.end-date-input');

    startDateInput.addEventListener('change', calculateDuration);
    endDateInput.addEventListener('change', calculateDuration);

    // Add file size validation
    const fileInput = row.querySelector('.attachment-input');
    fileInput.addEventListener('change', function (e) {
        validateFileSize(e.target);
        updateContractorHyperlink(row);
        saveState(); // Save state for undo/redo
    });

    // Setup contractor input listener
    const contractorInput = row.querySelector('.contractor-input');
    contractorInput.addEventListener('input', function () {
        updateContractorHyperlink(row);
        saveState(); // Save state for undo/redo
    });

    // Add input listeners for undo/redo
    const inputs = row.querySelectorAll('input[type="text"], input[type="date"], select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            saveState(); // Save state for undo/redo
        });
        input.addEventListener('change', function() {
            saveState(); // Save state for undo/redo
        });
    });

    updateTotalCount();
    renumberSerialNumbers(); // Ensure all serial numbers are sequential
    saveState(); // Save state for undo/redo
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
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for accurate calculation

        if (endDate >= startDate) {
            const diffTime = endDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                durationDisplay.textContent = 'Expired';
                durationDisplay.classList.remove('duration-safe');
                durationDisplay.classList.add('duration-left');
            } else if (diffDays === 0) {
                durationDisplay.textContent = 'Expires today';
                durationDisplay.classList.remove('duration-safe');
                durationDisplay.classList.add('duration-left');
            } else {
                durationDisplay.textContent = `${diffDays} days left`;
                durationDisplay.classList.remove('duration-left', 'duration-safe');

                // Color coding: red if <= 60 days
                if (diffDays <= 60) {
                    durationDisplay.classList.add('duration-left');
                    // Show notification pop-up
                    showDurationNotification(row, diffDays);
                } else {
                    durationDisplay.classList.add('duration-safe');
                }
            }
        } else {
            durationDisplay.textContent = 'Invalid dates';
            durationDisplay.classList.remove('duration-safe');
            durationDisplay.classList.add('duration-left');
        }
    } else {
        durationDisplay.textContent = '-';
        durationDisplay.classList.remove('duration-left', 'duration-safe');
    }

    // Auto-save after calculation
    saveDataToStorage();
    // Update notification badge
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
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to start of day for accurate calculation

            if (endDate >= startDate) {
                const diffTime = endDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0) {
                    durationDisplay.textContent = 'Expired';
                    durationDisplay.classList.remove('duration-safe');
                    durationDisplay.classList.add('duration-left');
                } else if (diffDays === 0) {
                    durationDisplay.textContent = 'Expires today';
                    durationDisplay.classList.remove('duration-safe');
                    durationDisplay.classList.add('duration-left');
                } else {
                    durationDisplay.textContent = `${diffDays} days left`;
                    durationDisplay.classList.remove('duration-left', 'duration-safe');

                    // Color coding: red if <= 60 days
                    if (diffDays <= 60) {
                        durationDisplay.classList.add('duration-left');
                    } else {
                        durationDisplay.classList.add('duration-safe');
                    }
                }
            } else {
                durationDisplay.textContent = 'Invalid dates';
                durationDisplay.classList.remove('duration-safe');
                durationDisplay.classList.add('duration-left');
            }
        }
    });
    
    // Update notification badge after updating all durations
    updateNotificationCount();
}

// Start real-time duration updates based on current date
function startRealTimeDurationUpdates() {
    let lastUpdateDate = new Date().toDateString(); // Track the last update date
    
    // Create real-time status indicator
    createRealTimeStatusIndicator();
    
    // Function to calculate time until next midnight
    function getTimeUntilMidnight() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.getTime() - now.getTime();
    }
    
    // Function to schedule next update
    function scheduleNextUpdate() {
        const timeUntilMidnight = getTimeUntilMidnight();
        
        // Schedule update for midnight
        setTimeout(() => {
            const currentDate = new Date();
            const currentDateString = currentDate.toDateString();
            
            if (lastUpdateDate !== currentDateString) {
                console.log('Midnight reached, updating durations for new day...');
                lastUpdateDate = currentDateString;
                
                // Update all durations for the new day
                updateAllDurations();
                
                // Check for new warnings
                checkAllDurations();
                
                // Show notification about the update
                showDateChangeNotification();
                
                // Update status indicator
                updateRealTimeStatusIndicator();
            }
            
            // Schedule next midnight check
            scheduleNextUpdate();
        }, timeUntilMidnight);
        
        // Also update every minute for real-time accuracy during the day
        setInterval(() => {
            updateAllDurations();
            updateRealTimeStatusIndicator();
        }, 60000); // Check every minute
    }
    
    // Start the scheduling
    scheduleNextUpdate();
    
    // Initial update
    updateAllDurations();
    updateRealTimeStatusIndicator();
}

// Create real-time status indicator
function createRealTimeStatusIndicator() {
    const header = document.querySelector('.header-left');
    if (!header) return;
    
    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'realTimeStatus';
    statusIndicator.style.cssText = `
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 5px;
    `;
    
    statusIndicator.innerHTML = `
        <i class="fas fa-clock" style="font-size: 10px;"></i>
        <span id="lastUpdateText">Real-time updates active</span>
    `;
    
    header.appendChild(statusIndicator);
}

// Update real-time status indicator
function updateRealTimeStatusIndicator() {
    const statusText = document.getElementById('lastUpdateText');
    if (!statusText) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    
    statusText.textContent = `Last updated: ${timeString}`;
}

// Show subtle notification when date changes and durations are updated
function showDateChangeNotification() {
    // Create a subtle notification that durations have been updated
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #2ecc71, #27ae60);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
        z-index: 10000;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
    `;
    notification.innerHTML = `
        <i class="fas fa-sync-alt" style="margin-right: 8px;"></i>
        Durations updated for new day
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Show notification pop-up for duration <= 60 days
function showDurationNotification(row, days) {
    // Get row data
    const sno = row.querySelector('.sno-input')?.value || '';
    const efile = row.querySelector('.efile-input')?.value || '';
    const contractorInput = row.querySelector('.contractor-input');
    const contractorLink = row.querySelector('.contractor-link');
    const contractor = contractorInput ? contractorInput.value : (contractorLink ? contractorLink.textContent : '');
    const description = row.querySelector('.description-input')?.value || '';
    const value = row.querySelector('.value-input')?.value || '';
    const startDate = row.querySelector('.start-date-input')?.value || '';
    const endDate = row.querySelector('.end-date-input')?.value || '';

    // Create notification item
    const notificationItem = `
        <div class="notification-item">
            <div class="notification-item-title">
                <i class="fas fa-exclamation-circle"></i>
                Warning: Only ${days} days remaining!
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
                    <strong>DESCRIPTION</strong>
                    <span>${description || 'N/A'}</span>
                </div>
                <div>
                    <strong>VALUE</strong>
                    <span>${value || 'N/A'}</span>
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
                    <span style="color: #ff4444; font-weight: bold;">${days} days left</span>
                </div>
            </div>
        </div>
    `;

    // Get or create notification modal
    let modal = document.getElementById('notificationModal');
    if (!modal) {
        // Create modal if it doesn't exist (for dynamic creation)
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
    if (notificationBody) {
        // Check if this notification already exists (avoid duplicates)
        const existingNotifications = notificationBody.querySelectorAll('.notification-item');
        let isDuplicate = false;

        existingNotifications.forEach(item => {
            // Find S.NO in the notification item
            const details = item.querySelectorAll('.notification-item-details div');
            details.forEach(detail => {
                const strong = detail.querySelector('strong');
                if (strong && strong.textContent.trim() === 'S.NO') {
                    const snoText = detail.querySelector('span')?.textContent.trim();
                    if (snoText === sno) {
                        isDuplicate = true;
                    }
                }
            });
        });

        if (!isDuplicate) {
            // Add new notification
            notificationBody.insertAdjacentHTML('afterbegin', notificationItem);
        }

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Open notification modal and show all duration warnings
function openNotificationModal() {
    // Check if we're on contractor list page (has duration column)
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) {
        // Not on contractor list page
        showNotificationMessage('This feature is available on the Contractor List page.');
        return;
    }

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

    // If no warnings found, show empty message
    if (!notificationBody || notificationBody.children.length === 0) {
        if (notificationBody) {
            notificationBody.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-check-circle" style="font-size: 48px; color: #00d4ff; margin-bottom: 15px; display: block;"></i>
                    <p>No duration warnings found!</p>
                    <p style="font-size: 14px; margin-top: 10px; color: rgba(255, 255, 255, 0.5);">All contracts have more than 60 days remaining.</p>
                </div>
            `;
        }
    }

    // Show modal
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Show a simple notification message
function showNotificationMessage(message) {
    let modal = document.getElementById('notificationModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'notification-modal';
        modal.id = 'notificationModal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="notification-content">
            <div class="notification-header">
                <h3><i class="fas fa-info-circle"></i> Information</h3>
                <button class="notification-close" id="closeNotification">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-body">
                <div class="notification-empty">
                    <i class="fas fa-info-circle" style="font-size: 48px; color: #00d4ff; margin-bottom: 15px; display: block;"></i>
                    <p>${message}</p>
                </div>
            </div>
        </div>
    `;

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

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close notification modal
function closeNotification() {
    const modal = document.getElementById('notificationModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
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
    rows.forEach(row => {
        const startDateInput = row.querySelector('.start-date-input');
        const endDateInput = row.querySelector('.end-date-input');
        const durationCell = row.querySelector('.duration-cell');
        const durationDisplay = row.querySelector('.duration-display');

        if (startDateInput && endDateInput && startDateInput.value && endDateInput.value) {
            const startDate = new Date(startDateInput.value);
            const endDate = new Date(endDateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to start of day for accurate calculation
            
            if (endDate >= startDate) {
                const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                if (diffDays <= 60 && diffDays >= 0) {
                    count++;
                }
            }
        } else if (durationCell && durationCell.classList.contains('warning')) {
            // Fallback: use existing warning class
            count++;
        } else if (durationDisplay && durationDisplay.textContent.includes('days')) {
            const match = durationDisplay.textContent.match(/(\d+)\s*days/);
            if (match) {
                const days = parseInt(match[1], 10);
                if (days <= 60) count++;
            }
        }
    });

    return count;
}

// Check all rows on page load for duration warnings
function checkAllDurations(showNotifications = true) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const startDateInput = row.querySelector('.start-date-input');
        const endDateInput = row.querySelector('.end-date-input');
        const durationDisplay = row.querySelector('.duration-display');

        if (startDateInput && endDateInput && startDateInput.value && endDateInput.value) {
            const startDate = new Date(startDateInput.value);
            const endDate = new Date(endDateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to start of day for accurate calculation

            if (endDate >= startDate) {
                const diffTime = endDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 60 && diffDays >= 0 && durationDisplay && showNotifications) {
                    // Show notification for this row only if showNotifications is true
                    showDurationNotification(row, diffDays);
                }
            }
        }
    });
    // Update badge after scanning
    updateNotificationCount();
}

// Validate file size (max 10MB)
function validateFileSize(input) {
    const file = input.files[0];
    const fileNameSpan = input.parentElement.querySelector('.file-name');

    if (file) {
        const fileSizeMB = file.size / (1024 * 1024);

        if (fileSizeMB > 10) {
            alert('File size exceeds 10MB. Please select a smaller file.');
            input.value = '';
            fileNameSpan.textContent = '';
            return false;
        } else {
            fileNameSpan.textContent = file.name;
            fileNameSpan.style.color = '#00d4ff';
            fileNameSpan.style.fontSize = '12px';
            return true;
        }
    }
    return false;
}

// Update contractor cell to show hyperlink when file is attached
function updateContractorHyperlink(row) {
    const contractorInput = row.querySelector('.contractor-input');
    const contractorLink = row.querySelector('.contractor-link');
    const attachmentInput = row.querySelector('.attachment-input');
    const file = attachmentInput?.files[0];

    if (!contractorInput || !contractorLink) return;

    // Get contractor name from input (input is always visible now)
    let contractorName = contractorInput.value.trim();

    // Check if file changed - if so, clean up old URL
    const currentFileName = contractorLink.dataset.fileName;
    if (currentFileName && file && file.name !== currentFileName) {
        if (contractorLink.dataset.objectUrl) {
            URL.revokeObjectURL(contractorLink.dataset.objectUrl);
            delete contractorLink.dataset.objectUrl;
        }
    }

    if (file) {
        // Get or create object URL for the file
        let fileUrl = contractorLink.dataset.objectUrl;
        if (!fileUrl) {
            fileUrl = URL.createObjectURL(file);
            contractorLink.dataset.objectUrl = fileUrl;
            contractorLink.dataset.fileName = file.name;
        }

        contractorLink.href = '#';
        contractorLink.textContent = contractorName || contractorLink.textContent || 'Contractor';
        contractorLink.style.display = contractorName ? 'block' : 'none';
        contractorLink.style.color = '#00d4ff';
        contractorLink.style.textDecoration = 'underline';
        contractorLink.style.cursor = 'pointer';
        contractorLink.style.marginTop = '5px';
        contractorLink.style.fontSize = '12px';
        contractorLink.style.textAlign = 'center';

        // Remove existing click listener if any
        contractorLink.replaceWith(contractorLink.cloneNode(true));
        const newLink = row.querySelector('.contractor-link');

        // Add click handler to open file visually
        newLink.addEventListener('click', function (e) {
            e.preventDefault();
            const currentFileUrl = newLink.dataset.objectUrl;
            if (currentFileUrl) {
                openFileVisually(currentFileUrl, newLink.dataset.fileName, file.type);
            }
        });

        // Always sync link text with input value
        newLink.textContent = contractorName || newLink.textContent || 'Contractor';
        newLink.style.display = contractorName ? 'block' : 'none';

        // Keep input visible
        contractorInput.style.display = '';
    } else {
        contractorLink.style.display = 'none';
        contractorLink.removeAttribute('href');
    }
}

// Convert file to base64 string
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Convert base64 string back to file
function base64ToFile(base64String, fileName) {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
}

// Open file visually in browser (not download)
function openFileVisually(fileUrl, fileName, fileType) {
    // Check if file type can be displayed inline
    const displayableTypes = [
        'application/pdf',
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'text/plain', 'text/html', 'text/css', 'text/javascript',
        'application/json', 'application/xml'
    ];

    const isDisplayable = displayableTypes.some(type => fileType && fileType.includes(type.split('/')[1])) ||
        displayableTypes.includes(fileType);

    if (isDisplayable) {
        // Open in new window/tab for inline viewing
        const newWindow = window.open(fileUrl, '_blank');
        if (!newWindow) {
            alert('Please allow pop-ups to view the file.');
        }
    } else {
        // For other file types, try to open in new window
        const newWindow = window.open(fileUrl, '_blank');
        if (!newWindow) {
            alert('Please allow pop-ups to view the file.');
        }
    }
}

// Renumber serial numbers to be sequential
function renumberSerialNumbers() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach((row, index) => {
        const snoInput = row.querySelector('.sno-input');
        if (snoInput) {
            snoInput.value = index + 1;
        }
    });
    
    updateTotalCount();
    saveDataToStorage();
}

// Delete row
function deleteRow(button) {
    if (confirm('Are you sure you want to delete this row?')) {
        const row = button.closest('tr');
        row.remove();
        renumberSerialNumbers(); // Renumber all serial numbers after deletion
        saveState(); // Save state for undo/redo
    }
}

// Save data
async function saveData() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    savedData = [];

    rows.forEach((row, index) => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const efile = row.querySelector('.efile-input')?.value || '';
        let contractor = '';
        const contractorInput = row.querySelector('.contractor-input');
        const contractorLink = row.querySelector('.contractor-link');

        if (contractorInput) {
            contractor = contractorInput.value || '';
        } else if (contractorLink) {
            contractor = contractorLink.textContent || '';
        }

        const description = row.querySelector('.description-input')?.value || '';
        const gst = row.querySelector('.gst-select')?.value || '';
        const value = row.querySelector('.value-input')?.value || '';
        const startDate = row.querySelector('.start-date-input')?.value || '';
        const endDate = row.querySelector('.end-date-input')?.value || '';
        const attachmentInput = row.querySelector('.attachment-input');
        const file = attachmentInput?.files[0];

        // Update contractor hyperlink if needed
        updateContractorHyperlink(row);

        // Store data
        const rowData = {
            sno,
            efile,
            contractor,
            description,
            gst,
            value,
            startDate,
            endDate,
            duration: row.querySelector('.duration-display')?.textContent || '-',
            fileName: file ? file.name : '',
            fileSize: file ? file.size : 0
        };

        savedData.push(rowData);
    });

    // Save to API or localStorage
    try {
        await saveDataToStorage();
        alert('Data saved successfully!');
    } catch (error) {
        alert('Error saving data. Please try again.');
        console.error('Save error:', error);
    }
}

// Save data to API (with localStorage fallback)
async function saveDataToStorage() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    const dataToSave = [];

    for (const row of rows) {
        const sno = row.querySelector('.sno-input')?.value || '';
        const efile = row.querySelector('.efile-input')?.value || '';
        const contractorInput = row.querySelector('.contractor-input');
        const contractorLink = row.querySelector('.contractor-link');
        const contractor = contractorInput && contractorInput.style.display !== 'none'
            ? contractorInput.value
            : (contractorLink?.textContent || '');
        const description = row.querySelector('.description-input')?.value || '';
        const gst = row.querySelector('.gst-select')?.value || '';
        const value = row.querySelector('.value-input')?.value || '';
        const startDate = row.querySelector('.start-date-input')?.value || '';
        const endDate = row.querySelector('.end-date-input')?.value || '';
        const duration = row.querySelector('.duration-display')?.textContent || '-';
        const attachmentInput = row.querySelector('.attachment-input');
        const file = attachmentInput?.files[0];

        let fileBase64 = '';
        let fileName = '';
        let fileType = '';

        if (file) {
            fileName = file.name;
            fileType = file.type;
            try {
                fileBase64 = await fileToBase64(file);
            } catch (error) {
                console.error('Error converting file to base64:', error);
            }
        }

        dataToSave.push({
            sno,
            efile,
            contractor,
            description,
            gst,
            value,
            startDate,
            endDate,
            duration,
            fileName,
            fileBase64,
            fileType
        });
    }

    // Try to save to API, fallback to localStorage
    try {
        if (typeof contractorListAPI !== 'undefined') {
            await contractorListAPI.save(dataToSave);
            console.log('Data saved to API successfully');
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
            console.log('Data saved to localStorage (API not available)');
        }
    } catch (error) {
        console.error('Failed to save to API, using localStorage:', error);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
}

// Load data from API (with localStorage fallback)
async function loadData() {
    let data = [];

    // Try to load from API first
    try {
        if (typeof contractorListAPI !== 'undefined') {
            data = await contractorListAPI.load();
            console.log('Data loaded from API successfully');
        } else {
            // Fallback to localStorage if API is not available
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                data = JSON.parse(savedData);
                console.log('Data loaded from localStorage (API not available)');
            }
        }
    } catch (error) {
        console.error('Failed to load from API, trying localStorage:', error);
        // Fallback to localStorage
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                data = JSON.parse(savedData);
                console.log('Data loaded from localStorage fallback');
            } catch (parseError) {
                console.error('Error parsing localStorage data:', parseError);
            }
        }
    }

    if (data && data.length > 0) {
        try {
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = '';

            data.forEach((rowData, index) => {
                const row = document.createElement('tr');
                // Map database field names to frontend field names
                const snoValue = rowData.sno || rowData.SNO || (index + 1);
                rowCounter = Math.max(rowCounter, parseInt(snoValue) || index + 1);

                // Extract days from duration string for color coding
                let isWarning = false;
                const duration = rowData.duration || rowData.DURATION || '';
                if (duration && duration.includes('days')) {
                    const daysMatch = duration.match(/(\d+)\s*days/);
                    if (daysMatch) {
                        const days = parseInt(daysMatch[1]);
                        isWarning = days <= 60;
                    }
                }

                // Create contractor cell with both input and link
                const contractorValue = rowData.contractor || rowData.CONTRACTOR || '';
                const fileName = rowData.fileName || rowData.file_name || rowData.FILE_NAME || '';
                const fileBase64 = rowData.fileBase64 || rowData.file_base64 || rowData.FILE_BASE64 || '';
                const hasFile = fileName && fileBase64;

                row.innerHTML = `
                    <td>
                        <input type="text" class="sno-input" placeholder="Enter S.No" value="${snoValue}">
                    </td>
                    <td>
                        <input type="text" class="efile-input" placeholder="Enter E-File" value="${rowData.efile || rowData.EFILE || ''}">
                    </td>
                    <td>
                        <input type="text" class="contractor-input" placeholder="Enter Contractor" value="${contractorValue}">
                        <a href="#" class="contractor-link" ${hasFile ? 'style="display: block; color: #00d4ff; text-decoration: underline; cursor: pointer; margin-top: 5px; font-size: 12px; text-align: center;"' : 'style="display: none;"'}">${contractorValue}</a>
                    </td>
                    <td>
                        <input type="text" class="description-input" placeholder="Enter Description" value="${rowData.description || rowData.DESCRIPTION || ''}">
                    </td>
                    <td>
                        <input type="text" class="value-input" placeholder="Enter Value" value="${rowData.value || rowData.VALUE || ''}">
                    </td>
                    <td>
                        <select class="gst-select">
                            <option value="">Select GST</option>
                            <option value="with gst" ${rowData.gst === 'with gst' ? 'selected' : ''}>With GST</option>
                            <option value="without gst" ${rowData.gst === 'without gst' ? 'selected' : ''}>Without GST</option>
                        </select>
                    </td>
                    <td>
                        <input type="date" class="start-date-input" value="${rowData.startDate || rowData.start_date || rowData.START_DATE || ''}">
                    </td>
                    <td>
                        <input type="date" class="end-date-input" value="${rowData.endDate || rowData.end_date || rowData.END_DATE || ''}">
                    </td>
                    <td class="duration-cell">
                        <span class="duration-display ${isWarning ? 'duration-left' : 'duration-safe'}">${duration || '-'}</span>
                    </td>
                    <td>
                        <input type="file" class="attachment-input" accept="*/*">
                        <span class="file-name" style="color: #00d4ff; font-size: 12px;">${fileName}</span>
                    </td>
                    <td>
                        <button class="delete-btn" onclick="deleteRow(this)">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                `;

                tbody.appendChild(row);

                // Restore file if it exists
                if (hasFile && fileBase64) {
                    try {
                        const file = base64ToFile(fileBase64, fileName);
                        const fileInput = row.querySelector('.attachment-input');
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);
                        fileInput.files = dataTransfer.files;

                        // Update contractor link
                        const contractorLink = row.querySelector('.contractor-link');
                        const fileUrl = URL.createObjectURL(file);
                        contractorLink.href = '#';
                        contractorLink.dataset.objectUrl = fileUrl;
                        contractorLink.dataset.fileName = file.name;

                        // Remove existing click listener if any
                        contractorLink.replaceWith(contractorLink.cloneNode(true));
                        const newLink = row.querySelector('.contractor-link');

                        // Add click handler to open file visually
                        newLink.addEventListener('click', function (e) {
                            e.preventDefault();
                            openFileVisually(fileUrl, file.name, file.type);
                        });
                    } catch (error) {
                        console.error('Error restoring file:', error);
                    }
                }

                // Add event listeners
                const startDateInput = row.querySelector('.start-date-input');
                const endDateInput = row.querySelector('.end-date-input');

                if (startDateInput && endDateInput) {
                    startDateInput.addEventListener('change', calculateDuration);
                    endDateInput.addEventListener('change', calculateDuration);
                }

                const fileInput = row.querySelector('.attachment-input');
                const contractorInput = row.querySelector('.contractor-input');

                if (fileInput) {
                    fileInput.addEventListener('change', function (e) {
                        validateFileSize(e.target);
                        updateContractorHyperlink(row);
                    });
                }

                if (contractorInput) {
                    contractorInput.addEventListener('input', function () {
                        updateContractorHyperlink(row);
                    });
                }
            });

            updateTotalCount();
            renumberSerialNumbers(); // Ensure serial numbers are sequential after loading
            saveState(); // Initialize history with loaded data

            // Check for duration warnings after loading
            setTimeout(() => {
                checkAllDurations();
            }, 300);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
}

// Refresh page (data persists due to localStorage)
function refreshPage() {
    // Clear search and reload
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    location.reload();
}

// Print table
function printTable() {
    // Create a new window with formatted table
    const printWindow = window.open('', '_blank');
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');

    if (rows.length === 0) {
        alert('No data to print!');
        return;
    }

    let tableHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Contractor List - Print</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }
                h1 {
                    text-align: center;
                    color: #333;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #333;
                    padding: 10px;
                    text-align: left;
                }
                th {
                    background-color: #7b2cbf;
                    color: white;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
                .warning {
                    color: #ff0000;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <h1>Contractor List</h1>
            <table>
                <thead>
                    <tr>
                        <th>S.NO</th>
                        <th>E-FILE</th>
                        <th>CONTRACTOR</th>
                        <th>DESCRIPTION</th>
                        <th>GST</th>
                        <th>VALUE</th>
                        <th>START DATE</th>
                        <th>END DATE</th>
                        <th>DURATION (DAYS)</th>
                        <th>ATTACHMENT</th>
                    </tr>
                </thead>
                <tbody>
    `;

    rows.forEach(row => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const efile = row.querySelector('.efile-input')?.value || '';
        const contractorInput = row.querySelector('.contractor-input');
        const contractorLink = row.querySelector('.contractor-link');
        const contractor = contractorInput ? contractorInput.value : (contractorLink ? contractorLink.textContent : '');
        const description = row.querySelector('.description-input')?.value || '';
        const gst = row.querySelector('.gst-select')?.value || '';
        const value = row.querySelector('.value-input')?.value || '';
        const startDate = row.querySelector('.start-date-input')?.value || '';
        const endDate = row.querySelector('.end-date-input')?.value || '';
        const duration = row.querySelector('.duration-display')?.textContent || '-';
        const fileName = row.querySelector('.file-name')?.textContent.trim() || '';
        const isWarning = row.querySelector('.duration-cell')?.classList.contains('warning');

        tableHTML += `
            <tr>
                <td>${sno}</td>
                <td>${efile}</td>
                <td>${contractor}</td>
                <td>${description}</td>
                <td>${gst}</td>
                <td>${value}</td>
                <td>${startDate}</td>
                <td>${endDate}</td>
                <td class="${isWarning ? 'warning' : ''}">${duration}</td>
                <td>${fileName}</td>
            </tr>
        `;
    });

    tableHTML += `
                </tbody>
            </table>
        </body>
        </html>
    `;

    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 250);
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
        'E-File',
        'Contractor',
        'Description',
        'GST',
        'Value',
        'Start Date',
        'End Date',
        'Duration (Days)',
        'Attachment File Name'
    ]);

    // Add rows
    rows.forEach(row => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const efile = row.querySelector('.efile-input')?.value || '';
        const contractorInput = row.querySelector('.contractor-input');
        const contractorLink = row.querySelector('.contractor-link');
        const contractor = contractorInput ? contractorInput.value : (contractorLink ? contractorLink.textContent.trim() : '');
        const description = row.querySelector('.description-input')?.value || '';
        const gst = row.querySelector('.gst-select')?.value || '';
        const value = row.querySelector('.value-input')?.value || '';
        const startDate = row.querySelector('.start-date-input')?.value || '';
        const endDate = row.querySelector('.end-date-input')?.value || '';
        const duration = row.querySelector('.duration-display')?.textContent || '-';
        const fileName = row.querySelector('.file-name')?.textContent.trim() || '';

        exportData.push([
            sno,
            efile,
            contractor,
            description,
            gst,
            value,
            startDate,
            endDate,
            duration,
            fileName
        ]);
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(exportData);

    // Set column widths
    ws['!cols'] = [
        { wch: 10 }, // S.NO
        { wch: 20 }, // E-File
        { wch: 25 }, // Contractor
        { wch: 30 }, // Description
        { wch: 15 }, // GST
        { wch: 15 }, // Value
        { wch: 15 }, // Start Date
        { wch: 15 }, // End Date
        { wch: 20 }, // Duration
        { wch: 30 }  // Attachment
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Data Table');

    // Generate filename with timestamp
    const filename = `dashboard_export_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
}

// Update total count
function updateTotalCount() {
    const tbody = document.getElementById('tableBody');
    const rowCount = tbody.querySelectorAll('tr').length;
    document.getElementById('totalBadge').textContent = `Total: ${rowCount}`;
}

// Filter table based on search query
function filterTable(searchQuery) {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    const query = searchQuery.toLowerCase().trim();
    let visibleCount = 0;

    if (query === '') {
        // Show all rows if search is empty
        rows.forEach(row => {
            row.style.display = '';
        });
        updateTotalCount();
        // Remove "no results" message if exists
        const noResultsMsg = tbody.querySelector('.no-results-row');
        if (noResultsMsg) {
            noResultsMsg.remove();
        }
        return;
    }

    rows.forEach(row => {
        // Skip the no-results row
        if (row.classList.contains('no-results-row')) {
            return;
        }

        // Get all text content from the row
        const sno = row.querySelector('.sno-input')?.value.toLowerCase() || '';
        const efile = row.querySelector('.efile-input')?.value.toLowerCase() || '';
        const contractorInput = row.querySelector('.contractor-input');
        const contractorLink = row.querySelector('.contractor-link');
        const contractor = (contractorInput ? contractorInput.value : (contractorLink ? contractorLink.textContent : '')).toLowerCase();
        const description = row.querySelector('.description-input')?.value.toLowerCase() || '';
        const gst = row.querySelector('.gst-select')?.value.toLowerCase() || '';
        const value = row.querySelector('.value-input')?.value.toLowerCase() || '';
        const startDate = row.querySelector('.start-date-input')?.value.toLowerCase() || '';
        const endDate = row.querySelector('.end-date-input')?.value.toLowerCase() || '';
        const duration = row.querySelector('.duration-display')?.textContent.toLowerCase() || '';

        // Check if any field matches the search query
        const matches = sno.includes(query) ||
            efile.includes(query) ||
            contractor.includes(query) ||
            description.includes(query) ||
            gst.includes(query) ||
            value.includes(query) ||
            startDate.includes(query) ||
            endDate.includes(query) ||
            duration.includes(query);

        if (matches) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    // Remove existing "no results" message
    const existingNoResults = tbody.querySelector('.no-results-row');
    if (existingNoResults) {
        existingNoResults.remove();
    }

    // Show "no results" message if no rows are visible
    if (visibleCount === 0) {
        const noResultsRow = document.createElement('tr');
        noResultsRow.className = 'no-results-row';
        noResultsRow.innerHTML = `
            <td colspan="11" style="text-align: center; padding: 40px; font-size: 18px; color: rgba(255, 255, 255, 0.6);">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                No results found
            </td>
        `;
        tbody.appendChild(noResultsRow);
    }

    // Update total count badge to show filtered count
    document.getElementById('totalBadge').textContent = `Total: ${visibleCount}`;
}

// Auto-save on input change (optional - saves to localStorage)
document.addEventListener('input', function (e) {
    if (e.target.matches('.sno-input, .efile-input, .contractor-input, .description-input, .value-input, .start-date-input, .end-date-input')) {
        // Debounce auto-save
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(() => {
            saveDataToStorage();
        }, 1000);
    }
});

// Auto-save on file change
document.addEventListener('change', function (e) {
    if (e.target.matches('.attachment-input')) {
        // Debounce auto-save
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(() => {
            saveDataToStorage();
        }, 1000);
    }
});

// Arrow Key Navigation Function
function setupArrowKeyNavigation() {
    document.addEventListener('keydown', function (e) {
        // Only handle arrow keys when focus is on an input/select element
        if (!['input', 'select'].includes(e.target.tagName.toLowerCase())) {
            return;
        }

        // Handle Enter key in S.NO field to add new row
        if (e.key === 'Enter' && e.target.classList.contains('sno-input')) {
            e.preventDefault();
            addRow(); // Call the addRow function
            return;
        }

        // Get all focusable elements in the table
        const focusableElements = document.querySelectorAll('.data-table input, .data-table select');
        const currentIndex = Array.from(focusableElements).indexOf(e.target);

        if (currentIndex === -1) return;

        let nextIndex = -1;

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                // Move to same column in previous row
                const currentCell = e.target.closest('td');
                const currentRow = e.target.closest('tr');
                const previousRow = currentRow.previousElementSibling;
                if (previousRow && currentCell) {
                    const columnIndex = Array.from(currentRow.cells).indexOf(currentCell);
                    const targetCell = previousRow.cells[columnIndex];
                    if (targetCell) {
                        const targetInput = targetCell.querySelector('input, select');
                        if (targetInput) {
                            targetInput.focus();
                            if (targetInput.select) targetInput.select();
                        }
                    }
                }
                break;

            case 'ArrowDown':
                e.preventDefault();
                // Move to same column in next row
                const currentCellDown = e.target.closest('td');
                const currentRowDown = e.target.closest('tr');
                const nextRow = currentRowDown.nextElementSibling;
                if (nextRow && currentCellDown) {
                    const columnIndex = Array.from(currentRowDown.cells).indexOf(currentCellDown);
                    const targetCell = nextRow.cells[columnIndex];
                    if (targetCell) {
                        const targetInput = targetCell.querySelector('input, select');
                        if (targetInput) {
                            targetInput.focus();
                            if (targetInput.select) targetInput.select();
                        }
                    }
                }
                break;

            case 'ArrowLeft':
                e.preventDefault();
                // Move to previous focusable element
                if (currentIndex > 0) {
                    nextIndex = currentIndex - 1;
                    focusableElements[nextIndex].focus();
                    if (focusableElements[nextIndex].select) focusableElements[nextIndex].select();
                }
                break;

            case 'ArrowRight':
                e.preventDefault();
                // Move to next focusable element
                if (currentIndex < focusableElements.length - 1) {
                    nextIndex = currentIndex + 1;
                    focusableElements[nextIndex].focus();
                    if (focusableElements[nextIndex].select) focusableElements[nextIndex].select();
                }
                break;
        }
    });
}

// Undo/Redo System Functions

// Save current state to history
function saveState() {
    const currentState = getTableData();
    
    // Remove any states after current index (for new actions)
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
            description: row.querySelector('.description-input').value,
            value: row.querySelector('.value-input').value,
            gst: row.querySelector('.gst-select').value,
            startDate: row.querySelector('.start-date-input').value,
            endDate: row.querySelector('.end-date-input').value,
            attachment: row.querySelector('.attachment-input').files[0]?.name || ''
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
                <input type="text" class="efile-input" placeholder="Enter E-File" value="${rowData.efile}">
            </td>
            <td>
                <input type="text" class="contractor-input" placeholder="Enter Contractor" value="${rowData.contractor}">
            </td>
            <td>
                <input type="text" class="description-input" placeholder="Enter Description" value="${rowData.description}">
            </td>
            <td>
                <input type="text" class="value-input" placeholder="Enter Value" value="${rowData.value}">
            </td>
            <td>
                <select class="gst-select">
                    <option value="">Select GST</option>
                    <option value="0%" ${rowData.gst === '0%' ? 'selected' : ''}>0%</option>
                    <option value="5%" ${rowData.gst === '5%' ? 'selected' : ''}>5%</option>
                    <option value="12%" ${rowData.gst === '12%' ? 'selected' : ''}>12%</option>
                    <option value="18%" ${rowData.gst === '18%' ? 'selected' : ''}>18%</option>
                    <option value="28%" ${rowData.gst === '28%' ? 'selected' : ''}>28%</option>
                </select>
            </td>
            <td>
                <input type="date" class="start-date-input" value="${rowData.startDate}">
            </td>
            <td>
                <input type="date" class="end-date-input" value="${rowData.endDate}">
            </td>
            <td>
                <span class="duration-display"></span>
            </td>
            <td>
                <input type="file" class="attachment-input" accept=".pdf,.doc,.docx,.xls,.xlsx">
                ${rowData.attachment ? `<span class="attachment-name">${rowData.attachment}</span>` : ''}
            </td>
            <td>
                <button class="delete-btn" onclick="deleteRow(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    updateTotalCount();
    updateAllDurations();
    // Skip duration notifications for undo/redo to avoid disturbance
    checkAllDurations(false);
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
    
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= history.length - 1;
}

// Add keyboard shortcuts for undo/redo
document.addEventListener('keydown', function (e) {
    // Ctrl+Z for undo
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
    }
    
    // Ctrl+Y or Ctrl+Shift+Z for redo
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
    }
});

