const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend');

const footerHtml = `
<!-- Site Footer -->
<div class="site-footer" style="padding: 40px; margin-top: 60px; border-top: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary); text-align: center;">
    <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px;">
        <a href="#" style="color: var(--text-secondary); text-decoration: none;">About</a>
        <a href="#" style="color: var(--text-secondary); text-decoration: none;">Terms of Service</a>
        <a href="#" style="color: var(--text-secondary); text-decoration: none;">Privacy Policy</a>
        <a href="#" style="color: var(--text-secondary); text-decoration: none;">Contact</a>
    </div>
    <div style="font-size: 12px;">© 2026 MusicApp. All rights reserved. Designed for listeners.</div>
</div>
`;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'landing.html' && f !== 'login.html' && f !== 'register.html');

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    if (!content.includes('site-footer')) {
        content = content.replace('<!-- Player Bar -->', footerHtml + '\n<!-- Player Bar -->');
        fs.writeFileSync(path.join(dir, file), content);
        console.log('Added footer to ' + file);
    }
});
