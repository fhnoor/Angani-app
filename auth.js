// Authentication helper for home.html

// API base resolver: if the UI is served from a static dev server (e.g. 127.0.0.1:5500),
// direct requests to the Flask API on 127.0.0.1:5000 unless a custom base is provided.
const API_BASE = (() => {
    if (window.ANGANI_API_BASE) return window.ANGANI_API_BASE.replace(/\/$/, '');
    const { origin, port } = window.location;
    if (port === '5500') return 'http://127.0.0.1:5000';
    return origin;
})();

async function postForm(path, formData) {
    const response = await fetch(`${API_BASE}${path}`, { method: 'POST', body: formData });
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    let data = null;
    if (isJson) {
        data = await response.json();
    } else {
        // Non-JSON responses (e.g., HTML 404 from static server) should surface a clear error
        const text = await response.text();
        throw new Error(`Server returned ${response.status} ${response.statusText || ''} (non-JSON)${text ? `: ${text.slice(0, 120)}` : ''}`);
    }

    if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
}

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
            const data = await postForm('/signin', formData);
            // Store login state
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userName', data.name);
            showNotification('Welcome back! Redirecting...', 'success');
            setTimeout(() => window.location.href = 'home.html', 1000);
        } catch (error) {
            console.error('Login error:', error);
            showNotification(error.message || 'Network error. Make sure the server is running.', 'error');
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
            const data = await postForm('/signup', formData);
            // Persist login state so home.html guard allows access
            sessionStorage.setItem('isLoggedIn', 'true');
            const nameFromForm = formData.get('name');
            const emailFromForm = formData.get('email');
            const fallback = emailFromForm ? emailFromForm.split('@')[0] : 'User';
            sessionStorage.setItem('userName', (data.name || nameFromForm || fallback));

            showNotification('Account created successfully! Redirecting to Home page...', 'success');
            setTimeout(() => window.location.href = 'home.html', 800);
        } catch (error) {
            console.error('Signup error:', error);
            showNotification(error.message || 'Network error. Make sure the server is running.', 'error');
        }
    });
}
