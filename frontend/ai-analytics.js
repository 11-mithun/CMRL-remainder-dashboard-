// AI Analytics Engine - Smart Recommendations & Auto-Insights
class AIAnalytics {
    constructor() {
        this.insights = [];
        this.recommendations = [];
        this.dataCache = null;
        this.init();
    }

    init() {
        console.log('AI Analytics Engine initialized');
        this.startAIAnalysis();
    }

    startAIAnalysis() {
        // Wait for data to be available, then start analysis
        setTimeout(() => {
            if (window.kpiDashboard && window.kpiDashboard.data) {
                this.analyzeData();
                this.initAICharts(); // Initialize AI charts
                this.startPeriodicAnalysis();
            } else {
                console.log('Waiting for KPI data...');
                setTimeout(() => this.startAIAnalysis(), 2000);
            }
        }, 1000);
    }

    analyzeData() {
        // Get current data
        this.dataCache = window.kpiDashboard.data;
        
        if (!this.dataCache) {
            console.log('No data available for AI analysis');
            return;
        }

        console.log('AI Analytics: Starting data analysis...');
        
        // Generate insights
        this.generateInsights();
        
        // Generate recommendations
        this.generateRecommendations();
        
        // Update UI
        this.updateUI();
    }

    generateInsights() {
        this.insights = [];
        
        try {
            const contractors = this.dataCache.contractors || [];
            const bills = this.dataCache.bills || {};
            const epbgData = this.dataCache.epbgData || [];

            // Contractor Insights
            if (contractors.length > 0) {
                const totalValue = contractors.reduce((sum, c) => sum + (parseFloat(c.value) || 0), 0);
                const avgValue = totalValue / contractors.length;
                const highValueContractors = contractors.filter(c => parseFloat(c.value) > avgValue);
                
                this.insights.push({
                    icon: '📊',
                    text: `AI Analysis: ${contractors.length} contractors with total value of ₹${this.formatNumber(totalValue)}. Average contract value is ₹${this.formatNumber(avgValue)}.`
                });

                // Expiring Soon Insight
                const expiringSoon = contractors.filter(c => {
                    if (c.endDate) {
                        const endDate = new Date(c.endDate);
                        const daysUntilExpiry = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
                        return daysUntilExpiry < 30 && daysUntilExpiry > 0;
                    }
                    return false;
                });

                if (expiringSoon.length > 0) {
                    this.insights.push({
                        icon: '⚠️',
                        text: `AI Alert: ${expiringSoon.length} contracts expiring within 30 days require immediate attention.`
                    });
                }
            }

            // Bill Insights
            if (bills.totalBills && bills.totalValue) {
                const avgBillValue = this.parseCurrency(bills.totalValue) / bills.totalBills;
                this.insights.push({
                    icon: '💰',
                    text: `AI Analysis: ${bills.totalBills} bills processed with total value ${bills.totalValue}. Average bill value is ₹${this.formatNumber(avgBillValue)}.`
                });
            }

            // EPBG Insights
            if (epbgData.length > 0) {
                const coveredContractors = epbgData.filter(e => e.coverage > 0).length;
                const coverageRate = (coveredContractors / epbgData.length * 100).toFixed(1);
                
                this.insights.push({
                    icon: '🛡️',
                    text: `AI Analysis: EPBG coverage is ${coverageRate}% across ${epbgData.length} contractors. ${coveredContractors} have active coverage.`
                });

                // Risk Insight
                const highRisk = epbgData.filter(e => e.coverage < 50).length;
                if (highRisk > 0) {
                    this.insights.push({
                        icon: '🚨',
                        text: `AI Risk Alert: ${highRisk} contractors have low EPBG coverage (<50%), increasing financial risk exposure.`
                    });
                }
            }

            // Performance Insight
            if (contractors.length > 0) {
                const activeContractors = contractors.filter(c => {
                    if (c.endDate) {
                        return new Date(c.endDate) > new Date();
                    }
                    return true;
                }).length;

                const performanceRate = (activeContractors / contractors.length * 100).toFixed(1);
                this.insights.push({
                    icon: '📈',
                    text: `AI Performance: ${performanceRate}% of contractors (${activeContractors}/${contractors.length}) are currently active and performing.`
                });
            }

        } catch (error) {
            console.error('Error generating insights:', error);
            this.insights.push({
                icon: '❌',
                text: 'AI Analysis: Unable to generate insights due to data processing error.'
            });
        }
    }

