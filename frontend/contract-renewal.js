// Contract Renewal System JavaScript
let contractsData = [];
let currentFilter = 'all';
let currentContract = null;

// Initialize the contract renewal system
document.addEventListener('DOMContentLoaded', function() {
    initializeContractRenewal();
    setupMobileMenu(); // Add mobile menu functionality
    setupSidebarToggle(); // Add sidebar toggle functionality
    initializeUserProfile(); // Initialize user profile
});

function initializeContractRenewal() {
    loadExpiringContracts();
    setupEventListeners();
    updateStats();
}

// Initialize user profile
function initializeUserProfile() {
    // Get user data from localStorage or Auth
    const user = Auth ? Auth.getUser() : JSON.parse(localStorage.getItem('user'));
    
    if (user) {
        // Update profile avatars with user's initial
        const userAvatar = document.getElementById('userAvatar');
        const userAvatarLarge = document.getElementById('userAvatarLarge');
        
        if (userAvatar) {
            userAvatar.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
        }
        
        if (userAvatarLarge) {
            userAvatarLarge.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
        }
        
        // Update user name and role
        const userNameDropdown = document.getElementById('userNameDropdown');
        const userRoleDropdown = document.getElementById('userRoleDropdown');
        
        if (userNameDropdown) {
            userNameDropdown.textContent = user.name || 'User';
        }
        
        if (userRoleDropdown) {
            userRoleDropdown.textContent = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';
        }
    }
}

// Setup sidebar toggle functionality (from bill-tracker)
function setupSidebarToggle() {
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebarToggleBtn && sidebar && mainContent) {
        sidebarToggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            
            // Update icon
            const icon = sidebarToggleBtn.querySelector('i');
            if (sidebar.classList.contains('collapsed')) {
                icon.className = 'fas fa-bars';
            } else {
                icon.className = 'fas fa-chevron-left';
            }
        });
    }
}

// Mobile menu functionality (from script.js)
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');

    if (mobileMenuToggle && sidebar && mobileOverlay) {
        // Toggle menu
        mobileMenuToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            sidebar.classList.toggle('mobile-open');
            mobileMenuToggle.classList.toggle('active');
            mobileOverlay.classList.toggle('active');

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
        mobileOverlay.addEventListener('click', function () {
            sidebar.classList.remove('mobile-open');
            mobileMenuToggle.classList.remove('active');
            mobileOverlay.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.className = 'fas fa-bars';
            document.body.style.overflow = '';
        });

        // Close menu when clicking nav items on mobile
        const navItems = sidebar.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function () {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('mobile-open');
                    mobileMenuToggle.classList.remove('active');
                    mobileOverlay.classList.remove('active');
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
                mobileOverlay.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                icon.className = 'fas fa-bars';
                document.body.style.overflow = '';
            }
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterContracts(e.target.value);
        });
    }

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            displayContracts();
        });
    });

    // Analysis tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchAnalysisTab(tabName);
        });
    });

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
        });
    }
    
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
        });
    }
}

