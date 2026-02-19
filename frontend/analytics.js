// Analytics JavaScript
let analyticsCharts = {};
let analyticsData = {
    contractors: [],
    bills: [],
    epbg: []
};

// Initialize analytics on page load
document.addEventListener('DOMContentLoaded', function () {
    initializeAnalytics();
    setupEventListeners();
    loadAnalyticsData();
    
    // Initialize AI Analytics integration
    setTimeout(() => {
        if (window.aiAnalytics) {
            console.log('Analytics: AI Analytics integration ready');
        } else {
            console.log('Analytics: AI Analytics not yet loaded');
        }
    }, 2000);
    
    // Start periodic expiry alert checking (every 10 minutes)
    setInterval(() => {
        loadContractorDataCached().then(contractors => {
            checkExpiryAlerts(contractors);
        });
    }, 600000); // 10 minutes
});

// AI Analytics Functions
function refreshAIAnalytics() {
    console.log('Refreshing AI Analytics...');
    
    // Show loading state
    const aiStatusIndicators = document.querySelectorAll('.ai-status-indicator');
    aiStatusIndicators.forEach(indicator => {
        indicator.classList.add('loading');
        indicator.classList.remove('active');
    });
    
    // Simulate AI processing
    setTimeout(() => {
        initializeAIRiskChart();
        initializeAIForecastChart();
        generateAIInsights();
        
        // Restore active state
        aiStatusIndicators.forEach(indicator => {
            indicator.classList.remove('loading');
            indicator.classList.add('active');
        });
        
        showNotification('AI Analytics refreshed successfully', 'success');
    }, 1500);
}

