// Global variables
let rowCounter = 0;
let savedData = [];
const STORAGE_KEY = 'epbgData';

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
    setupKeyboardShortcuts(); // Add keyboard shortcuts
    setupArrowKeyNavigation(); // Add arrow key navigation
});

// Setup keyboard shortcuts for Ctrl+Z and Ctrl+Y
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl+Z for undo
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undo();
            return;
        }
        
        // Ctrl+Y for redo
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            redo();
            return;
        }
        
        // Also support Ctrl+Shift+Z for redo (alternative)
        if (e.ctrlKey && e.shiftKey && e.key === 'z') {
            e.preventDefault();
            redo();
            return;
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('addRowBtn').addEventListener('click', addRow);
    document.getElementById('importBtn').addEventListener('click', importFromExcel);
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

// Mobile menu functionality (reused pattern)
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');

    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);

    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            sidebar.classList.toggle('mobile-open');
            mobileMenuToggle.classList.toggle('active');
            overlay.classList.toggle('active');

            const icon = mobileMenuToggle.querySelector('i');
            if (sidebar.classList.contains('mobile-open')) {
                icon.className = 'fas fa-times';
                document.body.style.overflow = 'hidden';
            } else {
                icon.className = 'fas fa-bars';
                document.body.style.overflow = '';
            }
        });

        overlay.addEventListener('click', function () {
            sidebar.classList.remove('mobile-open');
            mobileMenuToggle.classList.remove('active');
            overlay.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.className = 'fas fa-bars';
            document.body.style.overflow = '';
        });

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
            <input type="text" class="contractor-input" placeholder="Enter Contractor Name">
            <a href="#" class="contractor-link" style="display: none;" target="_blank"></a>
        </td>
        <td>
            <input type="text" class="po-no-input" placeholder="Enter P.O No">
        </td>
        <td>
            <input type="text" class="bg-no-input" placeholder="Enter BG No">
            <a href="#" class="bg-link" style="display: none;" target="_blank"></a>
        </td>
        <td>
            <input type="date" class="bg-date-input">
        </td>
        <td>
            <input type="text" class="bg-amount-input" placeholder="Enter BG Amount">
        </td>
        <td>
            <input type="text" class="bg-validity-input" placeholder="Enter BG Validity">
        </td>
        <td>
            <input type="text" class="gem-bid-input" placeholder="Enter GeM Bid No">
        </td>
        <td>
            <input type="text" class="ref-efile-input" placeholder="Enter Ref Efile No">
        </td>
        <td>
            <input type="file" class="attachment-input" accept="*/*">
            <span class="file-name"></span>
        </td>
        <td>
            <input type="file" class="bg-no-attachment-input" accept="*/*">
            <span class="bg-no-file-name"></span>
        </td>
        <td>
            <button class="delete-btn" onclick="deleteRow(this)">
                <i class="fas fa-trash"></i> Delete
            </button>
        </td>
    `;

    tbody.appendChild(row);

    const fileInput = row.querySelector('.attachment-input');
    const bgNoFileInput = row.querySelector('.bg-no-attachment-input');
    
    fileInput.addEventListener('change', function (e) {
        validateFileSize(e.target);
        updateContractorHyperlink(row);
        updateBgHyperlink(row);
        saveState(); // Save state for undo/redo
    });

    bgNoFileInput.addEventListener('change', function (e) {
        validateBgNoFileSize(e.target);
        updateBgHyperlink(row);
        saveState(); // Save state for undo/redo
    });

    // Setup contractor input listener
    const contractorInput = row.querySelector('.contractor-input');
    contractorInput.addEventListener('input', function () {
        updateContractorHyperlink(row);
        saveState(); // Save state for undo/redo
    });

    // Setup BG NO input listener
    const bgInput = row.querySelector('.bg-no-input');
    bgInput.addEventListener('input', function () {
        updateBgHyperlink(row);
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

// Validate BG NO attachment file size (max 10MB)
function validateBgNoFileSize(input) {
    const file = input.files[0];
    const fileNameSpan = input.parentElement.querySelector('.bg-no-file-name');

    if (file) {
        const fileSizeMB = file.size / (1024 * 1024);

        if (fileSizeMB > 10) {
            alert('BG NO attachment file size exceeds 10MB. Please select a smaller file.');
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

// Update BG No hyperlink based on BG No and BG NO attachment (dynamic update)
function updateBgHyperlink(row) {
    const bgInput = row.querySelector('.bg-no-input');
    const bgLink = row.querySelector('.bg-link');
    const bgNoAttachmentInput = row.querySelector('.bg-no-attachment-input');
    const bgNoFile = bgNoAttachmentInput?.files[0];

    if (!bgInput || !bgLink) return;

    // Get BG NO from input (input is always visible now)
    let bgNo = bgInput.value.trim();

    // Check if BG NO attachment file changed - if so, clean up old URL
    const currentFileName = bgLink.dataset.fileName;
    if (currentFileName && bgNoFile && bgNoFile.name !== currentFileName) {
        if (bgLink.dataset.objectUrl) {
            URL.revokeObjectURL(bgLink.dataset.objectUrl);
            delete bgLink.dataset.objectUrl;
        }
    }

    if (bgNoFile) {
        // Get or create object URL for the BG NO attachment file
        let fileUrl = bgLink.dataset.objectUrl;
        if (!fileUrl) {
            fileUrl = URL.createObjectURL(bgNoFile);
            bgLink.dataset.objectUrl = fileUrl;
            bgLink.dataset.fileName = bgNoFile.name;
        }

        bgLink.href = '#';
        bgLink.textContent = bgNo || bgLink.textContent || 'BG NO';
        bgLink.style.display = bgNo ? 'block' : 'none';
        bgLink.style.color = '#00d4ff';
        bgLink.style.textDecoration = 'underline';
        bgLink.style.cursor = 'pointer';
        bgLink.style.marginTop = '5px';
        bgLink.style.fontSize = '12px';
        bgLink.style.textAlign = 'center';

        // Remove existing click listener if any
        bgLink.replaceWith(bgLink.cloneNode(true));
        const newLink = row.querySelector('.bg-link');

        // Add click handler to open BG NO attachment file visually
        newLink.addEventListener('click', function (e) {
            e.preventDefault();
            const currentFileUrl = newLink.dataset.objectUrl;
            if (currentFileUrl) {
                openFileVisually(currentFileUrl, newLink.dataset.fileName, bgNoFile.type);
            }
        });

        // Always sync link text with input value
        newLink.textContent = bgNo || newLink.textContent || 'BG NO';
        newLink.style.display = bgNo ? 'block' : 'none';

        // Keep input visible
        bgInput.style.display = '';
    } else {
        bgLink.style.display = 'none';
        bgLink.removeAttribute('href');
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

// Convert base64 string back to File
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

// Save data (and update BG link after Save button click)
async function saveData() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    savedData = [];

    rows.forEach(row => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const contractorInput = row.querySelector('.contractor-input');
        const contractorLink = row.querySelector('.contractor-link');
        const contractor = contractorInput && contractorInput.style.display !== 'none'
            ? contractorInput.value
            : (contractorLink?.textContent || '');
        const poNo = row.querySelector('.po-no-input')?.value || '';
        const bgInput = row.querySelector('.bg-no-input');
        const bgLink = row.querySelector('.bg-link');
        let bgNo = '';
        if (bgInput && bgInput.style.display !== 'none') {
            bgNo = bgInput.value || '';
        } else if (bgLink) {
            bgNo = bgLink.textContent || '';
        }
        const bgDate = row.querySelector('.bg-date-input')?.value || '';
        const bgAmount = row.querySelector('.bg-amount-input')?.value || '';
        const bgValidity = row.querySelector('.bg-validity-input')?.value || '';
        const gemBid = row.querySelector('.gem-bid-input')?.value || '';
        const refEfile = row.querySelector('.ref-efile-input')?.value || '';
        const attachmentInput = row.querySelector('.attachment-input');
        const file = attachmentInput?.files[0];

        // Update contractor and BG No hyperlinks on Save
        updateContractorHyperlink(row);
        updateBgHyperlink(row);

        const rowData = {
            sno,
            contractor,
            poNo,
            bgNo,
            bgDate,
            bgAmount,
            bgValidity,
            gemBid,
            refEfile,
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
        const contractorInput = row.querySelector('.contractor-input');
        const contractorLink = row.querySelector('.contractor-link');
        const contractor = contractorInput && contractorInput.style.display !== 'none'
            ? contractorInput.value
            : (contractorLink?.textContent || '');
        const poNo = row.querySelector('.po-no-input')?.value || '';
        const bgInput = row.querySelector('.bg-no-input');
        const bgLink = row.querySelector('.bg-link');
        const bgNo = bgInput && bgInput.style.display !== 'none'
            ? bgInput.value
            : (bgLink?.textContent || '');
        const bgDate = row.querySelector('.bg-date-input')?.value || '';
        const bgAmount = row.querySelector('.bg-amount-input')?.value || '';
        const bgValidity = row.querySelector('.bg-validity-input')?.value || '';
        const gemBid = row.querySelector('.gem-bid-input')?.value || '';
        const refEfile = row.querySelector('.ref-efile-input')?.value || '';
        const attachmentInput = row.querySelector('.attachment-input');
        const bgNoAttachmentInput = row.querySelector('.bg-no-attachment-input');
        const file = attachmentInput?.files[0];
        const bgNoFile = bgNoAttachmentInput?.files[0];

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

        let bgNoAttachmentBase64 = '';
        let bgNoAttachmentName = '';
        let bgNoAttachmentType = '';

        if (bgNoFile) {
            bgNoAttachmentName = bgNoFile.name;
            bgNoAttachmentType = bgNoFile.type;
            try {
                bgNoAttachmentBase64 = await fileToBase64(bgNoFile);
            } catch (error) {
                console.error('Error converting BG NO attachment file to base64:', error);
            }
        }

        dataToSave.push({
            sno,
            contractor,
            poNo,
            bgNo,
            bgDate,
            bgAmount,
            bgValidity,
            gemBid,
            refEfile,
            fileName,
            fileBase64,
            fileType,
            bgNoAttachmentName,
            bgNoAttachmentBase64,
            bgNoAttachmentType
        });
    }

    // Try to save to API, fallback to localStorage
    try {
        if (typeof epbgAPI !== 'undefined') {
            await epbgAPI.save(dataToSave);
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
        if (typeof epbgAPI !== 'undefined') {
            data = await epbgAPI.load();
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

                const contractorValue = rowData.contractor || rowData.CONTRACTOR || '';
                const fileName = rowData.fileName || rowData.file_name || rowData.FILE_NAME || '';
                const fileBase64 = rowData.fileBase64 || rowData.file_base64 || rowData.FILE_BASE64 || '';
                const hasFile = fileName && fileBase64;
                const bgValue = rowData.bgNo || rowData.bg_no || rowData.BG_NO || '';
                const bgNoAttachmentName = rowData.bgNoAttachmentName || rowData.bg_no_attachment_name || rowData.BG_NO_ATTACHMENT_NAME || '';
                const bgNoAttachmentBase64 = rowData.bgNoAttachmentBase64 || rowData.bg_no_attachment_base64 || rowData.BG_NO_ATTACHMENT_BASE64 || '';
                const hasBgNoFile = bgNoAttachmentName && bgNoAttachmentBase64;

                row.innerHTML = `
                    <td>
                        <input type="text" class="sno-input" placeholder="Enter S.No" value="${snoValue}">
                    </td>
                    <td>
                        <input type="text" class="contractor-input" placeholder="Enter Contractor Name" value="${contractorValue}">
                        <a href="#" class="contractor-link" ${hasFile ? 'style="display: block; color: #00d4ff; text-decoration: underline; cursor: pointer; margin-top: 5px; font-size: 12px; text-align: center;"' : 'style="display: none;"'}">${contractorValue}</a>
                    </td>
                    <td>
                        <input type="text" class="po-no-input" placeholder="Enter P.O No" value="${rowData.poNo || rowData.po_no || rowData.PO_NO || ''}">
                    </td>
                    <td>
                        <input type="text" class="bg-no-input" placeholder="Enter BG No" value="${bgValue}" ${hasBgNoFile ? 'style="display: none;"' : ''}>
                        <a href="#" class="bg-link" ${hasBgNoFile ? 'style="display: inline-block; color: #00d4ff; text-decoration: underline; cursor: pointer;"' : 'style="display: none;"'}">${bgValue}</a>
                    </td>
                    <td>
                        <input type="date" class="bg-date-input" value="${rowData.bgDate || rowData.bg_date || rowData.BG_DATE || ''}">
                    </td>
                    <td>
                        <input type="text" class="bg-amount-input" placeholder="Enter BG Amount" value="${rowData.bgAmount || rowData.bg_amount || rowData.BG_AMOUNT || ''}">
                    </td>
                    <td>
                        <input type="text" class="bg-validity-input" placeholder="Enter BG Validity" value="${rowData.bgValidity || rowData.bg_validity || rowData.BG_VALIDITY || ''}">
                    </td>
                    <td>
                        <input type="text" class="gem-bid-input" placeholder="Enter GeM Bid No" value="${rowData.gemBid || rowData.gem_bid_no || rowData.GEM_BID_NO || ''}">
                    </td>
                    <td>
                        <input type="text" class="ref-efile-input" placeholder="Enter Ref Efile No" value="${rowData.refEfile || rowData.ref_efile_no || rowData.REF_EFILE_NO || ''}">
                    </td>
                    <td>
                        <input type="file" class="attachment-input" accept="*/*">
                        <span class="file-name" style="color: #00d4ff; font-size: 12px;">${fileName}</span>
                    </td>
                    <td>
                        <input type="file" class="bg-no-attachment-input" accept="*/*">
                        <span class="bg-no-file-name" style="color: #00d4ff; font-size: 12px;">${bgNoAttachmentName}</span>
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

                        const fileUrl = URL.createObjectURL(file);

                        // Update contractor link
                        const contractorLink = row.querySelector('.contractor-link');
                        if (contractorLink && contractorValue) {
                            contractorLink.href = '#';
                            contractorLink.dataset.objectUrl = fileUrl;
                            contractorLink.dataset.fileName = file.name;

                            // Remove existing click listener if any
                            contractorLink.replaceWith(contractorLink.cloneNode(true));
                            const newContractorLink = row.querySelector('.contractor-link');

                            // Add click handler to open file visually
                            newContractorLink.addEventListener('click', function (e) {
                                e.preventDefault();
                                openFileVisually(fileUrl, file.name, file.type);
                            });
                        }

                        // Update BG link
                        const bgLink = row.querySelector('.bg-link');
                        if (bgLink && bgValue) {
                            bgLink.href = '#';
                            bgLink.dataset.objectUrl = fileUrl;
                            bgLink.dataset.fileName = file.name;

                            // Remove existing click listener if any
                            bgLink.replaceWith(bgLink.cloneNode(true));
                            const newBgLink = row.querySelector('.bg-link');

                            // Add click handler to open file visually
                            newBgLink.addEventListener('click', function (e) {
                                e.preventDefault();
                                openFileVisually(fileUrl, file.name, file.type);
                            });
                        }
                    } catch (error) {
                        console.error('Error restoring file:', error);
                    }
                }

                // Restore BG NO attachment file if it exists and link to BG NO
                if (hasBgNoFile && bgNoAttachmentBase64) {
                    try {
                        const bgNoFile = base64ToFile(bgNoAttachmentBase64, bgNoAttachmentName);
                        const bgNoFileInput = row.querySelector('.bg-no-attachment-input');
                        const bgNoDataTransfer = new DataTransfer();
                        bgNoDataTransfer.items.add(bgNoFile);
                        bgNoFileInput.files = bgNoDataTransfer.files;

                        const bgNoFileUrl = URL.createObjectURL(bgNoFile);

                        // Update BG link with BG NO attachment file
                        const bgLink = row.querySelector('.bg-link');
                        if (bgLink && bgValue) {
                            bgLink.href = '#';
                            bgLink.dataset.objectUrl = bgNoFileUrl;
                            bgLink.dataset.fileName = bgNoFile.name;

                            // Remove existing click listener if any
                            bgLink.replaceWith(bgLink.cloneNode(true));
                            const newBgLink = row.querySelector('.bg-link');

                            // Add click handler to open BG NO attachment file
                            newBgLink.addEventListener('click', function (e) {
                                e.preventDefault();
                                openFileVisually(bgNoFileUrl, bgNoFile.name, bgNoFile.type);
                            });
                        }
                    } catch (error) {
                        console.error('Error restoring BG NO attachment file:', error);
                    }
                }

                const fileInput = row.querySelector('.attachment-input');
                const bgNoFileInput = row.querySelector('.bg-no-attachment-input');
                const contractorInput = row.querySelector('.contractor-input');
                const bgInput = row.querySelector('.bg-no-input');

                if (fileInput) {
                    fileInput.addEventListener('change', function (e) {
                        validateFileSize(e.target);
                        updateContractorHyperlink(row);
                        updateBgHyperlink(row);
                    });
                }

                if (bgNoFileInput) {
                    bgNoFileInput.addEventListener('change', function (e) {
                        validateBgNoFileSize(e.target);
                    });
                }

                if (contractorInput) {
                    contractorInput.addEventListener('input', function () {
                        updateContractorHyperlink(row);
                    });
                }

                if (bgInput) {
                    bgInput.addEventListener('input', function () {
                        updateBgHyperlink(row);
                    });
                }
            });

            updateTotalCount();
            renumberSerialNumbers(); // Ensure serial numbers are sequential after loading
            saveState(); // Initialize history with loaded data
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
}