// Load expiring contracts from API
async function loadExpiringContracts() {
    const grid = document.getElementById('contractsGrid');
    if (!grid) return;

    // Show loading state
    grid.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading contracts...</p>
        </div>
    `;

    try {
        contractsData = await contractRenewalAPI.getExpiringContracts();
        displayContracts();
        updateStats();
    } catch (error) {
        console.error('Error loading contracts:', error);
        // Load demo data for prototype
        loadDemoData();
    }
}

// Load demo data for prototype
function loadDemoData() {
    contractsData = [
        {
            id: 1,
            contractor_name: 'Tech Solutions Pvt Ltd',
            efile: 'EFILE-2024-001',
            end_date: '2024-03-15',
            value: 50000,
            days_until_expiry: 5,
            urgency: 'critical',
            description: 'Software maintenance contract',
            source: 'contractor_list'
        },
        {
            id: 2,
            contractor_name: 'Network Services Inc',
            efile: 'EFILE-2024-002',
            end_date: '2024-03-25',
            value: 75000,
            days_until_expiry: 15,
            urgency: 'warning',
            description: 'Network infrastructure support',
            source: 'bill_tracker'
        },
        {
            id: 3,
            contractor_name: 'Security Systems Co',
            efile: 'EFILE-2024-003',
            end_date: '2024-04-10',
            value: 30000,
            days_until_expiry: 31,
            urgency: 'normal',
            description: 'Security services contract',
            source: 'contractor_list'
        },
        {
            id: 4,
            contractor_name: 'CloudTech Solutions',
            efile: 'EFILE-2024-004',
            end_date: '2024-03-08',
            value: 120000,
            days_until_expiry: 2,
            urgency: 'critical',
            description: 'Cloud hosting and services',
            source: 'bill_tracker'
        },
        {
            id: 5,
            contractor_name: 'Data Analytics Pro',
            efile: 'EFILE-2024-005',
            end_date: '2024-03-20',
            value: 45000,
            days_until_expiry: 10,
            urgency: 'critical',
            description: 'Business intelligence and analytics platform',
            source: 'contractor_list'
        }
    ];
    displayContracts();
    updateStats();
}

// Display contracts in the grid
function displayContracts() {
    const grid = document.getElementById('contractsGrid');
    if (!grid) return;

    let filteredContracts = contractsData;
    
    // Apply filter
    if (currentFilter !== 'all') {
        filteredContracts = contractsData.filter(contract => {
            if (currentFilter === 'critical') return contract.urgency === 'critical';
            if (currentFilter === 'warning') return contract.urgency === 'warning';
            if (currentFilter === 'renewed') return contract.status === 'renewed';
            return true;
        });
    }

    if (filteredContracts.length === 0) {
        grid.innerHTML = `
            <div class="no-contracts">
                <i class="fas fa-inbox"></i>
                <h3>No contracts found</h3>
                <p>No contracts match the current filter criteria.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredContracts.map(contract => createContractCard(contract)).join('');
}

// Create contract card HTML
function createContractCard(contract) {
    const urgencyClass = getUrgencyClass(contract.urgency);
    const urgencyIcon = getUrgencyIcon(contract.urgency);
    const urgencyText = getUrgencyText(contract.urgency);
    const sourceBadge = getSourceBadge(contract.source);
    
    return `
        <div class="contract-card ${urgencyClass}">
            <div class="card-header">
                <div class="contract-info">
                    <h3 class="contract-name">${contract.contractor_name}</h3>
                    <p class="contract-efile">${contract.efile} ${sourceBadge}</p>
                </div>
                <div class="urgency-badge">
                    <i class="${urgencyIcon}"></i>
                    <span>${urgencyText}</span>
                </div>
            </div>
            
            <div class="card-body">
                <div class="contract-details">
                    <div class="detail-item">
                        <i class="fas fa-calendar-alt"></i>
                        <div>
                            <label>End Date</label>
                            <span>${formatDate(contract.end_date)}</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <label>Days Until Expiry</label>
                            <span class="${contract.days_until_expiry <= 7 ? 'text-danger' : 'text-warning'}">
                                ${contract.days_until_expiry} days
                            </span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-dollar-sign"></i>
                        <div>
                            <label>Contract Value</label>
                            <span>$${(contract.value || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="contract-description">
                    <p>${contract.description || 'No description available'}</p>
                </div>
            </div>
            
            <div class="card-actions">
                <button class="btn-primary btn-sm" onclick="openAIAnalysis(${contract.id})">
                    <i class="fas fa-brain"></i> AI Analysis
                </button>
                <button class="btn-success btn-sm" onclick="openRenewal(${contract.id})">
                    <i class="fas fa-sync-alt"></i> Renew
                </button>
                <button class="btn-secondary btn-sm" onclick="viewContractDetails(${contract.id})">
                    <i class="fas fa-eye"></i> Details
                </button>
            </div>
        </div>
    `;
}

// Get urgency class for styling
function getUrgencyClass(urgency) {
    switch(urgency) {
        case 'critical': return 'urgency-critical';
        case 'warning': return 'urgency-warning';
        default: return 'urgency-normal';
    }
}

// Get urgency icon
function getUrgencyIcon(urgency) {
    switch(urgency) {
        case 'critical': return 'fas fa-exclamation-triangle';
        case 'warning': return 'fas fa-clock';
        default: return 'fas fa-check-circle';
    }
}

