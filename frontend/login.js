// Login form handling

document.getElementById('loginForm').addEventListener('submit', async function (e) {

    e.preventDefault();



    const username = document.getElementById('username').value.trim();

    const password = document.getElementById('password').value;

    const errorMessage = document.getElementById('errorMessage');

    const loginBtn = document.getElementById('loginBtn');

    const btnText = loginBtn.querySelector('.btn-text');

    const btnLoader = loginBtn.querySelector('.btn-loader');



    // Hide previous error

    errorMessage.classList.remove('show');

    errorMessage.textContent = '';



    // Disable button and show loader

    loginBtn.disabled = true;

    btnText.style.display = 'none';

    btnLoader.style.display = 'inline';



    try {

        const response = await fetch('/api/login', {

            method: 'POST',

            headers: {

                'Content-Type': 'application/json',

            },

            credentials: 'include', // Important for session cookies

            body: JSON.stringify({ username, password })

        });



        const data = await response.json();



        if (response.ok && data.success) {

            // Login successful

            console.log('Login successful:', data);
            
            // Hide login form and show train loading
            document.querySelector('.login-card').style.display = 'none';
            document.getElementById('trainLoadingScreen').style.display = 'flex';
            
            // Wait 5 seconds then redirect
            setTimeout(() => {
                // Store user info in localStorage (optional, for display purposes)
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirect to dashboard
                window.location.href = '/index.html';
            }, 5000); // 5 seconds delay
            
            return; // Stop further execution

        } else {

            // Login failed

            showError(data.error || 'Login failed. Please try again.');

        }

    } catch (error) {

        console.error('Login error:', error);

        showError('Connection error. Please try again.');

    } finally {

        // Re-enable button

        loginBtn.disabled = false;

        btnText.style.display = 'inline';

        btnLoader.style.display = 'none';

    }

});



function showError(message) {

    const errorMessage = document.getElementById('errorMessage');

    errorMessage.textContent = message;

    errorMessage.classList.add('show');

}



// Check if already logged in

async function checkAuth() {

    try {

        const response = await fetch('/api/check-auth', {

            credentials: 'include'

        });



        const data = await response.json();



        if (data.authenticated) {

            // Already logged in, redirect to dashboard

            window.location.href = '/index.html';

        }

    } catch (error) {

        console.error('Auth check error:', error);

    }

}



// Check auth on page load

// Check auth on page load

checkAuth();



// Video Loading Handler

document.addEventListener('DOMContentLoaded', function() {

    const video = document.getElementById('loginVideo');
    
    if (video) {
        // Handle video loading
        video.addEventListener('loadeddata', function() {
            video.classList.add('loaded');
            console.log('Login video loaded successfully');
        });
        
        // Handle video loading errors
        video.addEventListener('error', function() {
            console.error('Error loading login video');
            // Fallback to gradient background if video fails
            document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        });
        
        // Ensure video plays
        video.play().catch(function(error) {
            console.log('Auto-play was prevented:', error);
            // Add click to play functionality
            document.addEventListener('click', function() {
                video.play();
            }, { once: true });
        });
    }
    
    // Add input animation effects
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput) {
        usernameInput.addEventListener('input', function(e) {
            if (e.target.value.length > 0) {
                e.target.parentElement.classList.add('has-value');
                // Add leaf fall effect
                createLeafFall(e.target);
            } else {
                e.target.parentElement.classList.remove('has-value');
            }
        });
        
        usernameInput.addEventListener('focus', function(e) {
            e.target.parentElement.classList.add('focused');
        });
        
        usernameInput.addEventListener('blur', function(e) {
            e.target.parentElement.classList.remove('focused');
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function(e) {
            if (e.target.value.length > 0) {
                e.target.parentElement.classList.add('has-value');
                // Add leaf fall effect
                createLeafFall(e.target);
            } else {
                e.target.parentElement.classList.remove('has-value');
            }
        });
        
        passwordInput.addEventListener('focus', function(e) {
            e.target.parentElement.classList.add('focused');
        });
        
        passwordInput.addEventListener('blur', function(e) {
            e.target.parentElement.classList.remove('focused');
        });
    }
});

// Create leaf fall effect for inputs
function createLeafFall(inputElement) {
    const leafContainer = document.getElementById('leafContainer');
    if (!leafContainer) return;
    
    // Get input position
    const inputRect = inputElement.getBoundingClientRect();
    const containerRect = leafContainer.getBoundingClientRect();
    
    // Create multiple leaves for better effect
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const leaf = document.createElement('div');
            leaf.className = `leaf-particle type-${Math.floor(Math.random() * 3) + 1}`;
            
            // Position leaf at cursor location
            const randomX = inputRect.left - containerRect.left + (Math.random() * inputRect.width);
            const randomY = inputRect.top - containerRect.top;
            
            leaf.style.left = `${randomX}px`;
            leaf.style.top = `${randomY}px`;
            
            // Add random sway animation
            const swayDelay = Math.random() * 2;
            const swayDuration = 2 + Math.random() * 2;
            
            leaf.style.animation = `leafFall 3s ease-in-out forwards, leafSway ${swayDuration}s ease-in-out ${swayDelay}s infinite`;
            
            leafContainer.appendChild(leaf);
            
            // Remove leaf after animation
            setTimeout(() => {
                if (leaf.parentNode) {
                    leaf.remove();
                }
            }, 3000);
        }, i * 100); // Stagger the leaves
    }
}