// Refresh page (data persists due to localStorage)
function refreshPage() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    location.reload();
}

// Print table
function printTable() {
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
            <title>EPBG's - Print</title>
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
                    font-size: 12px;
                }
                th {
                    background-color: #7b2cbf;
                    color: white;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
            </style>
        </head>
        <body>
            <h1>EPBG's</h1>
            <table>
                <thead>
                    <tr>
                        <th>S.NO</th>
                        <th>CONTRACTOR NAME</th>
                        <th>P.O NO</th>
                        <th>BG NO</th>
                        <th>BG DATE</th>
                        <th>BG AMOUNT</th>
                        <th>BG VALIDITY</th>
                        <th>GeM BID NO</th>
                        <th>REF EFILE NO</th>
                        <th>ATTACHMENT</th>
                        <th>BG NO ATTACHMENT</th>
                    </tr>
                </thead>
                <tbody>
    `;

    rows.forEach(row => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const contractorInput = row.querySelector('.contractor-input');
        const contractorLink = row.querySelector('.contractor-link');
        const contractor = contractorInput && contractorInput.style.display !== 'none'
            ? contractorInput.value
            : (contractorLink?.textContent || '');
        const poNo = row.querySelector('.po-no-input')?.value || '';
        const bgInput = row.querySelector('.bg-no-input');
        const bgLink = row.querySelector('.bg-link');
        const bgNo = bgInput && bgInput.style.display !== 'none'
            ? bgInput.value
            : (bgLink?.textContent || '');
        const bgDate = row.querySelector('.bg-date-input')?.value || '';
        const bgAmount = row.querySelector('.bg-amount-input')?.value || '';
        const bgValidity = row.querySelector('.bg-validity-input')?.value || '';
        const gemBid = row.querySelector('.gem-bid-input')?.value || '';
        const refEfile = row.querySelector('.ref-efile-input')?.value || '';
        const fileName = row.querySelector('.file-name')?.textContent.trim() || '';
        const bgNoFileName = row.querySelector('.bg-no-file-name')?.textContent.trim() || '';

        tableHTML += `
            <tr>
                <td>${sno}</td>
                <td>${contractor}</td>
                <td>${poNo}</td>
                <td>${bgNo}</td>
                <td>${bgDate}</td>
                <td>${bgAmount}</td>
                <td>${bgValidity}</td>
                <td>${gemBid}</td>
                <td>${refEfile}</td>
                <td>${fileName}</td>
                <td>${bgNoFileName}</td>
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

// Import from Excel
function importFromExcel() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                
                // Skip header row and process data
                const dataRows = jsonData.slice(1);
                
                if (dataRows.length === 0) {
                    showNotification('No data found in Excel file', 'error');
                    return;
                }
                
                // Clear existing data
                const tbody = document.getElementById('tableBody');
                tbody.innerHTML = '';
                rowCounter = 0;
                
                // Process each row
                dataRows.forEach((row, index) => {
                    if (row.length >= 10 && row.some(cell => cell !== undefined && cell !== '')) {
                        addRowFromExcel(row);
                    }
                });
                
                saveState();
                updateTotalCount();
                showNotification(`Successfully imported ${dataRows.length} rows from Excel`, 'success');
                
            } catch (error) {
                console.error('Error importing Excel:', error);
                showNotification('Error importing Excel file. Please check the format.', 'error');
            }
        };
        
        reader.readAsArrayBuffer(file);
    };
    
    input.click();
}