// Get urgency text
function getUrgencyText(urgency) {
    switch(urgency) {
        case 'critical': return 'Critical';
        case 'warning': return 'Warning';
        default: return 'Normal';
    }
}

// Get source badge
function getSourceBadge(source) {
    switch(source) {
        case 'contractor_list': return '<span class="source-badge contractor-list">Contractor List</span>';
        case 'bill_tracker': return '<span class="source-badge bill-tracker">Bill Tracker</span>';
        default: return '<span class="source-badge">Unknown</span>';
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Filter contracts based on search
function filterContracts(searchTerm) {
    const filteredContracts = contractsData.filter(contract => {
        const searchLower = searchTerm.toLowerCase();
        return contract.contractor_name.toLowerCase().includes(searchLower) ||
               contract.efile.toLowerCase().includes(searchLower) ||
               (contract.description && contract.description.toLowerCase().includes(searchLower));
    });
    
    displayFilteredContracts(filteredContracts);
}

// Display filtered contracts
function displayFilteredContracts(contracts) {
    const grid = document.getElementById('contractsGrid');
    if (!grid) return;

    if (contracts.length === 0) {
        grid.innerHTML = `
            <div class="no-contracts">
                <i class="fas fa-search"></i>
                <h3>No contracts found</h3>
                <p>No contracts match your search criteria.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = contracts.map(contract => createContractCard(contract)).join('');
}

// Update statistics
function updateStats() {
    const criticalCount = contractsData.filter(c => c.urgency === 'critical').length;
    const warningCount = contractsData.filter(c => c.urgency === 'warning').length;
    const renewedCount = contractsData.filter(c => c.status === 'renewed').length;

    updateStatElement('criticalCount', criticalCount);
    updateStatElement('warningCount', warningCount);
    updateStatElement('renewedCount', renewedCount);
}

// Update stat element
function updateStatElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// Open AI Analysis Modal
function openAIAnalysis(contractId) {
    currentContract = contractsData.find(c => c.id === contractId);
    if (!currentContract) return;

    // Set contract info in modal
    document.getElementById('analysisContractName').textContent = currentContract.contractor_name;
    document.getElementById('analysisContractDetails').textContent = 
        `${currentContract.efile} • Expires: ${formatDate(currentContract.end_date)} • Value: $${currentContract.value.toLocaleString()}`;

    // Open modal
    openModal('aiAnalysisModal');
    
    // Start AI analysis
    performAIAnalysis(contractId);
}

// Perform AI Analysis
async function performAIAnalysis(contractId) {
    const analysisTypes = ['risk', 'compliance', 'negotiation', 'renewal'];
    
    // Show loading states for all tabs
    analysisTypes.forEach(type => {
        const elementId = `${type}Analysis`;
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="loading-content">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Analyzing ${type}...</p>
                </div>
            `;
        }
    });
    
    // Perform analysis for each type with delay for demo
    for (const type of analysisTypes) {
        await performSingleAnalysis(contractId, type);
        // Add delay for demo effect
        await new Promise(resolve => setTimeout(resolve, 800));
    }
}

// Perform single analysis type
async function performSingleAnalysis(contractId, analysisType) {
    try {
        const result = await contractRenewalAPI.analyzeContract(contractId, analysisType);
        displayAnalysisResult(analysisType, result);
    } catch (error) {
        console.error('Error performing analysis:', error);
        // Use demo data for prototype
        displayDemoAnalysis(analysisType);
    }
}