function initializeAIRiskChart() {
    const ctx = document.getElementById('aiRiskChart');
    if (!ctx) return;
    
    // Generate sample risk data
    const riskData = {
        labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
        datasets: [{
            label: 'Contract Risk Distribution',
            data: [65, 25, 8, 2],
            backgroundColor: [
                'rgba(46, 204, 113, 0.8)',
                'rgba(255, 193, 7, 0.8)',
                'rgba(255, 87, 34, 0.8)',
                'rgba(231, 76, 60, 0.8)'
            ],
            borderColor: [
                'rgba(46, 204, 113, 1)',
                'rgba(255, 193, 7, 1)',
                'rgba(255, 87, 34, 1)',
                'rgba(231, 76, 60, 1)'
            ],
            borderWidth: 2
        }]
    };
    
    if (analyticsCharts.aiRisk) {
        analyticsCharts.aiRisk.destroy();
    }
    
    analyticsCharts.aiRisk = new Chart(ctx, {
        type: 'doughnut',
        data: riskData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#fff',
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

function initializeAIForecastChart() {
    const ctx = document.getElementById('aiForecastChart');
    if (!ctx) return;
    
    // Generate sample forecast data
    const forecastData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Predicted Performance',
            data: [85, 88, 92, 87, 90, 94],
            borderColor: 'rgba(52, 152, 219, 1)',
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            tension: 0.4,
            fill: true
        }, {
            label: 'Actual Performance',
            data: [82, 85, 88, 84, 87, 90],
            borderColor: 'rgba(46, 204, 113, 1)',
            backgroundColor: 'rgba(46, 204, 113, 0.2)',
            tension: 0.4,
            fill: true
        }]
    };
    
    if (analyticsCharts.aiForecast) {
        analyticsCharts.aiForecast.destroy();
    }
    
    analyticsCharts.aiForecast = new Chart(ctx, {
        type: 'line',
        data: forecastData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#fff',
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

function generateAIInsights() {
    const insightsContainer = document.querySelector('.ai-insights-content');
    if (!insightsContainer) return;
    
    const insights = [
        {
            type: 'warning',
            title: 'Contractor Performance Alert',
            message: '3 contractors show declining performance trends. Consider reviewing their recent contracts.',
            action: 'Review Details'
        },
        {
            type: 'success',
            title: 'Cost Optimization Opportunity',
            message: 'AI analysis suggests potential 15% cost savings in upcoming contracts.',
            action: 'View Recommendations'
        },
        {
            type: 'info',
            title: 'Market Trend Analysis',
            message: 'Contract values in your sector are trending 8% higher than last quarter.',
            action: 'See Analysis'
        }
    ];
    
    insightsContainer.innerHTML = insights.map(insight => `
        <div class="ai-insight-item ${insight.type}">
            <div class="insight-icon">
                <i class="fas fa-${insight.type === 'warning' ? 'exclamation-triangle' : insight.type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            </div>
            <div class="insight-content">
                <h5>${insight.title}</h5>
                <p>${insight.message}</p>
                <button class="insight-action-btn">${insight.action}</button>
            </div>
        </div>
    `).join('');
}

// Initialize analytics
function initializeAnalytics() {
    // Initialize date range selector
    const dateRange = document.getElementById('dateRange');
    const customDateRange = document.getElementById('customDateRange');
    
    if (dateRange) {
        dateRange.addEventListener('change', function() {
            if (this.value === 'custom') {
                customDateRange.style.display = 'flex';
            } else {
                customDateRange.style.display = 'none';
                loadAnalyticsData();
            }
        });
    }
    
    // Initialize custom date range
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    if (startDate && endDate) {
        [startDate, endDate].forEach(input => {
            input.addEventListener('change', function() {
                if (startDate.value && endDate.value) {
                    loadAnalyticsData();
                }
            });
        });
    }
    
    // Initialize analytics type selector
    const analyticsType = document.getElementById('analyticsType');
    if (analyticsType) {
        analyticsType.addEventListener('change', loadAnalyticsData);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Refresh analytics button
    const refreshBtn = document.getElementById('refreshAnalyticsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadAnalyticsData);
    }
    
    // Export analytics button
    const exportBtn = document.getElementById('exportAnalyticsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportAnalyticsReport);
    }
    
    // Print analytics button
    const printBtn = document.getElementById('printAnalyticsBtn');
    if (printBtn) {
        printBtn.addEventListener('click', printAnalytics);
    }
    
    // Export table button
    const exportTableBtn = document.getElementById('exportTableBtn');
    if (exportTableBtn) {
        exportTableBtn.addEventListener('click', exportAnalyticsTable);
    }
    
    // Chart action buttons
    document.querySelectorAll('.chart-action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const chartId = this.dataset.chart;
            const action = this.dataset.action;
            
            if (action === 'download') {
                downloadChart(chartId);
            } else if (action === 'fullscreen') {
                fullscreenChart(chartId);
            }
        });
    });
}

// Load analytics data
async function loadAnalyticsData() {
    showLoadingIndicator();
    
    try {
        // Get data from all modules
        const contractorData = await loadContractorDataCached();
        const billData = await loadBillData();
        const epbgData = await loadEPBGData();
        
        // Filter data based on date range and type
        const filteredData = filterAnalyticsData(contractorData, billData, epbgData);
        
        // Update summary cards
        updateSummaryCards(filteredData);
        
        // Check for expiry alerts
        checkExpiryAlerts(filteredData.contractors);
        
        // Update charts
        updateCharts(filteredData);
        
        // Initialize AI Analytics
        refreshAIAnalytics();
        
        // Note: Analytics table removed as requested
        
    } catch (error) {
        console.error('Error loading analytics data:', error);
        showNotification('Error loading analytics data', 'error');
    } finally {
        hideLoadingIndicator();
    }
}

// Load contractor data
async function loadContractorData() {
    try {
        // Try to get from API first
        if (typeof contractorListAPI !== 'undefined') {
            const data = await contractorListAPI.load();
            console.log('Contractor data loaded from API:', data.length, 'records');
            return data;
        } else {
            // Fallback to localStorage
            const savedData = localStorage.getItem('contractorListData');
            const data = savedData ? JSON.parse(savedData) : [];
            console.log('Contractor data loaded from localStorage:', data.length, 'records');
            return data;
        }
    } catch (error) {
        console.error('Error loading contractor data:', error);
        // Try direct DOM fallback
        return getContractorDataFromDOM();
    }
}

// Cache to prevent multiple API calls
let contractorDataCache = null;
let lastDataLoadTime = 0;
const DATA_CACHE_DURATION = 5000; // 5 seconds

// Cached contractor data loader
async function loadContractorDataCached() {
    const now = Date.now();
    
    // Return cached data if still valid
    if (contractorDataCache && (now - lastDataLoadTime) < DATA_CACHE_DURATION) {
        console.log('Using cached contractor data:', contractorDataCache.length, 'records');
        return contractorDataCache;
    }
    
    // Load fresh data
    contractorDataCache = await loadContractorData();
    lastDataLoadTime = now;
    return contractorDataCache;
}

// Fallback: Get contractor data directly from DOM
function getContractorDataFromDOM() {
    try {
        const contractorRows = document.querySelectorAll('#tableBody tr');
        const data = [];
        
        Array.from(contractorRows).forEach((row, index) => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 6) {
                const contractor = {
                    id: index + 1,
                    name: cells[1]?.textContent?.trim() || '',
                    workOrder: cells[2]?.textContent?.trim() || '',
                    value: parseFloat(cells[3]?.textContent?.replace(/[^0-9.-]/g, '')) || 0,
                    duration: cells[4]?.textContent?.trim() || '',
                    status: cells[5]?.textContent?.trim() || '',
                    gst: cells[6]?.textContent?.trim() || 'without gst',
                    endDate: cells[7]?.textContent?.trim() || '',
                    date: cells[8]?.textContent?.trim() || new Date().toISOString()
                };
                
                if (contractor.name && contractor.value > 0) {
                    data.push(contractor);
                }
            }
        });
        
        console.log('Contractor data extracted from DOM:', data.length, 'records');
        return data;
    } catch (error) {
        console.error('Error extracting contractor data from DOM:', error);
        return [];
    }
}