// Add row from Excel data
function addRowFromExcel(data) {
    const tbody = document.getElementById('tableBody');
    const row = document.createElement('tr');
    rowCounter++;
    
    // Map Excel columns to table fields
    const [
        sno,
        contractor,
        poNo,
        bgNo,
        bgDate,
        bgAmount,
        bgValidity,
        gemBid,
        refEfile,
        attachment,
        bgAttachment
    ] = data;
    
    row.innerHTML = `
        <td>
            <input type="text" class="sno-input" value="${sno || rowCounter}" readonly>
        </td>
        <td>
            <input type="text" class="contractor-input" value="${contractor || ''}" placeholder="Enter Contractor">
            <a href="#" class="contractor-link" style="display: none;" target="_blank"></a>
        </td>
        <td>
            <input type="text" class="po-no-input" value="${poNo || ''}" placeholder="Enter P.O No">
        </td>
        <td>
            <input type="text" class="bg-no-input" value="${bgNo || ''}" placeholder="Enter BG No">
            <a href="#" class="bg-link" style="display: none;" target="_blank"></a>
        </td>
        <td>
            <input type="date" class="bg-date-input" value="${bgDate || ''}">
        </td>
        <td>
            <input type="text" class="bg-amount-input" value="${bgAmount || ''}" placeholder="Enter BG Amount">
        </td>
        <td>
            <input type="text" class="bg-validity-input" value="${bgValidity || ''}" placeholder="Enter BG Validity">
        </td>
        <td>
            <input type="text" class="gem-bid-input" value="${gemBid || ''}" placeholder="Enter GeM Bid No">
        </td>
        <td>
            <input type="text" class="ref-efile-input" value="${refEfile || ''}" placeholder="Enter Ref Efile No">
        </td>
        <td>
            <div class="attachment-cell">
                ${attachment ? `<span class="file-name">${attachment}</span>` : '<input type="file" class="attachment-input" accept=".pdf,.doc,.docx">'}
                <button class="view-btn" onclick="viewAttachment(this)" title="View Attachment" style="display: ${attachment ? 'inline-block' : 'none'};}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="delete-btn" onclick="deleteAttachment(this)" title="Delete Attachment" style="display: ${attachment ? 'inline-block' : 'none'};}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
        <td>
            <div class="attachment-cell">
                ${bgAttachment ? `<span class="file-name">${bgAttachment}</span>` : '<input type="file" class="bg-attachment-input" accept=".pdf,.doc,.docx">'}
                <button class="view-btn" onclick="viewBGAttachment(this)" title="View BG Attachment" style="display: ${bgAttachment ? 'inline-block' : 'none'};}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="delete-btn" onclick="deleteBGAttachment(this)" title="Delete BG Attachment" style="display: ${bgAttachment ? 'inline-block' : 'none'};}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
        <td>
            <button class="action-btn edit-btn" onclick="editRow(this)" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" onclick="deleteRow(this)" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(row);
    
    // Setup event listeners for the new row
    setupRowEventListeners(row);
}

// Setup event listeners for a row
function setupRowEventListeners(row) {
    // Add input event listeners for auto-save
    const inputs = row.querySelectorAll('input[type="text"');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            saveState();
        });
    });
    
    // Add file input event listeners
    const attachmentInput = row.querySelector('.attachment-input');
    if (attachmentInput) {
        attachmentInput.addEventListener('change', function(e) {
            handleFileSelect(e.target, 'attachment');
        });
    }
    
    const bgAttachmentInput = row.querySelector('.bg-attachment-input');
    if (bgAttachmentInput) {
        bgAttachmentInput.addEventListener('change', function(e) {
            handleFileSelect(e.target, 'bg-attachment');
        });
    }
}

// Show notification helper
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #2ecc71, #27ae60)' : type === 'error' ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 'linear-gradient(135deg, #3498db, #2980b9)'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Export to Excel
function exportToExcel() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');

    if (rows.length === 0) {
        alert('No data to export!');
        return;
    }

    const exportData = [];

    // Headers
    exportData.push([
        'S.NO',
        'Contractor Name',
        'P.O No',
        'BG No',
        'BG Date',
        'BG Amount',
        'BG Validity',
        'GeM Bid No',
        'Ref Efile No',
        'Attachment File Name'
    ]);

    rows.forEach(row => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const contractorInput = row.querySelector('.contractor-input');
        const contractorLink = row.querySelector('.contractor-link');
        const contractor = contractorInput && contractorInput.style.display !== 'none'
            ? contractorInput.value
            : (contractorLink?.textContent.trim() || '');
        const poNo = row.querySelector('.po-no-input')?.value || '';
        const bgInput = row.querySelector('.bg-no-input');
        const bgLink = row.querySelector('.bg-link');
        const bgNo = bgInput && bgInput.style.display !== 'none'
            ? bgInput.value
            : (bgLink?.textContent.trim() || '');
        const bgDate = row.querySelector('.bg-date-input')?.value || '';
        const bgAmount = row.querySelector('.bg-amount-input')?.value || '';
        const bgValidity = row.querySelector('.bg-validity-input')?.value || '';
        const gemBid = row.querySelector('.gem-bid-input')?.value || '';
        const refEfile = row.querySelector('.ref-efile-input')?.value || '';
        const fileName = row.querySelector('.file-name')?.textContent.trim() || '';

        exportData.push([
            sno,
            contractor,
            poNo,
            bgNo,
            bgDate,
            bgAmount,
            bgValidity,
            gemBid,
            refEfile,
            fileName
        ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(exportData);

    ws['!cols'] = [
        { wch: 10 }, // S.NO
        { wch: 25 }, // Contractor
        { wch: 18 }, // P.O No
        { wch: 18 }, // BG No
        { wch: 15 }, // BG Date
        { wch: 18 }, // BG Amount
        { wch: 18 }, // BG Validity
        { wch: 18 }, // GeM Bid No
        { wch: 18 }, // Ref Efile No
        { wch: 30 }  // Attachment
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'EPBGs');

    const filename = `epbg_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
}