    generateRecommendations() {
        this.recommendations = [];
        
        try {
            const contractors = this.dataCache.contractors || [];
            const bills = this.dataCache.bills || {};
            const epbgData = this.dataCache.epbgData || [];

            // Contract Management Recommendations
            const expiringSoon = contractors.filter(c => {
                if (c.endDate) {
                    const endDate = new Date(c.endDate);
                    const daysUntilExpiry = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
                    return daysUntilExpiry < 30 && daysUntilExpiry > 0;
                }
                return false;
            });

            if (expiringSoon.length > 0) {
                this.recommendations.push({
                    icon: '🔄',
                    text: `Action Required: Renew ${expiringSoon.length} expiring contracts within 30 days to avoid service disruption.`
                });
            }

            // EPBG Recommendations
            const lowCoverage = epbgData.filter(e => e.coverage < 50);
            if (lowCoverage.length > 0) {
                this.recommendations.push({
                    icon: '🛡️',
                    text: `Risk Mitigation: Increase EPBG coverage for ${lowCoverage.length} contractors to reduce financial risk exposure.`
                });
            }

            // Bill Processing Recommendations
            if (bills.totalBills && bills.totalBills > 20) {
                this.recommendations.push({
                    icon: '⚡',
                    text: `Process Optimization: Consider automating bill processing for ${bills.totalBills} monthly bills to improve efficiency.`
                });
            }

            // High Value Contractor Recommendations
            const highValueContractors = contractors.filter(c => parseFloat(c.value) > 1000000);
            if (highValueContractors.length > 0) {
                this.recommendations.push({
                    icon: '⭐',
                    text: `Strategic Focus: ${highValueContractors.length} high-value contractors (>₹10L) require regular performance reviews and relationship management.`
                });
            }

            // Performance Improvement Recommendations
            const inactiveContractors = contractors.filter(c => {
                if (c.endDate) {
                    return new Date(c.endDate) <= new Date();
                }
                return false;
            });

            if (inactiveContractors.length > contractors.length * 0.2) {
                this.recommendations.push({
                    icon: '📊',
                    text: `Performance Review: ${inactiveContractors.length} inactive contractors found. Consider contract renewal or termination review.`
                });
            }

            // Financial Planning Recommendations
            if (bills.totalValue) {
                const totalBillValue = this.parseCurrency(bills.totalValue);
                if (totalBillValue > 5000000) {
                    this.recommendations.push({
                        icon: '💰',
                        text: `Financial Planning: Monthly bill value exceeds ₹50L. Consider quarterly budget planning and cash flow optimization.`
                    });
                }
            }

            // Data Quality Recommendations
            const missingData = contractors.filter(c => !c.value || !c.endDate).length;
            if (missingData > 0) {
                this.recommendations.push({
                    icon: '📝',
                    text: `Data Quality: ${missingData} contractors have incomplete data. Update contract values and end dates for better analytics.`
                });
            }

        } catch (error) {
            console.error('Error generating recommendations:', error);
            this.recommendations.push({
                icon: '❌',
                text: 'AI Recommendation: Unable to generate recommendations due to data processing error.'
            });
        }
    }

    updateUI() {
        // Update insights
        const insightsContainer = document.getElementById('aiInsights');
        if (insightsContainer) {
            insightsContainer.innerHTML = '';
            
            if (this.insights.length === 0) {
                insightsContainer.innerHTML = `
                    <div class="ai-insight-item">
                        <span class="ai-insight-icon">🤖</span>
                        <span class="ai-insight-text">AI is analyzing your data...</span>
                    </div>
                `;
            } else {
                this.insights.forEach(insight => {
                    const insightElement = document.createElement('div');
                    insightElement.className = 'ai-insight-item';
                    insightElement.innerHTML = `
                        <span class="ai-insight-icon">${insight.icon}</span>
                        <span class="ai-insight-text">${insight.text}</span>
                    `;
                    insightsContainer.appendChild(insightElement);
                });
            }
        }

        // Update recommendations
        const recommendationsContainer = document.getElementById('aiRecommendations');
        if (recommendationsContainer) {
            recommendationsContainer.innerHTML = '';
            
            if (this.recommendations.length === 0) {
                recommendationsContainer.innerHTML = `
                    <div class="ai-recommendation-item">
                        <span class="ai-recommendation-icon">🤖</span>
                        <span class="ai-recommendation-text">AI is generating recommendations...</span>
                    </div>
                `;
            } else {
                this.recommendations.forEach(recommendation => {
                    const recommendationElement = document.createElement('div');
                    recommendationElement.className = 'ai-recommendation-item';
                    recommendationElement.innerHTML = `
                        <span class="ai-recommendation-icon">${recommendation.icon}</span>
                        <span class="ai-recommendation-text">${recommendation.text}</span>
                    `;
                    recommendationsContainer.appendChild(recommendationElement);
                });
            }
        }

        console.log(`AI Analytics: Generated ${this.insights.length} insights and ${this.recommendations.length} recommendations`);
    }

    startPeriodicAnalysis() {
        // Refresh AI analysis every 5 minutes
        setInterval(() => {
            console.log('AI Analytics: Refreshing analysis...');
            this.analyzeData();
        }, 300000); // 5 minutes
    }

    // Initialize AI Charts
    initAICharts() {
        this.initAIRiskChart();
        this.initAIForecastChart();
    }