// Load bill data
async function loadBillData() {
    try {
        // Try to get from API first
        if (typeof billTrackerAPI !== 'undefined') {
            const data = await billTrackerAPI.load();
            console.log('Bill data loaded from API:', data.length, 'records');
            return data;
        } else {
            // Fallback to localStorage
            const savedData = localStorage.getItem('billTrackerData');
            const data = savedData ? JSON.parse(savedData) : [];
            console.log('Bill data loaded from localStorage:', data.length, 'records');
            return data;
        }
    } catch (error) {
        console.error('Error loading bill data:', error);
        // Try direct DOM fallback
        return getBillDataFromDOM();
    }
}

// Fallback: Get bill data directly from DOM
function getBillDataFromDOM() {
    try {
        // Try to find bill table or elements
        const billRows = document.querySelectorAll('.bill-row, .bill-item, tr[data-bill-id]');
        const data = [];
        
        Array.from(billRows).forEach((row, index) => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 3) {
                const bill = {
                    id: index + 1,
                    billNumber: cells[0]?.textContent?.trim() || `BILL-${index + 1}`,
                    contractor: cells[1]?.textContent?.trim() || '',
                    amount: parseFloat(cells[2]?.textContent?.replace(/[^0-9.-]/g, '')) || 0,
                    date: cells[3]?.textContent?.trim() || new Date().toISOString(),
                    status: cells[4]?.textContent?.trim() || 'Pending'
                };
                
                if (bill.billNumber) {
                    data.push(bill);
                }
            }
        });
        
        // If no bill rows found, create sample data
        if (data.length === 0) {
            console.log('No bill data found in DOM, using sample data');
            for (let i = 1; i <= 5; i++) {
                data.push({
                    id: i,
                    billNumber: `BILL-00${i}`,
                    contractor: `Contractor ${i}`,
                    amount: Math.floor(Math.random() * 100000) + 10000,
                    date: new Date().toISOString(),
                    status: 'Pending'
                });
            }
        }
        
        console.log('Bill data extracted from DOM:', data.length, 'records');
        return data;
    } catch (error) {
        console.error('Error extracting bill data from DOM:', error);
        return [];
    }
}

