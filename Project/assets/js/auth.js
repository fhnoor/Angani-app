// Authentication helper for home.html

// Check if user is logged in
function isLoggedIn() {
    return sessionStorage.getItem('isLoggedIn') === 'true';
}

// Get logged in user's name
function getLoggedInUser() {
    return sessionStorage.getItem('userName') || 'User';
}

// Show in-page notification instead of alert
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existing = document.querySelector('.custom-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Protect the home page - redirect to signin if not logged in
if (window.location.pathname.includes('home.html')) {
    if (!isLoggedIn()) {
        window.location.href = 'signin.html';
    } else {
        // Display welcome message with user's name
        const welcomeText = document.getElementById('welcome-text');
        if (welcomeText) {
            welcomeText.textContent = `Welcome, ${getLoggedInUser()}!`;
        }
    }
}

// Handle logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userName');
        window.location.href = 'landing.html';
    });
}

// Handle signin form submission
const signinForm = document.getElementById('signin-form');
if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(signinForm);
        
        try {
            const response = await fetch('/signin', {
                method: 'POST',
                body: formData
            });
            
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('JSON parse error:', jsonError);
                showNotification('Server error. Please try again.', 'error');
                return;
            }
            
            if (data.success) {
                // Store login state
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userName', data.name);
                showNotification('Welcome back! Redirecting...', 'success');
                setTimeout(() => window.location.href = 'home.html', 1000);
            } else {
                showNotification(data.message || 'Login failed. Please check your credentials.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Network error. Make sure the server is running.', 'error');
        }
    });
}

// Handle signup form submission
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(signupForm);
        const password = formData.get('password');
        const confirm = formData.get('confirm');
        
        // Validate password match
        if (password !== confirm) {
            showNotification('Passwords do not match!', 'error');
            return;
        }
        
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                body: formData
            });
            
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('JSON parse error:', jsonError);
                showNotification('Server error. Please try again.', 'error');
                return;
            }
            
            if (data.success) {
                // Persist login state so home.html guard allows access
                sessionStorage.setItem('isLoggedIn', 'true');
                const nameFromForm = formData.get('name');
                const emailFromForm = formData.get('email');
                const fallback = emailFromForm ? emailFromForm.split('@')[0] : 'User';
                sessionStorage.setItem('userName', (data.name || nameFromForm || fallback));

                showNotification('Account created successfully! Redirecting to Home page...', 'success');
                setTimeout(() => window.location.href = 'home.html', 800);
            } else {
                showNotification(data.message || 'Signup failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showNotification('Network error. Make sure the server is running.', 'error');
        }
    });
}
