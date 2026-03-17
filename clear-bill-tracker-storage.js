// COMPREHENSIVE Bill Tracker Storage Clear Script
console.log('=== CLEARING ALL BILL TRACKER STORAGE ===');

// Bill Tracker Specific Storage Keys
const billTrackerKeys = [
    'billTrackerData',        // Main bill tracker data
    'crossPageDataSync',      // Cross-page synchronization
    'analyticsData',          // Analytics data for bill tracker charts
    'dashboardSessionData',   // Session storage for dashboard
    'billTrackerAudit'        // Audit log in session storage
];

// Clear localStorage
console.log('\n--- Clearing localStorage ---');
let localStorageCleared = 0;
billTrackerKeys.forEach(key => {
    if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        console.log(`✓ Removed: ${key}`);
        localStorageCleared++;
    } else {
        console.log(`- Not found: ${key}`);
    }
});

// Clear sessionStorage
console.log('\n--- Clearing sessionStorage ---');
let sessionStorageCleared = 0;
billTrackerKeys.forEach(key => {
    if (sessionStorage.getItem(key) !== null) {
        sessionStorage.removeItem(key);
        console.log(`✓ Removed: ${key}`);
        sessionStorageCleared++;
    } else {
        console.log(`- Not found: ${key}`);
    }
});

// Additional cleanup - check for any remaining bill tracker related items
console.log('\n--- Checking for remaining bill tracker items ---');
const allLocalStorageKeys = Object.keys(localStorage);
const allSessionKeys = Object.keys(sessionStorage);

// Find any remaining keys that might be bill tracker related
const remainingLocalKeys = allLocalStorageKeys.filter(key => 
    key.toLowerCase().includes('bill') || 
    key.toLowerCase().includes('tracker') ||
    key.toLowerCase().includes('audit')
);

const remainingSessionKeys = allSessionKeys.filter(key => 
    key.toLowerCase().includes('bill') || 
    key.toLowerCase().includes('tracker') ||
    key.toLowerCase().includes('audit')
);

// Clear any remaining related items
remainingLocalKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✓ Removed additional local item: ${key}`);
    localStorageCleared++;
});

remainingSessionKeys.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`✓ Removed additional session item: ${key}`);
    sessionStorageCleared++;
});

// Summary
console.log('\n=== CLEARING SUMMARY ===');
console.log(`localStorage items cleared: ${localStorageCleared}`);
console.log(`sessionStorage items cleared: ${sessionStorageCleared}`);
console.log(`Total items cleared: ${localStorageCleared + sessionStorageCleared}`);

// Optional: Complete nuclear option (uncomment to clear ALL storage)
// console.log('\n--- NUCLEAR OPTION: Clearing ALL storage ---');
// localStorage.clear();
// sessionStorage.clear();
// console.log('✓ All localStorage cleared');
// console.log('✓ All sessionStorage cleared');

console.log('\n=== BILL TRACKER STORAGE CLEARING COMPLETE ===');
alert(`Bill Tracker storage cleared!\n\nLocalStorage: ${localStorageCleared} items\nSessionStorage: ${sessionStorageCleared} items\nTotal: ${localStorageCleared + sessionStorageCleared} items`);