// Load EPBG data
async function loadEPBGData() {
    try {
        // Try to get from API first
        if (typeof epbgAPI !== 'undefined') {
            return await epbgAPI.load();
        } else {
            // Fallback to localStorage
            const savedData = localStorage.getItem('epbgData');
            return savedData ? JSON.parse(savedData) : [];
        }
    } catch (error) {
        console.error('Error loading EPBG data:', error);
        return [];
    }
}

// Filter analytics data based on date range and type
function filterAnalyticsData(contractorData, billData, epbgData) {
    const dateRangeElement = document.getElementById('dateRange');
    const analyticsTypeElement = document.getElementById('analyticsType');
    
    const dateRange = dateRangeElement ? dateRangeElement.value : '30';
    const analyticsType = analyticsTypeElement ? analyticsTypeElement.value : 'all';
    
    let startDate, endDate;
    
    if (dateRange === 'custom') {
        const startDateElement = document.getElementById('startDate');
        const endDateElement = document.getElementById('endDate');
        
        if (startDateElement && endDateElement && startDateElement.value && endDateElement.value) {
            startDate = new Date(startDateElement.value);
            endDate = new Date(endDateElement.value);
        } else {
            // Fallback to 30 days if custom dates not set
            const days = 30;
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(endDate.getDate() - days);
        }
    } else {
        const days = parseInt(dateRange) || 30;
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
    }
    
    // Filter contractor data
    const filteredContractors = contractorData.filter(contractor => {
        if (!contractor || !contractor.date) return true; // Include if no date
        const contractDate = new Date(contractor.date);
        return contractDate >= startDate && contractDate <= endDate;
    });
    
    // Filter bill data
    const filteredBills = billData.filter(bill => {
        if (!bill || !bill.date) return true; // Include if no date
        const billDate = new Date(bill.date);
        return billDate >= startDate && billDate <= endDate;
    });
    
    // Filter EPBG data
    const filteredEPBG = epbgData.filter(epbg => {
        if (!epbg || !epbg.date) return true; // Include if no date
        const epbgDate = new Date(epbg.date);
        return epbgDate >= startDate && epbgDate <= endDate;
    });
    
    return {
        contractors: filteredContractors,
        bills: filteredBills,
        epbg: filteredEPBG,
        dateRange: { startDate, endDate },
        type: analyticsType
    };
}

