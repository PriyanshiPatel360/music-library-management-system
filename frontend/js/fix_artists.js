const fs = require('fs');
let c = fs.readFileSync('frontend/artists.html', 'utf8');
let headerEnd = c.indexOf('</header>');
let footerStart = c.indexOf('<!-- Add/Edit Track Modal -->');

const replacement = `
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

fs.writeFileSync('frontend/artists.html', c.substring(0, headerEnd) + replacement + c.substring(footerStart));
console.log('Fixed artists.html');
