const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend');
const newTopbar = `<header class="topbar">
            <div class="search-container">
                <input type="text" id="searchInput" placeholder="What do you want to listen to?" autocomplete="off">
                <div id="searchSuggestions"></div>
            </div>
            <div class="topbar-actions">
                <div class="user-box-container" id="profileContainer">
                    <div class="user-box" id="userBox" onclick="document.getElementById('profileDropdown').classList.toggle('active')">
                        <img id="userAvatar" src="images/user.png" onerror="this.src='images/default.jpg'">
                        <span id="usernameDisplay">Sign In</span>
                    </div>
                    <div class="profile-dropdown" id="profileDropdown">
                        <a href="javascript:void(0)" onclick="if(window.openSettingsModal) openSettingsModal(); else window.location.href='index.html'"><span class="material-symbols-outlined">settings</span> Account Settings</a>
                        <a href="javascript:void(0)" onclick="if(window.openTrackModal) openTrackModal(); else window.location.href='index.html'"><span class="material-symbols-outlined">upload</span> Upload Track</a>
                        <hr>
                        <button onclick="window.logout()"><span class="material-symbols-outlined">logout</span> Log Out</button>
                    </div>
                </div>
            </div>
        </header>`;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html');
files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    content = content.replace(/<header class="topbar">[\s\S]*?<\/header>/, newTopbar);
    fs.writeFileSync(path.join(dir, file), content);
    console.log('Updated ' + file);
});