// Update total count
function updateTotalCount() {
    const tbody = document.getElementById('tableBody');
    const rowCount = tbody.querySelectorAll('tr').length;
    document.getElementById('totalBadge').textContent = `Total: ${rowCount}`;
}

// Filter table
function filterTable(searchQuery) {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    const query = searchQuery.toLowerCase().trim();
    let visibleCount = 0;

    if (query === '') {
        rows.forEach(row => {
            row.style.display = '';
        });
        updateTotalCount();
        const noResultsMsg = tbody.querySelector('.no-results-row');
        if (noResultsMsg) {
            noResultsMsg.remove();
        }
        return;
    }

    rows.forEach(row => {
        if (row.classList.contains('no-results-row')) {
            return;
        }

        const sno = row.querySelector('.sno-input')?.value.toLowerCase() || '';
        const contractor = row.querySelector('.contractor-input')?.value.toLowerCase() || '';
        const poNo = row.querySelector('.po-no-input')?.value.toLowerCase() || '';
        const bgNo = (row.querySelector('.bg-no-input')?.value || row.querySelector('.bg-link')?.textContent || '').toLowerCase();
        const bgDate = row.querySelector('.bg-date-input')?.value.toLowerCase() || '';
        const bgAmount = row.querySelector('.bg-amount-input')?.value.toLowerCase() || '';
        const bgValidity = row.querySelector('.bg-validity-input')?.value.toLowerCase() || '';
        const gemBid = row.querySelector('.gem-bid-input')?.value.toLowerCase() || '';
        const refEfile = row.querySelector('.ref-efile-input')?.value.toLowerCase() || '';

        const matches =
            sno.includes(query) ||
            contractor.includes(query) ||
            poNo.includes(query) ||
            bgNo.includes(query) ||
            bgDate.includes(query) ||
            bgAmount.includes(query) ||
            bgValidity.includes(query) ||
            gemBid.includes(query) ||
            refEfile.includes(query);

        if (matches) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    const existingNoResults = tbody.querySelector('.no-results-row');
    if (existingNoResults) {
        existingNoResults.remove();
    }

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

    document.getElementById('totalBadge').textContent = `Total: ${visibleCount}`;
}

// Auto-save on input and file change
document.addEventListener('input', function (e) {
    if (e.target.matches('.sno-input, .contractor-input, .po-no-input, .bg-no-input, .bg-date-input, .bg-amount-input, .bg-validity-input, .gem-bid-input, .ref-efile-input')) {
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(() => {
            saveDataToStorage();
        }, 1000);
    }
});

document.addEventListener('change', function (e) {
    if (e.target.matches('.attachment-input')) {
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
            contractor: row.querySelector('.contractor-input').value,
            poNo: row.querySelector('.po-no-input').value,
            bgNo: row.querySelector('.bg-no-input').value,
            bgDate: row.querySelector('.bg-date-input').value,
            bgAmount: row.querySelector('.bg-amount-input').value,
            bgValidity: row.querySelector('.bg-validity-input').value,
            gemBidNo: row.querySelector('.gem-bid-input').value,
            refEfileNo: row.querySelector('.ref-efile-input').value,
            attachment: row.querySelector('.attachment-input').files[0]?.name || '',
            bgNoAttachment: row.querySelector('.bg-no-attachment-input').files[0]?.name || ''
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
                <input type="text" class="contractor-input" placeholder="Enter Contractor" value="${rowData.contractor}">
            </td>
            <td>
                <input type="text" class="po-no-input" placeholder="Enter P.O No" value="${rowData.poNo}">
            </td>
            <td>
                <input type="text" class="bg-no-input" placeholder="Enter BG No" value="${rowData.bgNo}">
            </td>
            <td>
                <input type="date" class="bg-date-input" value="${rowData.bgDate}">
            </td>
            <td>
                <input type="text" class="bg-amount-input" placeholder="Enter BG Amount" value="${rowData.bgAmount}">
            </td>
            <td>
                <input type="text" class="bg-validity-input" placeholder="Enter BG Validity" value="${rowData.bgValidity}">
            </td>
            <td>
                <input type="text" class="gem-bid-input" placeholder="Enter GeM Bid No" value="${rowData.gemBidNo}">
            </td>
            <td>
                <input type="text" class="ref-efile-input" placeholder="Enter Ref Efile No" value="${rowData.refEfileNo}">
            </td>
            <td>
                <input type="file" class="attachment-input" accept=".pdf,.doc,.docx,.xls,.xlsx">
                ${rowData.attachment ? `<span class="attachment-name">${rowData.attachment}</span>` : ''}
            </td>
            <td>
                <input type="file" class="bg-no-attachment-input" accept=".pdf,.doc,.docx,.xls,.xlsx">
                ${rowData.bgNoAttachment ? `<span class="bg-no-attachment-name">${rowData.bgNoAttachment}</span>` : ''}
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
}

// Undo function
function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        restoreState(history[historyIndex]);
        updateTotalCount(); // Fix: Update count after undo
        updateUndoRedoButtons();
    }
}

// Redo function
function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        restoreState(history[historyIndex]);
        updateTotalCount(); // Fix: Update count after redo
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


