// Global variables

let rowCounter = 0;

let savedData = [];

const STORAGE_KEY = 'billTrackerData';

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

            <input type="date" class="approved-date-input">

        </td>

        <td>

            <input type="text" class="approved-amount-input" placeholder="Enter Amount">

        </td>

        <td>

            <select class="bill-frequency-input">

                <option value="">Select Frequency</option>

                <option value="monthly">Monthly</option>

                <option value="quarterly">Quarterly</option>

                <option value="half-yearly">Half Yearly</option>

                <option value="annually">Annually</option>

            </select>

        </td>

        <td>

            <input type="date" class="bill-date-input">

        </td>

        <td>

            <input type="date" class="bill-due-date-input">

        </td>

        <td>

            <input type="date" class="bill-paid-date-input">

        </td>

        <td>

            <input type="text" class="paid-amount-input" placeholder="Enter Amount">

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



    // Add file size validation

    const fileInput = row.querySelector('.attachment-input');

    fileInput.addEventListener('change', function (e) {

        validateFileSize(e.target);

        updateContractorHyperlink(row);

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



        const approvedDate = row.querySelector('.approved-date-input')?.value || '';

        const approvedAmount = row.querySelector('.approved-amount-input')?.value || '';

        const billFrequency = row.querySelector('.bill-frequency-input')?.value || '';

        const billDate = row.querySelector('.bill-date-input')?.value || '';

        const billDueDate = row.querySelector('.bill-due-date-input')?.value || '';

        const billPaidDate = row.querySelector('.bill-paid-date-input')?.value || '';

        const paidAmount = row.querySelector('.paid-amount-input')?.value || '';

        const attachmentInput = row.querySelector('.attachment-input');

        const file = attachmentInput?.files[0];



        // Update contractor hyperlink if needed

        updateContractorHyperlink(row);



        // Store data

        const rowData = {

            sno,

            efile,

            contractor,

            approvedDate,

            approvedAmount,

            billFrequency,

            billDate,

            billDueDate,

            billPaidDate,

            paidAmount,

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

        const approvedDate = row.querySelector('.approved-date-input')?.value || '';

        const approvedAmount = row.querySelector('.approved-amount-input')?.value || '';

        const billFrequency = row.querySelector('.bill-frequency-input')?.value || '';

        const billDate = row.querySelector('.bill-date-input')?.value || '';

        const billDueDate = row.querySelector('.bill-due-date-input')?.value || '';

        const billPaidDate = row.querySelector('.bill-paid-date-input')?.value || '';

        const paidAmount = row.querySelector('.paid-amount-input')?.value || '';

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

            approvedDate,

            approvedAmount,

            billFrequency,

            billDate,

            billDueDate,

            billPaidDate,

            paidAmount,

            fileName,

            fileBase64,

            fileType

        });

    }



    // Try to save to API, fallback to localStorage

    try {

        if (typeof billTrackerAPI !== 'undefined') {

            await billTrackerAPI.save(dataToSave);

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

        if (typeof billTrackerAPI !== 'undefined') {

            data = await billTrackerAPI.load();

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

                        <input type="date" class="approved-date-input" value="${rowData.approvedDate || rowData.approved_date || rowData.APPROVED_DATE || ''}">

                    </td>

                    <td>

                        <input type="text" class="approved-amount-input" placeholder="Enter Amount" value="${rowData.approvedAmount || rowData.approved_amount || rowData.APPROVED_AMOUNT || ''}">

                    </td>

                    <td>

                        <select class="bill-frequency-input">

                            <option value="">Select Frequency</option>

                            <option value="monthly" ${(rowData.billFrequency || rowData.bill_frequency || rowData.BILL_FREQUENCY || '') === 'monthly' ? 'selected' : ''}>Monthly</option>

                            <option value="quarterly" ${(rowData.billFrequency || rowData.bill_frequency || rowData.BILL_FREQUENCY || '') === 'quarterly' ? 'selected' : ''}>Quarterly</option>

                            <option value="half-yearly" ${(rowData.billFrequency || rowData.bill_frequency || rowData.BILL_FREQUENCY || '') === 'half-yearly' ? 'selected' : ''}>Half Yearly</option>

                            <option value="annually" ${(rowData.billFrequency || rowData.bill_frequency || rowData.BILL_FREQUENCY || '') === 'annually' ? 'selected' : ''}>Annually</option>

                        </select>

                    </td>

                    <td>

                        <input type="date" class="bill-date-input" value="${rowData.billDate || rowData.bill_date || rowData.BILL_DATE || ''}">

                    </td>

                    <td>

                        <input type="date" class="bill-due-date-input" value="${rowData.billDueDate || rowData.bill_due_date || rowData.BILL_DUE_DATE || ''}">

                    </td>

                    <td>

                        <input type="date" class="bill-paid-date-input" value="${rowData.billPaidDate || rowData.bill_paid_date || rowData.BILL_PAID_DATE || ''}">

                    </td>

                    <td>

                        <input type="text" class="paid-amount-input" placeholder="Enter Amount" value="${rowData.paidAmount || rowData.paid_amount || rowData.PAID_AMOUNT || ''}">

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

            <title>Bill Tracker - Print</title>

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

            <h1>Bill Tracker</h1>

            <table>

                <thead>

                    <tr>

                        <th>S.NO</th>

                        <th>E-FILE</th>

                        <th>CONTRACTOR</th>

                        <th>APPROVED DATE</th>

                        <th>APPROVED AMOUNT</th>

                        <th>BILL FREQUENCY</th>

                        <th>BILL DATE</th>

                        <th>BILL DUE DATE</th>

                        <th>BILL PAID DATE</th>

                        <th>PAID AMOUNT</th>

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

        const approvedDate = row.querySelector('.approved-date-input')?.value || '';

        const approvedAmount = row.querySelector('.approved-amount-input')?.value || '';

        const billFrequency = row.querySelector('.bill-frequency-input')?.value || '';

        const billDate = row.querySelector('.bill-date-input')?.value || '';

        const billDueDate = row.querySelector('.bill-due-date-input')?.value || '';

        const billPaidDate = row.querySelector('.bill-paid-date-input')?.value || '';

        const paidAmount = row.querySelector('.paid-amount-input')?.value || '';

        const fileName = row.querySelector('.file-name')?.textContent.trim() || '';



        tableHTML += `

            <tr>

                <td>${sno}</td>

                <td>${efile}</td>

                <td>${contractor}</td>

                <td>${approvedDate}</td>

                <td>${approvedAmount}</td>

                <td>${billFrequency}</td>

                <td>${billDate}</td>

                <td>${billDueDate}</td>

                <td>${billPaidDate}</td>

                <td>${paidAmount}</td>

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
                    if (row.length >= 11 && row.some(cell => cell !== undefined && cell !== '')) {
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
        efile,
        contractor,
        approvedDate,
        approvedAmount,
        billFrequency,
        billDate,
        billDueDate,
        billPaidDate,
        paidAmount,
        attachment
    ] = data;
    
    row.innerHTML = `
        <td>
            <input type="text" class="sno-input" value="${sno || rowCounter}" readonly>
        </td>
        <td>
            <input type="text" class="efile-input" value="${efile || ''}" placeholder="Enter E-File">
        </td>
        <td>
            <input type="text" class="contractor-input" value="${contractor || ''}" placeholder="Enter Contractor">
        </td>
        <td>
            <input type="date" class="approved-date-input" value="${approvedDate || ''}">
        </td>
        <td>
            <input type="text" class="approved-amount-input" value="${approvedAmount || ''}" placeholder="Enter Approved Amount">
        </td>
        <td>
            <input type="text" class="bill-frequency-input" value="${billFrequency || ''}" placeholder="Enter Bill Frequency">
        </td>
        <td>
            <input type="date" class="bill-date-input" value="${billDate || ''}">
        </td>
        <td>
            <input type="date" class="bill-due-date-input" value="${billDueDate || ''}">
        </td>
        <td>
            <input type="date" class="bill-paid-date-input" value="${billPaidDate || ''}">
        </td>
        <td>
            <input type="text" class="paid-amount-input" value="${paidAmount || ''}" placeholder="Enter Paid Amount">
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



    // Prepare data for export

    const exportData = [];



    // Add headers

    exportData.push([

        'S.NO',

        'E-File',

        'Contractor',

        'Approved Date',

        'Approved Amount',

        'Bill Frequency',

        'Bill Date',

        'Bill Due Date',

        'Bill Paid Date',

        'Paid Amount',

        'Attachment File Name'

    ]);



    // Add rows

    rows.forEach(row => {

        const sno = row.querySelector('.sno-input')?.value || '';

        const efile = row.querySelector('.efile-input')?.value || '';

        const contractorInput = row.querySelector('.contractor-input');

        const contractorLink = row.querySelector('.contractor-link');

        const contractor = contractorInput ? contractorInput.value : (contractorLink ? contractorLink.textContent.trim() : '');

        const approvedDate = row.querySelector('.approved-date-input')?.value || '';

        const approvedAmount = row.querySelector('.approved-amount-input')?.value || '';

        const billFrequency = row.querySelector('.bill-frequency-input')?.value || '';

        const billDate = row.querySelector('.bill-date-input')?.value || '';

        const billDueDate = row.querySelector('.bill-due-date-input')?.value || '';

        const billPaidDate = row.querySelector('.bill-paid-date-input')?.value || '';

        const paidAmount = row.querySelector('.paid-amount-input')?.value || '';

        const fileName = row.querySelector('.file-name')?.textContent.trim() || '';



        exportData.push([

            sno,

            efile,

            contractor,

            approvedDate,

            approvedAmount,

            billFrequency,

            billDate,

            billDueDate,

            billPaidDate,

            paidAmount,

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

        { wch: 15 }, // Approved Date

        { wch: 18 }, // Approved Amount

        { wch: 15 }, // Bill Frequency

        { wch: 15 }, // Bill Date

        { wch: 15 }, // Bill Due Date

        { wch: 15 }, // Bill Paid Date

        { wch: 15 }, // Paid Amount

        { wch: 30 }  // Attachment

    ];



    XLSX.utils.book_append_sheet(wb, ws, 'Bill Tracker');



    // Generate filename with timestamp

    const filename = `bill_tracker_export_${new Date().toISOString().split('T')[0]}.xlsx`;



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

        const approvedDate = row.querySelector('.approved-date-input')?.value.toLowerCase() || '';

        const approvedAmount = row.querySelector('.approved-amount-input')?.value.toLowerCase() || '';

        const billFrequency = row.querySelector('.bill-frequency-input')?.value.toLowerCase() || '';

        const billDate = row.querySelector('.bill-date-input')?.value.toLowerCase() || '';

        const billDueDate = row.querySelector('.bill-due-date-input')?.value.toLowerCase() || '';

        const billPaidDate = row.querySelector('.bill-paid-date-input')?.value.toLowerCase() || '';

        const paidAmount = row.querySelector('.paid-amount-input')?.value.toLowerCase() || '';



        // Check if any field matches the search query

        const matches = sno.includes(query) ||

            efile.includes(query) ||

            contractor.includes(query) ||

            approvedDate.includes(query) ||

            approvedAmount.includes(query) ||

            billFrequency.includes(query) ||

            billDate.includes(query) ||

            billDueDate.includes(query) ||

            billPaidDate.includes(query) ||

            paidAmount.includes(query);



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

            <td colspan="12" style="text-align: center; padding: 40px; font-size: 18px; color: rgba(255, 255, 255, 0.6);">

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

    if (e.target.matches('.sno-input, .efile-input, .contractor-input, .approved-date-input, .approved-amount-input, .bill-frequency-input, .bill-date-input, .bill-due-date-input, .bill-paid-date-input, .paid-amount-input')) {

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
            approvedDate: row.querySelector('.approved-date-input').value,
            approvedAmount: row.querySelector('.approved-amount-input').value,
            billFrequency: row.querySelector('.bill-frequency-select').value,
            billDate: row.querySelector('.bill-date-input').value,
            billDueDate: row.querySelector('.bill-due-date-input').value,
            billPaidDate: row.querySelector('.bill-paid-date-input').value,
            paidAmount: row.querySelector('.paid-amount-input').value,
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
                <input type="date" class="approved-date-input" value="${rowData.approvedDate}">
            </td>
            <td>
                <input type="text" class="approved-amount-input" placeholder="Enter Approved Amount" value="${rowData.approvedAmount}">
            </td>
            <td>
                <select class="bill-frequency-select">
                    <option value="">Select Frequency</option>
                    <option value="0.00" ${rowData.billFrequency === '0.00' ? 'selected' : ''}>0.00</option>
                    <option value="0.25" ${rowData.billFrequency === '0.25' ? 'selected' : ''}>0.25</option>
                    <option value="0.50" ${rowData.billFrequency === '0.50' ? 'selected' : ''}>0.50</option>
                    <option value="0.75" ${rowData.billFrequency === '0.75' ? 'selected' : ''}>0.75</option>
                    <option value="1.00" ${rowData.billFrequency === '1.00' ? 'selected' : ''}>1.00</option>
                </select>
            </td>
            <td>
                <input type="date" class="bill-date-input" value="${rowData.billDate}">
            </td>
            <td>
                <input type="date" class="bill-due-date-input" value="${rowData.billDueDate}">
            </td>
            <td>
                <input type="date" class="bill-paid-date-input" value="${rowData.billPaidDate}">
            </td>
            <td>
                <input type="text" class="paid-amount-input" placeholder="Enter Paid Amount" value="${rowData.paidAmount}">
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



