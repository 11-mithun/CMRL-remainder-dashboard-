// API configuration
const API_BASE_URL = '/api';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include' // Include cookies for session management
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        // Check for 401 Unauthorized - redirect to login
        if (response.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '/login.html';
            throw new Error('Session expired. Please login again.');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// API functions for Contractor List
const contractorListAPI = {
    async load() {
        try {
            return await apiCall('/contractor-list', 'GET');
        } catch (error) {
            console.error('Failed to load contractor list:', error);
            return [];
        }
    },
    async save(records) {
        try {
            return await apiCall('/contractor-list', 'POST', { records });
        } catch (error) {
            console.error('Failed to save contractor list:', error);
            throw error;
        }
    }
};

// API functions for Bill Tracker
const billTrackerAPI = {
    async load() {
        try {
            return await apiCall('/bill-tracker', 'GET');
        } catch (error) {
            console.error('Failed to load bill tracker:', error);
            return [];
        }
    },
    async save(records) {
        try {
            return await apiCall('/bill-tracker', 'POST', { records });
        } catch (error) {
            console.error('Failed to save bill tracker:', error);
            throw error;
        }
    }
};

// API functions for EPBG
const epbgAPI = {
    async load() {
        try {
            return await apiCall('/epbg', 'GET');
        } catch (error) {
            console.error('Failed to load EPBG:', error);
            return [];
        }
    },
    async save(records) {
        try {
            return await apiCall('/epbg', 'POST', { records });
        } catch (error) {
            console.error('Failed to save EPBG:', error);
            throw error;
        }
    }
};
