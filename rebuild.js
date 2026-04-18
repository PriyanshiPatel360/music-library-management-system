const fs = require('fs');
let albums = fs.readFileSync('frontend/albums.html', 'utf8');
let artists = fs.readFileSync('frontend/artists.html', 'utf8');


let topChunk = albums.substring(0, albums.indexOf('</nav>') + 6);

let mainStructure = `
    <main class="main">
        <header class="topbar">
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
        </header>

        <section class="section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h1 style="margin: 0;">All Artists</h1>
                <button class="btn-primary" id="editToggle" onclick="window.toggleEditMode()" style="display: flex; gap: 8px; align-items: center;"><span class="material-symbols-outlined">edit</span> Edit Mode</button>
            </div>
            <div id="artistsContainer" class="cards"></div>

            <div id="noArtists" style="text-align: center; padding: 40px; display: none;">
                <h2>No artists found <span class="material-symbols-outlined">mic</span></h2>
                <p>Start adding your favorite artists</p>
            </div>

            <div class="modal-overlay" id="artistForm">
                <div class="modal-content">
                    <button class="modal-close" onclick="document.getElementById('artistForm').classList.remove('active')">×</button>
                    <h3>Artist Details</h3>
                    <div class="form-group">
                        <input id="artistName" placeholder="Artist Name">
                    </div>
                    <div class="form-group">
                        <textarea id="artistBio" placeholder="Bio"></textarea>
                    </div>
                    <div class="form-group">
                        <input id="artistImage" placeholder="Image URL">
                    </div>
                    <button class="btn-primary" id="submitArtistBtn" onclick="addArtist()">Add Artist</button>
                </div>
            </div>
        </section>
    </main>
</div>
`;

let footerStart = artists.indexOf('<!-- Add/Edit Track Modal -->');
let finalString = topChunk + '\n' + mainStructure + '\n' + artists.substring(footerStart);

// We need to rename the <title> slightly
finalString = finalString.replace('<title>Albums</title>', '<title>Artists</title>');
finalString = finalString.replace('<a href="albums.html" class="active">', '<a href="albums.html">');
finalString = finalString.replace('<a href="artists.html">', '<a href="artists.html" class="active">');

fs.writeFileSync('frontend/artists.html', finalString);
console.log("Rebuilt successfully");