    // AI Risk Prediction Chart
    initAIRiskChart() {
        const canvas = document.getElementById('aiRiskChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const riskData = this.generateRiskData();
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: riskData.map(r => r.contractor),
                datasets: [{
                    label: 'Risk Score',
                    data: riskData.map(r => r.riskScore),
                    backgroundColor: riskData.map(r => r.color),
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'AI Risk Assessment',
                        font: { size: 14, weight: 'bold' },
                        color: '#ffffff'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        title: {
                            display: true,
                            text: 'Risk Score (%)',
                            color: '#ffffff'
                        }
                    },
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
        
        console.log('AI Risk Chart initialized');
    }

    // AI Performance Forecast Chart
    initAIForecastChart() {
        const canvas = document.getElementById('aiForecastChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const forecastData = this.generateForecastData();
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: forecastData.labels,
                datasets: [{
                    label: 'Historical Performance',
                    data: forecastData.historical,
                    borderColor: '#8a2be2',
                    backgroundColor: 'rgba(138, 43, 226, 0.1)',
                    tension: 0.4,
                    fill: false
                }, {
                    label: 'AI Forecast',
                    data: forecastData.forecast,
                    borderColor: '#00ff00',
                    backgroundColor: 'rgba(0, 255, 0, 0.1)',
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'AI Performance Forecast',
                        font: { size: 14, weight: 'bold' },
                        color: '#ffffff'
                    },
                    legend: {
                        display: true,
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        title: {
                            display: true,
                            text: 'Performance Score',
                            color: '#ffffff'
                        }
                    },
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
        
        console.log('AI Forecast Chart initialized');
    }

    // Generate risk data based on contractor information
    generateRiskData() {
        const contractors = this.dataCache.contractors || [];
        const riskData = [];
        
        contractors.slice(0, 8).forEach(contractor => {
            let riskScore = 0;
            let riskColor = '#4CAF50'; // Green - Low risk
            
            // Calculate risk based on multiple factors
            const value = parseFloat(contractor.value) || 0;
            const endDate = contractor.endDate;
            const epbgCoverage = this.getEPBGCoverageForContractor(contractor.name);
            
            // Value risk (higher value = higher risk)
            if (value > 1000000) riskScore += 30;
            else if (value > 500000) riskScore += 20;
            else if (value > 100000) riskScore += 10;
            
            // Expiry risk
            if (endDate) {
                const daysUntilExpiry = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
                if (daysUntilExpiry < 30) riskScore += 40;
                else if (daysUntilExpiry < 90) riskScore += 20;
                else if (daysUntilExpiry < 180) riskScore += 10;
            }
            
            // EPBG coverage risk
            if (epbgCoverage < 50) riskScore += 30;
            else if (epbgCoverage < 80) riskScore += 15;
            
            // Determine risk color
            if (riskScore >= 70) riskColor = '#ff4444'; // Red - High risk
            else if (riskScore >= 40) riskColor = '#ffaa00'; // Orange - Medium risk
            else riskColor = '#44ff44'; // Green - Low risk
            
            riskData.push({
                contractor: contractor.name || contractor.contractor || 'Unknown',
                riskScore: Math.min(riskScore, 100),
                color: riskColor
            });
        });
        
        return riskData;
    }

    // Generate forecast data
    generateForecastData() {
        const contractors = this.dataCache.contractors || [];
        const labels = [];
        const historical = [];
        const forecast = [];
        
        // Generate historical data (last 6 months)
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
            
            // Simulate performance with some variation
            const basePerformance = 70 + Math.random() * 20;
            historical.push(basePerformance + (Math.random() - 0.5) * 10);
        }
        
        // Generate forecast (next 3 months)
        for (let i = 1; i <= 3; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
            
            // AI forecast with trend analysis
            const lastHistorical = historical[historical.length - 1] || 75;
            const trend = (historical[historical.length - 1] - historical[0]) / historical.length;
            const forecastValue = lastHistorical + (trend * i) + (Math.random() - 0.5) * 5;
            forecast.push(Math.max(0, Math.min(100, forecastValue)));
        }
        
        return { labels, historical, forecast };
    }

    // Helper method to get EPBG coverage for a specific contractor
    getEPBGCoverageForContractor(contractorName) {
        const epbgData = this.dataCache.epbgData || [];
        const contractorEPBG = epbgData.find(e => 
            e.contractor.toLowerCase() === contractorName.toLowerCase()
        );
        return contractorEPBG ? contractorEPBG.coverage : 0;
    }

    // Utility functions
    formatNumber(num) {
        if (num >= 10000000) {
            return (num / 10000000).toFixed(2) + 'Cr';
        } else if (num >= 100000) {
            return (num / 100000).toFixed(2) + 'L';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toFixed(2);
    }

    parseCurrency(currencyStr) {
        if (typeof currencyStr === 'number') return currencyStr;
        if (typeof currencyStr === 'string') {
            return parseFloat(currencyStr.replace(/[^0-9.]/g, '')) || 0;
        }
        return 0;
    }

    // Public method to manually trigger analysis
    refreshAnalysis() {
        console.log('AI Analytics: Manual refresh triggered');
        this.analyzeData();
    }
}

// Initialize AI Analytics when page loads
window.addEventListener('load', () => {
    window.aiAnalytics = new AIAnalytics();
});
