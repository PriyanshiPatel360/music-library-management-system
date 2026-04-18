const fs = require('fs');
let code = fs.readFileSync('frontend/app.js', 'utf8');


let lines = code.split('\n');
let badIndex = -1;
for (let i=0; i<lines.length; i++) {
    if (lines[i].includes('document.addEventListener(\'input\', function(e) { if (e.target && e.target.id === \'searchInput\')')) {
        badIndex = i;
        break;
    }
}

if (badIndex !== -1) {
    let clean = `
document.addEventListener('input', function(e) {
    if (e.target && e.target.id === 'searchInput') {
        if (window.searchTracks) window.searchTracks(e.target.value);
    }
});

document.addEventListener('click', function(e) {
    if (!e.target.closest('#profileContainer')) {
        const dp = document.getElementById('profileDropdown');
        if(dp) dp.classList.remove('active');
    }
});

if (localStorage.getItem('token')) {
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', () => {
            if (window.checkAuth) window.checkAuth();
        });
    } else {
        if (window.checkAuth) window.checkAuth();
    }
}

window.checkAuth = async function() {
  try {
    const res = await fetch(\`\${API}/me\`);
    if (res.ok) {
      const user = await res.json();
      localStorage.setItem('user', JSON.stringify(user));
      const uploadBtn = document.getElementById('uploadSidebarBtn');
      if (uploadBtn) uploadBtn.style.display = 'block';
      const mySection = document.getElementById('my-tracks-section');
`;
    lines[badIndex] = clean;
    fs.writeFileSync('frontend/app.js', lines.join('\n'));
    console.log("app.js cleanly restored");
}