// ==========================================

// FORGOT PASSWORD LOGIC

// ==========================================



const modal = document.getElementById('forgotPasswordModal');

const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');

const closeModal = document.querySelector('.close-modal');

const step1 = document.getElementById('step1');

const step2 = document.getElementById('step2');

const sendOtpBtn = document.getElementById('sendOtpBtn');

const resetPasswordBtn = document.getElementById('resetPasswordBtn');

const resetMessage = document.getElementById('resetMessage');



// Open Modal

if (forgotPasswordBtn) {

    forgotPasswordBtn.addEventListener('click', (e) => {

        e.preventDefault();

        modal.style.display = 'flex';

        // Reset state

        step1.style.display = 'block';

        step2.style.display = 'none';

        document.getElementById('resetEmail').value = '';

        document.getElementById('otpInput').value = '';

        document.getElementById('newPassword').value = '';

        resetMessage.textContent = '';

        resetMessage.className = 'error-message';

    });

}



// Close Modal

if (closeModal) {

    closeModal.addEventListener('click', () => {

        modal.style.display = 'none';

    });

}



// Close on outside click

window.addEventListener('click', (e) => {

    if (e.target == modal) {

        modal.style.display = 'none';

    }

});



// Send OTP

if (sendOtpBtn) {

    sendOtpBtn.addEventListener('click', async () => {

        const email = document.getElementById('resetEmail').value.trim();

        const btnText = sendOtpBtn.querySelector('.btn-text');

        const btnLoader = sendOtpBtn.querySelector('.btn-loader');



        if (!email) {

            showResetError('Please enter your email address.');

            return;

        }



        // Loading state

        sendOtpBtn.disabled = true;

        btnText.style.display = 'none';

        btnLoader.style.display = 'inline';

        resetMessage.textContent = '';



        try {

            const response = await fetch('/api/forgot-password', {

                method: 'POST',

                headers: { 'Content-Type': 'application/json' },

                body: JSON.stringify({ email })

            });



            const data = await response.json();



            if (response.ok && data.success) {

                // Success - Move to Step 2

                step1.style.display = 'none';

                step2.style.display = 'block';

                showResetSuccess(data.message);

            } else {

                showResetError(data.error || 'Failed to send OTP.');

            }

        } catch (error) {

            showResetError('Connection error. Please try again.');

        } finally {

            sendOtpBtn.disabled = false;

            btnText.style.display = 'inline';

            btnLoader.style.display = 'none';

        }

    });

}



// Reset Password

if (resetPasswordBtn) {

    resetPasswordBtn.addEventListener('click', async () => {

        const email = document.getElementById('resetEmail').value.trim();

        const otp = document.getElementById('otpInput').value.trim();

        const newPassword = document.getElementById('newPassword').value;

        const btnText = resetPasswordBtn.querySelector('.btn-text');

        const btnLoader = resetPasswordBtn.querySelector('.btn-loader');



        if (!otp || !newPassword) {

            showResetError('Please fill in all fields.');

            return;

        }



        if (newPassword.length < 8) {

            showResetError('Password must be at least 8 characters.');

            return;

        }



        // Loading state

        resetPasswordBtn.disabled = true;

        btnText.style.display = 'none';

        btnLoader.style.display = 'inline';

        resetMessage.textContent = '';



        try {

            const response = await fetch('/api/reset-password', {

                method: 'POST',

                headers: { 'Content-Type': 'application/json' },

                body: JSON.stringify({ email, otp, newPassword })

            });



            const data = await response.json();



            if (response.ok && data.success) {

                showResetSuccess(data.message);

                // Close modal after delay

                setTimeout(() => {

                    modal.style.display = 'none';

                    // Optional: auto-fill username

                    document.getElementById('username').value = email;

                    document.getElementById('password').focus();

                }, 2000);

            } else {

                showResetError(data.error || 'Failed to reset password.');

            }

        } catch (error) {

            showResetError('Connection error. Please try again.');

        } finally {

            resetPasswordBtn.disabled = false;

            btnText.style.display = 'inline';

            btnLoader.style.display = 'none';

        }

    });

}



function showResetError(msg) {

    resetMessage.textContent = msg;

    resetMessage.className = 'error-message show';

    resetMessage.style.color = '#ff4444';

}



function showResetSuccess(msg) {

    resetMessage.textContent = msg;

    resetMessage.className = 'error-message show';

    resetMessage.style.color = '#00C851';

}

