// Authentication helper functions
const Auth = {
    async checkAuth() {
        try {
            const response = await fetch('/api/check-auth', {
                credentials: 'include'
            });

            const data = await response.json();

            if (!data.authenticated) {
                // Not authenticated, redirect to login
                window.location.href = '/login.html';
                return false;
            }

            // Store user info
            localStorage.setItem('user', JSON.stringify(data.user));

            // Apply RBAC
            this.applyRBAC(data.user);

            // Apply Theme
            this.applyTheme(data.user);

            return data.user;
        } catch (error) {
            console.error('Auth check error:', error);
            window.location.href = '/login.html';
            return false;
        }
    },

    async logout() {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });

            localStorage.removeItem('user');
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    applyRBAC(user) {
        if (!user) return;

        // Apply role-based access control
        if (user.role === 'viewer') {
            document.body.classList.add('read-only');
            console.log('RBAC: Read-only mode active');
        } else if (user.role === 'admin' || user.role === 'staff') {
            document.body.classList.remove('read-only');
            console.log('RBAC: Edit mode active');
        }
    },

    applyTheme(user) {
        if (!user) return;

        const theme = user.theme || 'light';

        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        // Update toggle icon - show what mode you can switch TO
        const btn = document.getElementById('themeToggleBtn');
        if (btn) {
            const icon = btn.querySelector('i');
            if (theme === 'light') {
                icon.className = 'fas fa-moon'; // Show moon to indicate can switch to dark
            } else {
                icon.className = 'fas fa-sun'; // Show sun to indicate can switch to light
            }
        }
    },

    async updateTheme(theme) {
        try {
            const response = await fetch('/api/user/theme', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ theme })
            });

            if (response.ok) {
                // Update local storage
                const user = this.getUser();
                if (user) {
                    user.theme = theme;
                    localStorage.setItem('user', JSON.stringify(user));
                    this.applyTheme(user);
                }
                return true;
            }
        } catch (error) {
            console.error('Error updating theme:', error);
        }
        return false;
    }
};

// Export for use in other files
window.Auth = Auth;