// Display demo analysis (for prototype)
function displayDemoAnalysis(analysisType) {
    const demoData = {
        risk: {
            risk_level: 'Medium',
            factors: [
                'Contract expires in less than 30 days',
                'No clear renewal terms specified',
                'Payment terms need clarification'
            ],
            recommendations: [
                'Initiate renewal process immediately',
                'Clarify payment terms before renewal',
                'Consider longer contract term for stability'
            ]
        },
        compliance: {
            status: 'Mostly Compliant',
            issues: [
                'Missing digital signature clause',
                'No force majeure clause present'
            ],
            recommendations: [
                'Add standard compliance clauses',
                'Include legal review in renewal process'
            ]
        },
        negotiation: {
            leverage_points: [
                'Long-term relationship with vendor',
                'Market rates have decreased 5% since last contract',
                'Multiple vendors available for similar services'
            ],
            suggested_terms: [
                'Request 5-10% discount on renewal',
                'Extend contract term to 24 months',
                'Include performance-based incentives'
            ]
        },
        renewal: {
            recommendation: 'Renew with Modifications',
            reasoning: 'Vendor provides good service but terms can be improved',
            suggested_changes: [
                'Reduce contract value by 8%',
                'Add quarterly review meetings',
                'Include service level agreements'
            ]
        }
    };

    setTimeout(() => {
        displayAnalysisResult(analysisType, demoData[analysisType]);
    }, 1500);
}

