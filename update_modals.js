const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend');
const modalsHtml = `<!-- Add/Edit Track Modal -->
<div class="modal-overlay" id="addTrackModal">
    <div class="modal-content">
        <button class="modal-close" onclick="closeTrackModal()">×</button>
        <h2 id="trackModalTitle" class="brand"><span class="material-symbols-outlined">upload</span> Upload Track</h2>
        <form id="songForm">
            <input type="file" id="trackFile" accept="audio/*" style="display: none;">
            <input type="hidden" id="trackAudio">
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="trackTitle" placeholder="Song title" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Artist</label>
                    <select id="trackArtist" required></select>
                </div>
                <div class="form-group">
                    <label>Album (Optional)</label>
                    <select id="trackAlbum"></select>
                </div>
                <div class="form-group">
                    <label>Genre</label>
                    <select id="trackGenre"></select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Duration</label>
                    <input type="text" id="trackDuration" placeholder="MM:SS">
                </div>
            </div>
            <div class="form-group">
                <label>Asset Links</label>
                <div class="form-actions-inline">
                    <button type="button" class="btn-secondary" onclick="document.getElementById('trackFile').click()"><span class="material-symbols-outlined">folder</span> Choose MP3</button>
                    <button type="button" class="btn-secondary" onclick="let url = prompt('Enter Image URL:'); if(url) { document.getElementById('trackImage').value = url; window.showToast('Image URL added!'); }"><span class="material-symbols-outlined">image</span> Add Image URL</button>
                </div>
            </div>
            <div class="form-group" style="display:none;">
                <input type="url" id="trackImage" placeholder="Album art URL">
            </div>
            <button type="button" class="btn-primary" id="submitBtn" onclick="addTrack()">Save Track</button>
        </form>
    </div>
</div>

<!-- Settings Modal -->
<div class="modal-overlay" id="settingsModal">
    <div class="modal-content">
        <button class="modal-close" onclick="closeSettingsModal()">×</button>
        <h2 class="brand"><span class="material-symbols-outlined">settings</span> Account Settings</h2>
        <form id="settingsForm">
            <div class="form-group">
                <label>Name</label>
                <input type="text" id="settingsName" placeholder="Your Name" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="settingsEmail" placeholder="your@email.com">
            </div>
            <div class="form-group">
                <label>New Password (Optional)</label>
                <input type="password" id="settingsPassword" placeholder="Leave empty to keep current">
            </div>
            <div class="form-group">
                <label>Profile Image URL</label>
                <input type="url" id="settingsImage" placeholder="https://...">
            </div>
            <button type="button" class="btn-primary" onclick="saveSettings()">Save Changes</button>
        </form>
    </div>
</div>
`;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html' && f !== 'login.html' && f !== 'register.html' && f !== 'landing.html');
files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    if (!content.includes('id="addTrackModal"')) {
        content = content.replace('<!-- Player Bar -->', modalsHtml + '\n<!-- Player Bar -->');
        fs.writeFileSync(path.join(dir, file), content);
        console.log('Added modals to ' + file);
    }
});