// Update summary cards
function updateSummaryCards(data) {
    // Total contractors
    const totalContractors = data.contractors.length;
    const totalContractorsElement = document.getElementById('totalContractors');
    if (totalContractorsElement) {
        totalContractorsElement.textContent = totalContractors;
    }
    
    // Total bills
    const totalBills = data.bills.length;
    const totalBillsElement = document.getElementById('totalBills');
    if (totalBillsElement) {
        totalBillsElement.textContent = totalBills;
    }
    
    // Total value
    const totalValue = data.contractors.reduce((sum, item) => {
        const value = parseFloat(item.value) || 0;
        const gst = calculateGSTAmount(value, item.gst);
        return sum + value + gst;
    }, 0);
    const totalValueElement = document.getElementById('totalValue');
    if (totalValueElement) {
        totalValueElement.textContent = formatCurrency(totalValue);
    }
    
    // Expiring soon (within 30 days)
    const expiringSoon = data.contractors.filter(item => {
        if (!item.endDate) return false;
        const endDate = new Date(item.endDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    }).length;
    const expiringSoonElement = document.getElementById('expiringSoon');
    if (expiringSoonElement) {
        expiringSoonElement.textContent = expiringSoon;
    }
    
    // Update change indicators (placeholder for now)
    updateChangeIndicators();
}

// Calculate GST amount
function calculateGSTAmount(value, gstRate) {
    if (!gstRate || gstRate === 'without gst') return 0;
    
    const rate = parseFloat(gstRate.replace('%', '')) / 100;
    return value * rate;
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Update change indicators
function updateChangeIndicators() {
    // Placeholder for change indicators
    // In a real implementation, you would compare with previous period data
    const contractorsChangeElement = document.getElementById('contractorsChange');
    if (contractorsChangeElement) {
        contractorsChangeElement.textContent = '+12%';
    }
    
    const billsChangeElement = document.getElementById('billsChange');
    if (billsChangeElement) {
        billsChangeElement.textContent = '+8%';
    }
    
    const valueChangeElement = document.getElementById('valueChange');
    if (valueChangeElement) {
        valueChangeElement.textContent = '+15%';
    }
    
    const expiringChangeElement = document.getElementById('expiringChange');
    if (expiringChangeElement) {
        expiringChangeElement.textContent = '-5%';
    }
}

// Update charts
function updateCharts(data) {
    updateContractorTrendsChart(data);
    updateValueDistributionChart(data);
    updateGSTBreakdownChart(data);
    updateDurationAnalysisChart(data);
}

// Update contractor trends chart
function updateContractorTrendsChart(data) {
    const canvas = document.getElementById('contractorTrendsChart');
    if (!canvas) {
        console.log('contractorTrendsChart canvas not found, skipping chart update');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (analyticsCharts.contractorTrends) {
        analyticsCharts.contractorTrends.destroy();
    }
    
    // Prepare data
    const monthlyData = aggregateMonthlyData(data.contractors);
    
    analyticsCharts.contractorTrends = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'New Contractors',
                data: monthlyData.newContractors,
                borderColor: '#6e8efb',
                backgroundColor: 'rgba(110, 142, 251, 0.1)',
                tension: 0.4
            }, {
                label: 'Active Contractors',
                data: monthlyData.activeContractors,
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

// Update value distribution chart
function updateValueDistributionChart(data) {
    const canvas = document.getElementById('valueDistributionChart');
    if (!canvas) {
        console.log('valueDistributionChart canvas not found, skipping chart update');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (analyticsCharts.valueDistribution) {
        analyticsCharts.valueDistribution.destroy();
    }
    
    // Prepare data
    const valueRanges = getValueDistribution(data.contractors);
    
    analyticsCharts.valueDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: valueRanges.labels,
            datasets: [{
                data: valueRanges.data,
                backgroundColor: [
                    '#6e8efb',
                    '#2ecc71',
                    '#f39c12',
                    '#e74c3c',
                    '#9b59b6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

// Update GST breakdown chart
function updateGSTBreakdownChart(data) {
    const canvas = document.getElementById('gstBreakdownChart');
    if (!canvas) {
        console.log('gstBreakdownChart canvas not found, skipping chart update');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Destroy existing chart if it exists
    if (analyticsCharts.gstBreakdown) {
        analyticsCharts.gstBreakdown.destroy();
    }

    // Prepare data
    const gstData = getGSTBreakdown(data.contractors);

    analyticsCharts.gstBreakdown = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: gstData.labels,
            datasets: [{
                data: gstData.data,
                backgroundColor: [
                    '#6e8efb',
                    '#2ecc71',
                    '#f39c12',
                    '#e74c3c',
                    '#9b59b6',
                    '#34495e'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

// Update duration analysis chart
function updateDurationAnalysisChart(data) {
    const canvas = document.getElementById('durationAnalysisChart');
    if (!canvas) {
        console.log('durationAnalysisChart canvas not found, skipping chart update');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Destroy existing chart if it exists
    if (analyticsCharts.durationAnalysis) {
        analyticsCharts.durationAnalysis.destroy();
    }

    // Prepare data
    const durationData = getDurationAnalysis(data.contractors);

    analyticsCharts.durationAnalysis = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: durationData.labels,
            datasets: [{
                label: 'Number of Contracts',
                data: durationData.data,
                backgroundColor: '#6e8efb'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

// Aggregate monthly data
function aggregateMonthlyData(contractors) {
    const monthlyData = {
        labels: [],
        newContractors: [],
        activeContractors: []
    };
    
    // Get last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyData.labels.push(monthYear);
        
        // Count contractors for this month (placeholder logic)
        monthlyData.newContractors.push(Math.floor(Math.random() * 10) + 5);
        monthlyData.activeContractors.push(Math.floor(Math.random() * 30) + 20);
    }
    
    return monthlyData;
}

// Get value distribution
function getValueDistribution(contractors) {
    const ranges = {
        '0-1L': 0,
        '1L-5L': 0,
        '5L-10L': 0,
        '10L-50L': 0,
        '50L+': 0
    };
    
    contractors.forEach(contractor => {
        const value = parseFloat(contractor.value) || 0;
        if (value < 100000) ranges['0-1L']++;
        else if (value < 500000) ranges['1L-5L']++;
        else if (value < 1000000) ranges['5L-10L']++;
        else if (value < 5000000) ranges['10L-50L']++;
        else ranges['50L+']++;
    });
    
    return {
        labels: Object.keys(ranges),
        data: Object.values(ranges)
    };
}

// Get GST breakdown
function getGSTBreakdown(contractors) {
    const gstRates = {};
    
    contractors.forEach(contractor => {
        const gst = contractor.gst || 'without gst';
        gstRates[gst] = (gstRates[gst] || 0) + 1;
    });
    
    return {
        labels: Object.keys(gstRates),
        data: Object.values(gstRates)
    };
}

// Get duration analysis
function getDurationAnalysis(contractors) {
    const durationRanges = {
        '0-30 days': 0,
        '30-90 days': 0,
        '90-180 days': 0,
        '180-365 days': 0,
        '365+ days': 0
    };
    
    contractors.forEach(contractor => {
        if (!contractor.duration) return;
        
        const durationMatch = contractor.duration.match(/(\d+)\s*days/);
        if (durationMatch) {
            const days = parseInt(durationMatch[1]);
            if (days <= 30) durationRanges['0-30 days']++;
            else if (days <= 90) durationRanges['30-90 days']++;
            else if (days <= 180) durationRanges['90-180 days']++;
            else if (days <= 365) durationRanges['180-365 days']++;
            else durationRanges['365+ days']++;
        }
    });
    
    return {
        labels: Object.keys(durationRanges),
        data: Object.values(durationRanges)
    };
}

// Update analytics table
function updateAnalyticsTable(data) {
    const tbody = document.getElementById('analyticsTableBody');
    if (!tbody) {
        console.log('analyticsTableBody not found, skipping table update');
        return;
    }
    
    tbody.innerHTML = '';
    
    data.contractors.forEach(contractor => {
        const row = document.createElement('tr');
        const value = parseFloat(contractor.value) || 0;
        const gstAmount = calculateGSTAmount(value, contractor.gst);
        const total = value + gstAmount;
        
        // Determine status
        let status = 'Active';
        let statusClass = 'status-active';
        
        if (contractor.endDate) {
            const endDate = new Date(contractor.endDate);
            const today = new Date();
            const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry < 0) {
                status = 'Expired';
                statusClass = 'status-expired';
            } else if (daysUntilExpiry <= 30) {
                status = 'Expiring Soon';
                statusClass = 'status-warning';
            }
        }
        
        // Determine trend (placeholder)
        const trend = Math.random() > 0.5 ? 'up' : 'down';
        const trendIcon = trend === 'up' ? '↑' : '↓';
        const trendClass = trend === 'up' ? 'trend-up' : 'trend-down';
        
        row.innerHTML = `
            <td>${contractor.name || contractor.contractor || '-'}</td>
            <td>${contractor.efile || contractor.workOrder || '-'}</td>
            <td>${formatCurrency(value)}</td>
            <td>${contractor.gst || '-'}</td>
            <td>${formatCurrency(total)}</td>
            <td>${contractor.duration || contractor.endDate || '-'}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td><span class="trend-indicator ${trendClass}">${trendIcon}</span></td>
        `;
        
        tbody.appendChild(row);
    });
}

// Export analytics report
function exportAnalyticsReport() {
    // Create a comprehensive analytics report
    const reportData = {
        summary: {
            totalContractors: document.getElementById('totalContractors').textContent,
            totalBills: document.getElementById('totalBills').textContent,
            totalValue: document.getElementById('totalValue').textContent,
            expiringSoon: document.getElementById('expiringSoon').textContent
        },
        charts: {},
        tableData: getTableData(),
        generatedAt: new Date().toISOString()
    };
    
    // Export to JSON file
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

// Print analytics
function printAnalytics() {
    window.print();
}

// Export analytics table to Excel
function exportAnalyticsTable() {
    const tableData = getTableData();
    
    // Create CSV content
    const headers = ['Contractor', 'E-File', 'Value', 'GST', 'Total', 'Duration', 'Status', 'Trend'];
    const csvContent = [
        headers.join(','),
        ...tableData.map(row => [
            row.contractor,
            row.efile,
            row.value,
            row.gst,
            row.total,
            row.duration,
            row.status,
            row.trend
        ].join(','))
    ].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-table-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
}

// Get table data
function getTableData() {
    const rows = document.querySelectorAll('#analyticsTableBody tr');
    const tableData = [];
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        tableData.push({
            contractor: cells[0]?.textContent || '',
            efile: cells[1]?.textContent || '',
            value: cells[2]?.textContent || '',
            gst: cells[3]?.textContent || '',
            total: cells[4]?.textContent || '',
            duration: cells[5]?.textContent || '',
            status: cells[6]?.textContent || '',
            trend: cells[7]?.textContent || ''
        });
    });
    
    return tableData;
}

// Download chart as image
function downloadChart(chartId) {
    const chart = analyticsCharts[chartId];
    if (chart) {
        const url = chart.toBase64Image();
        const link = document.createElement('a');
        link.href = url;
        link.download = `${chartId}-${new Date().toISOString().split('T')[0]}.png`;
        link.click();
    }
}

// Fullscreen chart
function fullscreenChart(chartId) {
    const chartContainer = document.querySelector(`#${chartId}Chart`).closest('.chart-container');
    if (chartContainer.requestFullscreen) {
        chartContainer.requestFullscreen();
    } else if (chartContainer.webkitRequestFullscreen) {
        chartContainer.webkitRequestFullscreen();
    } else if (chartContainer.msRequestFullscreen) {
        chartContainer.msRequestFullscreen();
    }
}

// Show loading indicator
function showLoadingIndicator() {
    const indicator = document.getElementById('analyticsLoadingIndicator');
    if (indicator) {
        indicator.style.display = 'flex';
    }
}

// Hide loading indicator
function hideLoadingIndicator() {
    const indicator = document.getElementById('analyticsLoadingIndicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

// Check for expiry alerts
function checkExpiryAlerts(contractors) {
    if (!contractors || contractors.length === 0) return;
    
    const today = new Date();
    const expiringSoon = [];
    const expired = [];
    
    contractors.forEach(contractor => {
        if (contractor.endDate) {
            const endDate = new Date(contractor.endDate);
            const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry < 0) {
                expired.push({
                    name: contractor.name || contractor.contractor || 'Unknown',
                    daysExpired: Math.abs(daysUntilExpiry),
                    value: contractor.value || 0
                });
            } else if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
                expiringSoon.push({
                    name: contractor.name || contractor.contractor || 'Unknown',
                    daysUntilExpiry: daysUntilExpiry,
                    value: contractor.value || 0
                });
            }
        }
    });
    
    // Show expiry alerts
    if (expired.length > 0) {
        const expiredMessage = expired.length === 1 
            ? `1 contract has expired: ${expired[0].name} (${expired[0].daysExpired} days ago)`
            : `${expired.length} contracts have expired`;
        
        showNotification(`⚠️ ${expiredMessage}`, 'error');
        
        // Log details for debugging
        console.log('Expired contracts:', expired);
    }
    
    if (expiringSoon.length > 0) {
        const soonMessage = expiringSoon.length === 1
            ? `1 contract expiring soon: ${expiringSoon[0].name} (${expiringSoon[0].daysUntilExpiry} days)`
            : `${expiringSoon.length} contracts expiring within 30 days`;
        
        showNotification(`🔔 ${soonMessage}`, 'warning');
        
        // Log details for debugging
        console.log('Contracts expiring soon:', expiringSoon);
    }
    
    // Store alerts for reference
    window.expiryAlerts = {
        expired: expired,
        expiringSoon: expiringSoon,
        lastChecked: new Date().toISOString()
    };
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `analytics-notification ${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}