// Display analysis result
function displayAnalysisResult(analysisType, result) {
    const elementId = `${analysisType}Analysis`;
    const element = document.getElementById(elementId);
    
    if (!element) return;

    let html = '';
    
    switch(analysisType) {
        case 'risk':
            html = `
                <div class="analysis-result">
                    <div class="risk-level ${result.risk_level?.toLowerCase() || 'medium'}">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Risk Level: ${result.risk_level || 'Medium'}</span>
                    </div>
                    <div class="analysis-section">
                        <h5>Risk Factors:</h5>
                        <ul>
                            ${(result.factors || []).map(factor => `<li>${factor}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="analysis-section">
                        <h5>Recommendations:</h5>
                        <ul>
                            ${(result.recommendations || []).map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            break;
        case 'compliance':
            html = `
                <div class="analysis-result">
                    <div class="compliance-status">
                        <i class="fas fa-shield-alt"></i>
                        <span>Status: ${result.status || 'Mostly Compliant'}</span>
                    </div>
                    <div class="analysis-section">
                        <h5>Issues Found:</h5>
                        <ul>
                            ${(result.issues || []).map(issue => `<li>${issue}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="analysis-section">
                        <h5>Recommendations:</h5>
                        <ul>
                            ${(result.recommendations || []).map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            break;
        case 'negotiation':
            html = `
                <div class="analysis-result">
                    <div class="negotiation-points">
                        <h5>Leverage Points:</h5>
                        <ul>
                            ${(result.leverage_points || []).map(point => `<li>${point}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="analysis-section">
                        <h5>Suggested Terms:</h5>
                        <ul>
                            ${(result.suggested_terms || []).map(term => `<li>${term}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            break;
        case 'renewal':
            html = `
                <div class="analysis-result">
                    <div class="renewal-recommendation">
                        <i class="fas fa-sync-alt"></i>
                        <span>${result.recommendation || 'Renew with Modifications'}</span>
                    </div>
                    <div class="analysis-section">
                        <h5>Reasoning:</h5>
                        <p>${result.reasoning || 'Vendor provides good service but terms can be improved'}</p>
                    </div>
                    <div class="analysis-section">
                        <h5>Suggested Changes:</h5>
                        <ul>
                            ${(result.suggested_changes || []).map(change => `<li>${change}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            break;
    }
    
    element.innerHTML = html;
}

// Switch analysis tab
function switchAnalysisTab(tabName) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    const activeTab = document.getElementById(`${tabName}-tab`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

// Open Renewal Modal
function openRenewal(contractId) {
    currentContract = contractsData.find(c => c.id === contractId);
    if (!currentContract) return;

    // Set contract info in modal
    document.getElementById('renewalContractName').textContent = currentContract.contractor_name;
    document.getElementById('currentEndDate').textContent = formatDate(currentContract.end_date);
    document.getElementById('contractValue').textContent = `$${currentContract.value.toLocaleString()}`;
    document.getElementById('daysUntilExpiry').textContent = `${currentContract.days_until_expiry} days`;
    
    // Set default renewal values
    const endDate = new Date(currentContract.end_date);
    endDate.setFullYear(endDate.getFullYear() + 1); // Default 1 year extension
    document.getElementById('newEndDate').value = endDate.toISOString().split('T')[0];
    document.getElementById('renewalAmount').value = currentContract.value;

    // Open modal
    openModal('renewalModal');
}

// Process Renewal
async function processRenewal() {
    if (!currentContract) return;

    const userAction = document.querySelector('input[name="userAction"]:checked').value;
    const newEndDate = document.getElementById('newEndDate').value;
    const renewalAmount = document.getElementById('renewalAmount').value;
    const renewalTerms = document.getElementById('renewalTerms').value;

    if (userAction === 'renew' && (!newEndDate || !renewalAmount)) {
        alert('Please fill in all required fields for renewal.');
        return;
    }

    try {
        const result = await contractRenewalAPI.processRenewal({
            contract_id: currentContract.id,
            user_action: userAction,
            new_end_date: newEndDate,
            renewal_amount: renewalAmount,
            renewal_terms: renewalTerms
        });
        
        if (userAction === 'renew') {
            // Open payment modal for prototype
            document.getElementById('paymentAmount').textContent = `$${parseFloat(renewalAmount).toLocaleString()}`;
            closeModal('renewalModal');
            openModal('paymentModal');
        } else {
            // Contract cancelled
            alert('Contract has been cancelled successfully.');
            closeModal('renewalModal');
            loadExpiringContracts(); // Reload contracts
        }
    } catch (error) {
        console.error('Error processing renewal:', error);
        // Handle prototype success
        if (userAction === 'renew') {
            document.getElementById('paymentAmount').textContent = `$${parseFloat(renewalAmount).toLocaleString()}`;
            closeModal('renewalModal');
            openModal('paymentModal');
        } else {
            alert('Contract has been cancelled successfully (Demo Mode).');
            closeModal('renewalModal');
            loadExpiringContracts();
        }
    }
}

// Process Payment (Prototype)
async function processPayment() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    try {
        const result = await contractRenewalAPI.processPayment({
            payment_method: paymentMethod,
            amount: document.getElementById('paymentAmount').textContent
        });
        
        alert('Payment processed successfully (Demo Mode)! Contract renewal confirmed.');
        closeModal('paymentModal');
        loadExpiringContracts(); // Reload contracts
    } catch (error) {
        console.error('Error processing payment:', error);
        // Handle prototype success
        alert('Payment processed successfully (Demo Mode)! Contract renewal confirmed.');
        closeModal('paymentModal');
        loadExpiringContracts();
    }
}

// View Contract Details
function viewContractDetails(contractId) {
    const contract = contractsData.find(c => c.id === contractId);
    if (!contract) return;

    alert(`Contract Details:\n\nName: ${contract.contractor_name}\nEFILE: ${contract.efile}\nEnd Date: ${formatDate(contract.end_date)}\nValue: $${contract.value.toLocaleString()}\nDescription: ${contract.description || 'No description'}`);
}

// Download Analysis Report
function downloadAnalysisReport() {
    if (!currentContract) return;

    const reportContent = generateAnalysisReport(currentContract);
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-analysis-${currentContract.efile}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Generate Analysis Report
function generateAnalysisReport(contract) {
    return `
Contract Analysis Report
========================

Contract Information:
- Name: ${contract.contractor_name}
- EFILE: ${contract.efile}
- End Date: ${formatDate(contract.end_date)}
- Days Until Expiry: ${contract.days_until_expiry}
- Contract Value: $${contract.value.toLocaleString()}
- Urgency Level: ${getUrgencyText(contract.urgency)}

AI Analysis Summary:
==================

Risk Analysis:
- Risk Level: Medium
- Key Factors: Contract expires soon, renewal terms unclear
- Recommendations: Initiate renewal process immediately

Compliance Check:
- Status: Mostly Compliant
- Issues: Missing some standard clauses
- Recommendations: Add compliance clauses before renewal

Negotiation Tips:
- Leverage: Long-term vendor relationship
- Suggested: Request 5-10% discount
- Terms: Consider longer contract period

Renewal Recommendation:
- Action: Renew with modifications
- Changes: Reduce cost, add SLAs
- Timeline: Immediate action required

Generated on: ${new Date().toLocaleString()}
This is a prototype AI analysis report.
    `.trim();
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Close modals on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const activeModals = document.querySelectorAll('.modal-overlay.active');
        activeModals.forEach(modal => {
            closeModal(modal.id);
        });
    }
});

// Close modals on outside click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal(e.target.id);
    }
});
