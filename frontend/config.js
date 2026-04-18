// config.js
const API = "http://localhost:5000";

const originalFetch = window.fetch;
window.fetch = async function() {
    let [resource, config] = arguments;
    if (!config) config = {};
    
    // Add token if exists
    const token = localStorage.getItem('token');
    if (token) {
        if (!config.headers) config.headers = {};
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // We can remove credentials: 'include' since we use JWT now
    
    const response = await originalFetch(resource, config);
    
    // Handle 401 globally but ensure we don't infinitely redirect if we are on login page
    if (response.status === 401 && !window.location.href.includes('login.html') && !window.location.href.includes('register.html') && !window.location.href.includes('index.html')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
    
    return response;
};
