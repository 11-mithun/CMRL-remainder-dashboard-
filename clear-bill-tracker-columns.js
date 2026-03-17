// Clear Bill Tracker Column Data Script
console.log('=== CLEARING BILL TRACKER COLUMN DATA ===');

// Function to clear all input fields in the bill tracker table
function clearBillTrackerColumns() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) {
        console.error('Table body not found!');
        return;
    }

    const rows = tableBody.querySelectorAll('tr');
    let clearedRows = 0;
    let clearedFields = 0;

    console.log(`Found ${rows.length} rows to clear...`);

    rows.forEach((row, index) => {
        let rowCleared = false;
        
        // Clear S.NO input (but keep the number)
        const snoInput = row.querySelector('.sno-input');
        if (snoInput && snoInput.value) {
            console.log(`Row ${index + 1}: Clearing S.NO: ${snoInput.value}`);
            snoInput.value = '';
            clearedFields++;
            rowCleared = true;
        }

        // Clear EFILE NO
        const efileInput = row.querySelector('.efile-no-input');
        if (efileInput && efileInput.value) {
            console.log(`Row ${index + 1}: Clearing EFILE NO: ${efileInput.value}`);
            efileInput.value = '';
            clearedFields++;
            rowCleared = true;
        }

        // Clear CONTRACTOR
        const contractorInput = row.querySelector('.contractor-input');
        if (contractorInput && contractorInput.value) {
            console.log(`Row ${index + 1}: Clearing CONTRACTOR: ${contractorInput.value}`);
            contractorInput.value = '';
            clearedFields++;
            rowCleared = true;
        }

        // Clear START DATE
        const startDateInput = row.querySelector('.start-date-input');
        if (startDateInput && startDateInput.value) {
            console.log(`Row ${index + 1}: Clearing START DATE: ${startDateInput.value}`);
            startDateInput.value = '';
            clearedFields++;
            rowCleared = true;
        }

        // Clear END DATE
        const endDateInput = row.querySelector('.end-date-input');
        if (endDateInput && endDateInput.value) {
            console.log(`Row ${index + 1}: Clearing END DATE: ${endDateInput.value}`);
            endDateInput.value = '';
            clearedFields++;
            rowCleared = true;
        }

        // Clear DURATION (readonly field)
        const durationInput = row.querySelector('.duration-input');
        if (durationInput && durationInput.value) {
            console.log(`Row ${index + 1}: Clearing DURATION: ${durationInput.value}`);
            durationInput.value = '';
            durationInput.style.color = ''; // Reset color
            clearedFields++;
            rowCleared = true;
        }

        // Clear HANDLE BY
        const handleByInput = row.querySelector('.handle-by-input');
        if (handleByInput && handleByInput.value) {
            console.log(`Row ${index + 1}: Clearing HANDLE BY: ${handleByInput.value}`);
            handleByInput.value = '';
            clearedFields++;
            rowCleared = true;
        }

        // Clear FREQUENCY
        const frequencySelect = row.querySelector('.frequency-select');
        if (frequencySelect && frequencySelect.value) {
            console.log(`Row ${index + 1}: Clearing FREQUENCY: ${frequencySelect.value}`);
            frequencySelect.value = '';
            clearedFields++;
            rowCleared = true;
        }

        // Clear MONTHS status
        const monthsStatus = row.querySelector('.months-status');
        if (monthsStatus && monthsStatus.textContent) {
            console.log(`Row ${index + 1}: Clearing MONTHS: ${monthsStatus.textContent}`);
            monthsStatus.textContent = '';
            clearedFields++;
            rowCleared = true;
        }

        // Clear PENDING STATUS
        const pendingStatus = row.querySelector('.pending-status');
        if (pendingStatus && pendingStatus.textContent) {
            console.log(`Row ${index + 1}: Clearing PENDING STATUS: ${pendingStatus.textContent}`);
            pendingStatus.textContent = '';
            clearedFields++;
            rowCleared = true;
        }

        // Clear REMARKS
        const remarksInput = row.querySelector('.remarks-input');
        if (remarksInput && remarksInput.value) {
            console.log(`Row ${index + 1}: Clearing REMARKS: ${remarksInput.value}`);
            remarksInput.value = '';
            clearedFields++;
            rowCleared = true;
        }

        if (rowCleared) {
            clearedRows++;
        }
    });

    // Clear global months select
    const globalMonthsSelect = document.getElementById('globalMonthsSelect');
    if (globalMonthsSelect && globalMonthsSelect.value) {
        console.log('Clearing Global Months Select');
        globalMonthsSelect.value = '';
        clearedFields++;
    }

    // Clear year filter
    const filterYearSelect = document.getElementById('filterYearSelect');
    if (filterYearSelect && filterYearSelect.value) {
        console.log('Clearing Year Filter');
        filterYearSelect.value = '';
        clearedFields++;
    }

    // Clear search input
    const searchInput = document.querySelector('.search-input');
    if (searchInput && searchInput.value) {
        console.log('Clearing Search Input');
        searchInput.value = '';
        clearedFields++;
    }

    // Update total count
    updateTotalCount();

    console.log('\n=== CLEARING SUMMARY ===');
    console.log(`Rows cleared: ${clearedRows}`);
    console.log(`Total fields cleared: ${clearedFields}`);
    console.log('All column data has been cleared!');

    // Show success message
    alert(`Bill Tracker column data cleared!\n\nRows cleared: ${clearedRows}\nTotal fields cleared: ${clearedFields}\n\nTable structure preserved.`);
}

// Function to update total count (should exist in the page)
function updateTotalCount() {
    const tbody = document.getElementById('tableBody');
    const totalBadge = document.getElementById('totalBadge');
    if (tbody && totalBadge) {
        const rowCount = tbody.querySelectorAll('tr').length;
        totalBadge.textContent = `Total: ${rowCount}`;
    }
}

// Execute the clearing function
clearBillTrackerColumns();

console.log('\n=== BILL TRACKER COLUMN CLEARING COMPLETE ===');
