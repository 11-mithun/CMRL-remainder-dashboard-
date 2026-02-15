// 2D Charts with Professional Visualization
class Charts3D {
    constructor() {
        this.charts = {};
        this.rotations = {};
        this.animations = {};
        // Don't initialize immediately - wait for DOM to be ready
    }

    async init() {
        await this.setupCharts();
        this.startAnimations();
    }

    async setupCharts() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupCharts());
            return;
        }
        
        // Initialize all 2D charts
        await this.initContractor2D();
        await this.initBill2D();
        await this.initEPBG2D();
        await this.initTimeline2D();
        await this.initNetwork2D();
        await this.initFinancial2D();
    }

    async initContractor2D() {
        // Destroy existing chart if it exists
        if (this.charts.contractor3d) {
            this.charts.contractor3d.destroy();
        }
        
        const canvas = document.getElementById('contractor3dChart');
        if (!canvas) {
            console.log('contractor3dChart canvas not found, skipping initialization');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.log('Could not get 2D context for contractor3dChart, skipping initialization');
            return;
        }
        
        const contractorData = await this.getContractorData();
        
        // Create 2D Bar Chart
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: contractorData.slice(0, 5).map(c => c.label),
                datasets: [{
                    label: 'Contractor Values (₹)',
                    data: contractorData.slice(0, 5).map(c => c.value),
                    backgroundColor: contractorData.slice(0, 5).map(c => c.color),
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
                        text: '2D Contractor Performance',
                        font: { size: 16, weight: 'bold' },
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
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
        
        this.charts.contractor3d = chart;
        console.log('2D Contractor Performance chart initialized');
    }

    async initBill2D() {
        // Destroy existing chart if it exists
        if (this.charts.bill3d) {
            this.charts.bill3d.destroy();
        }
        
        const canvas = document.getElementById('bill3dChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const billData = await this.getBillData();
        
        // Create 2D Line Chart
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: billData.map(b => b.label),
                datasets: [{
                    label: 'Bill Amounts Over Time',
                    data: billData.map(b => b.value),
                    borderColor: '#8a2be2',
                    backgroundColor: 'rgba(138, 43, 226, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '2D Bill Flow Analysis',
                        font: { size: 16, weight: 'bold' },
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
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
        
        this.charts.bill3d = chart;
        console.log('2D Bill Flow Analysis chart initialized');
    }

    async initEPBG2D() {
        // Destroy existing chart if it exists
        if (this.charts.epbg3d) {
            this.charts.epbg3d.destroy();
        }
        
        const canvas = document.getElementById('epbg3dChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const epbgData = await this.getEPBGData();
        
        // Create 2D Doughnut Chart
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: epbgData.map(e => e.label),
                datasets: [{
                    label: 'EPBG Risk Analysis',
                    data: epbgData.map(e => e.value),
                    backgroundColor: epbgData.map(e => e.color),
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
                        text: '2D EPBG Risk Analysis',
                        font: { size: 16, weight: 'bold' },
                        color: '#ffffff'
                    },
                    legend: {
                        display: true,
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        });
        
        this.charts.epbg3d = chart;
        console.log('2D EPBG Risk Analysis chart initialized');
    }

    async initTimeline2D() {
        // Destroy existing chart if it exists
        if (this.charts.timeline3d) {
            this.charts.timeline3d.destroy();
        }
        
        const canvas = document.getElementById('timeline3dChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const timelineData = await this.getTimelineData();
        
        // Create 2D Scatter Chart
        const chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                labels: timelineData.map(t => t.label),
                datasets: [{
                    label: 'Project Duration',
                    data: timelineData.map(t => ({ x: t.index, y: t.value })),
                    backgroundColor: 'rgba(255, 0, 255, 0.1)',
                    borderColor: '#ff00ff',
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '2D Project Timeline',
                        font: { size: 16, weight: 'bold' },
                        color: '#ffffff'
                    },
                    legend: {
                        display: true,
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Projects' },
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        title: { display: true, text: 'Duration (Days)' },
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
        
        this.charts.timeline3d = chart;
        console.log('2D Project Timeline chart initialized');
    }

    async initNetwork2D() {
        // Destroy existing chart if it exists
        if (this.charts.network3d) {
            this.charts.network3d.destroy();
        }
        
        const canvas = document.getElementById('network3dChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const networkData = await this.getNetworkData();
        
        // Create 2D Bubble Chart for Network
        const chart = new Chart(ctx, {
            type: 'bubble',
            data: {
                labels: networkData.nodes.map(n => n.label),
                datasets: [{
                    label: 'Contractor Network',
                    data: networkData.nodes.map((node, index) => ({
                        x: Math.random() * 100,
                        y: Math.random() * 100,
                        r: node.size / 5
                    })),
                    backgroundColor: 'rgba(138, 43, 226, 0.6)',
                    borderColor: '#8a2be2'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '2D Contractor Network',
                        font: { size: 16, weight: 'bold' },
                        color: '#ffffff'
                    },
                    legend: {
                        display: true,
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Network Width' },
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        title: { display: true, text: 'Network Height' },
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
        
        this.charts.network3d = chart;
        console.log('2D Contractor Network chart initialized');
    }

    async initFinancial2D() {
        // Destroy existing chart if it exists
        if (this.charts.financial3d) {
            this.charts.financial3d.destroy();
        }
        
        const canvas = document.getElementById('financial3dChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const financialData = await this.getFinancialData();
        
        // Create 2D Pie Chart
        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: financialData.map(f => f.label),
                datasets: [{
                    label: 'Financial Distribution',
                    data: financialData.map(f => f.value),
                    backgroundColor: financialData.map(f => f.color),
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
                        text: '2D Financial Dashboard',
                        font: { size: 16, weight: 'bold' },
                        color: '#ffffff'
                    },
                    legend: {
                        display: true,
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        });
        
        this.charts.financial3d = chart;
        console.log('2D Financial Dashboard chart initialized');
    }

    async getContractorData() {
        // Get real contractor data from KPI dashboard
        if (window.kpiDashboard && window.kpiDashboard.data) {
            try {
                const contractorData = await window.kpiDashboard.getContractorData();
                console.log('Using real contractor data for 3D charts:', contractorData.length, 'contractors');
                
                return contractorData.map((contractor, index) => ({
                    label: contractor.name,
                    value: contractor.value,
                    color: contractor.status === 'Active' ? '#4ecdc4' : '#ff6b6b',
                    z: Math.random() * 100
                }));
            } catch (error) {
                console.error('Error getting contractor data from KPI dashboard:', error);
            }
        }
        
        // Fallback to sample data
        console.log('Using sample contractor data');
        return [
            { label: 'Tech Corp', value: 850000, color: '#4ecdc4', z: 75 },
            { label: 'Build Co', value: 620000, color: '#45b7d1', z: 60 },
            { label: 'Data Systems', value: 450000, color: '#96ceb4', z: 45 },
            { label: 'Cloud Services', value: 780000, color: '#feca57', z: 90 },
            { label: 'Security Pro', value: 320000, color: '#ff6b6b', z: 30 }
        ];

    getBillData() {
        // Get real bill data from KPI dashboard
        if (window.kpiDashboard && window.kpiDashboard.data) {
            try {
                const billData = window.kpiDashboard.getBillData();
                console.log('Using real bill data for 2D charts:', billData);
                
                // Handle both object and array formats
                if (Array.isArray(billData)) {
                    return billData.map(bill => ({
                        label: bill.billNumber || 'Bill-' + bill.id,
                        value: bill.amount || bill.value || 0
                    }));
                } else if (billData && typeof billData === 'object') {
                    // Handle object format with totalBills and totalValue
                    const bills = [];
                    for (let i = 1; i <= billData.totalBills; i++) {
                        bills.push({
                            label: 'Bill-' + i,
                            value: Math.floor((billData.totalValue || 0).replace(/[^0-9]/g, '') / billData.totalBills)
                        });
                    }
                    return bills;
                }
                
                // Fallback to sample data
                console.log('Using sample bill data');
                return [
                    { label: 'Bill-1', value: 50000 },
                    { label: 'Bill-2', value: 75000 },
                    { label: 'Bill-3', value: 120000 },
                    { label: 'Bill-4', value: 95000 },
                    { label: 'Bill-5', value: 45000 }
                ];
            } catch (error) {
                console.error('Error getting bill data from KPI dashboard:', error);
                // Return sample data on error
                return [
                    { label: 'Bill-1', value: 50000 },
                    { label: 'Bill-2', value: 75000 },
                    { label: 'Bill-3', value: 120000 },
                    { label: 'Bill-4', value: 95000 },
                    { label: 'Bill-5', value: 45000 }
                ];
            }
        }
        
        // Fallback if KPI dashboard not available
        console.log('Using sample bill data (fallback)');
        return [
            { label: 'Bill-1', value: 50000 },
            { label: 'Bill-2', value: 75000 },
            { label: 'Bill-3', value: 120000 },
            { label: 'Bill-4', value: 95000 },
            { label: 'Bill-5', value: 45000 }
        ];
    }

    async getEPBGData() {
        // Get real EPBG data from KPI dashboard
        if (window.kpiDashboard && window.kpiDashboard.data) {
            try {
                const epbgData = await window.kpiDashboard.getEPBGData();
                console.log('Using real EPBG data for 3D charts:', epbgData.length, 'entries');
                
                return epbgData.map((epbg, index) => {
                    const risk = this.calculateRisk(epbg.bgValidity);
                    return {
                        label: `BG-${index + 1}`,
                        value: epbg.bgAmount,
                        color: risk.color,
                        z: risk.level * 30
                    };
                });
            } catch (error) {
                console.error('Error getting EPBG data from KPI dashboard:', error);
            }
        }
        
        // Fallback to sample data
        console.log('Using sample EPBG data');
        return [
            { label: 'BG-001', value: 500000, color: '#4ecdc4', z: 20 },
            { label: 'BG-002', value: 750000, color: '#feca57', z: 40 },
            { label: 'BG-003', value: 300000, color: '#ff6b6b', z: 80 },
            { label: 'BG-004', value: 900000, color: '#48dbfb', z: 10 }
        ];
    }

    getTimelineData() {
        // Get timeline data
        const data = [];
        const events = ['Contract Start', 'Milestone 1', 'Milestone 2', 'Delivery', 'Payment'];
        
        events.forEach((event, index) => {
            data.push({
                label: event,
                x: index * 30,
                y: Math.random() * 100,
                z: Math.random() * 50,
                color: '#ff00ff'
            });
        });
        
        return data;
    }

    getNetworkData() {
        // Get contractor network data
        const nodes = [];
        const connections = [];
        
        // Create nodes
        for (let i = 0; i < 8; i++) {
            nodes.push({
                id: i,
                label: `Node ${i + 1}`,
                x: Math.cos(i * Math.PI / 4) * 100,
                y: Math.sin(i * Math.PI / 4) * 100,
                z: Math.random() * 50 - 25,
                color: '#8a2be2',
                size: Math.random() * 20 + 10
            });
        }
        
        // Create connections
        for (let i = 0; i < 12; i++) {
            connections.push({
                from: Math.floor(Math.random() * 8),
                to: Math.floor(Math.random() * 8),
                strength: Math.random()
            });
        }
        
        return { nodes, connections };
    }

    getFinancialData() {
        // Get financial data
        const data = [
            { label: 'Contractors', value: 35, color: '#ff6b6b' },
            { label: 'Bills', value: 25, color: '#4ecdc4' },
            { label: 'EPBG', value: 20, color: '#45b7d1' },
            { label: 'Materials', value: 15, color: '#96ceb4' },
            { label: 'Labor', value: 5, color: '#feca57' }
        ];
        
        return data;
    }

    calculateRisk(validityDate) {
        if (!validityDate) return { level: 50, color: '#feca57' };
        
        const validity = new Date(validityDate);
        const today = new Date();
        const daysUntilExpiry = (validity - today) / (1000 * 60 * 60 * 24);
        
        if (daysUntilExpiry < 0) return { level: 90, color: '#ff6b6b' };
        if (daysUntilExpiry < 30) return { level: 70, color: '#feca57' };
        if (daysUntilExpiry < 90) return { level: 40, color: '#48dbfb' };
        return { level: 20, color: '#4ecdc4' };
    }

    startAnimations() {
        // Auto-rotate charts
        setInterval(() => {
            Object.keys(this.charts).forEach(chartId => {
                if (this.rotations[chartId]) {
                    this.rotations[chartId].y += 0.5;
                    this.charts[chartId].updateRotation(this.rotations[chartId]);
                }
            });
        }, 50);
    }
}

// Initialize charts when script loads
window.addEventListener('load', () => {
    console.log('Charts3D script loaded');
    window.charts3D = new Charts3D();
});
            const rotated = this.rotatePoint(x, y, z);
            const size = 8 + (z / 50) * 12;
            
            // Draw 3D sphere
            this.draw3DSphere(rotated.x, rotated.y, size, item.color);
        });
    }

    draw3DSphere(x, y, radius, color) {
        const { ctx } = this;
        
        // Draw sphere with gradient
        const gradient = ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
        gradient.addColorStop(0, this.lightenColor(color, 40));
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, this.darkenColor(color, 40));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    drawNetwork3D() {
        const { width, height } = this.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Draw connections
        this.ctx.strokeStyle = 'rgba(138, 43, 226, 0.3)';
        this.ctx.lineWidth = 1;
        
        this.data.connections.forEach(conn => {
            const fromNode = this.data.nodes[conn.from];
            const toNode = this.data.nodes[conn.to];
            
            if (fromNode && toNode) {
                const from = this.rotatePoint(centerX + fromNode.x, centerY + fromNode.y, fromNode.z);
                const to = this.rotatePoint(centerX + toNode.x, centerY + toNode.y, toNode.z);
                
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();
            }
        });
        
        // Draw nodes
        this.data.nodes.forEach(node => {
            const x = centerX + node.x;
            const y = centerY + node.y;
            const z = node.z;
            
            const rotated = this.rotatePoint(x, y, z);
            
            this.draw3DSphere(rotated.x, rotated.y, node.size / 2, node.color);
        });
    }

    drawPie3D() {
        const { width, height } = this.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 80;
        const depth = 30;
        
        let currentAngle = -Math.PI / 2;
        const total = this.data.reduce((sum, item) => sum + item.value, 0);
        
        this.data.forEach(item => {
            const sliceAngle = (item.value / total) * Math.PI * 2;
            
            // Draw pie slice
            this.draw3DPieSlice(centerX, centerY, radius, depth, currentAngle, currentAngle + sliceAngle, item.color);
            
            currentAngle += sliceAngle;
        });
    }

    draw3DPieSlice(centerX, centerY, radius, depth, startAngle, endAngle, color) {
        const { ctx } = this;
        
        // Draw top face
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
        
        // Draw side face
        ctx.fillStyle = this.darkenColor(color, 20);
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(startAngle) * radius, centerY + Math.sin(startAngle) * radius);
        ctx.lineTo(centerX + Math.cos(startAngle) * radius, centerY + Math.sin(startAngle) * radius + depth);
        ctx.lineTo(centerX + Math.cos(endAngle) * radius, centerY + Math.sin(endAngle) * radius + depth);
        ctx.lineTo(centerX + Math.cos(endAngle) * radius, centerY + Math.sin(endAngle) * radius);
        ctx.closePath();
        ctx.fill();
    }

    rotatePoint(x, y, z) {
        const { x: rx, y: ry, z: rz } = this.rotation;
        
        // Convert to radians
        const radX = rx * Math.PI / 180;
        const radY = ry * Math.PI / 180;
        const radZ = rz * Math.PI / 180;
        
        // Rotate around X axis
        let y1 = y * Math.cos(radX) - z * Math.sin(radX);
        let z1 = y * Math.sin(radX) + z * Math.cos(radX);
        
        // Rotate around Y axis
        let x1 = x * Math.cos(radY) + z1 * Math.sin(radY);
        let z2 = -x * Math.sin(radY) + z1 * Math.cos(radY);
        
        // Rotate around Z axis
        let x2 = x1 * Math.cos(radZ) - y1 * Math.sin(radZ);
        let y2 = x1 * Math.sin(radZ) + y1 * Math.cos(radZ);
        
        return { x: x2, y: y2, z: z2 };
    }

    drawTitle() {
        const { width, height } = this.canvas;
        const { ctx } = this;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.options.title, width / 2, height - 10);
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    darkenColor(color, percent) {
        return this.lightenColor(color, -percent);
    }

    interpolateColor(color1, color2, factor) {
        const c1 = parseInt(color1.replace('#', ''), 16);
        const c2 = parseInt(color2.replace('#', ''), 16);
        
        const r1 = (c1 >> 16) & 255;
        const g1 = (c1 >> 8) & 255;
        const b1 = c1 & 255;
        
        const r2 = (c2 >> 16) & 255;
        const g2 = (c2 >> 8) & 255;
        const b2 = c2 & 255;
        
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
}

// Global functions for chart controls
window.rotateChart = function(chartId) {
    if (window.charts3D && window.charts3D.charts[chartId]) {
        const chart = window.charts3D.charts[chartId];
        window.charts3D.rotations[chartId].y += 45;
        chart.updateRotation(window.charts3D.rotations[chartId]);
    }
};

window.resetChart = function(chartId) {
    if (window.charts3D && window.charts3D.charts[chartId]) {
        const chart = window.charts3D.charts[chartId];
        const defaultRotations = {
            contractor3d: { x: -20, y: 45, z: 0 },
            bill3d: { x: -30, y: 30, z: 0 },
            epbg3d: { x: -25, y: 60, z: 0 },
            timeline3d: { x: -35, y: 45, z: 0 },
            network3d: { x: -20, y: 30, z: 0 },
            financial3d: { x: -15, y: 0, z: 0 }
        };
        
        window.charts3D.rotations[chartId] = defaultRotations[chartId];
        chart.updateRotation(window.charts3D.rotations[chartId]);
    }
};

// Initialize charts when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.charts3D = new Charts3D();
});
