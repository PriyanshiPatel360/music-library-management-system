/* Artists Display - CRUD */

// Global edit mode
window.isArtistEditMode = false;

window.toggleEditMode = function() {
    window.isArtistEditMode = !window.isArtistEditMode;
    const btn = document.getElementById('editToggle');
    btn.textContent = window.isArtistEditMode ? 'Done' : 'Edit Mode';
    if(window.isArtistEditMode) {
        document.getElementById('artistForm').classList.add('active');
    } else {
        document.getElementById('artistForm').classList.remove('active');
        document.getElementById('artistName').value = '';
        document.getElementById('artistBio').value = '';
        document.getElementById('artistImage').value = '';
        document.getElementById('submitArtistBtn').textContent = 'Add Artist';
        document.getElementById('submitArtistBtn').onclick = addArtist;
    }
    loadArtists();
    window.showToast(window.isArtistEditMode ? 'Edit mode ON' : 'Edit mode OFF');
};

// Add artist
window.addArtist = async function() {
    const name = document.getElementById('artistName').value.trim();
    const bio = document.getElementById('artistBio').value.trim();
    const image = document.getElementById('artistImage').value.trim() || 'images/default.jpg';
    
    if (!name) return window.showToast('Name required');
    
    try {
        const res = await fetch(`${API}/artists`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, bio, image_url: image})
        });
        if (res.ok) {
            document.getElementById('artistName').value = '';
            document.getElementById('artistBio').value = '';
            document.getElementById('artistImage').value = '';
            loadArtists();
            window.showToast("Artist added <span class='material-symbols-outlined'>mic</span>");
            document.getElementById('artistForm').classList.remove('active');
        } else {
            const err = await res.json();
            window.showToast('Error: ' + (err.error || 'Failed'));
        }
    } catch (e) {
        window.showToast('Network error');
    }
};

// Delete artist
window.deleteArtist = async function(id, name) {
    if (!confirm(`Delete "${name}"?`)) return;
    
    try {
        const res = await fetch(`${API}/artists/${id}`, {method: 'DELETE'});
        if (res.ok) {
            loadArtists();
            window.showToast('Artist deleted');
        }
    } catch (e) {
        window.showToast('Delete failed');
    }
};

// Load artists for display
async function loadArtists() {
    const container = document.getElementById("artistsContainer");
    if (!container) return;

    container.innerHTML = "<div style='grid-column: 1/-1; text-align:center; padding:40px; color:#ccc'>Loading artists... <span class='material-symbols-outlined'>mic</span></div>";

    try {
        const res = await fetch(`${API}/artists`);
        const data = await res.json();

        if (!data.length) {
            container.innerHTML = "<div style='grid-column: 1/-1; text-align:center; padding:40px'><h2>No artists found 😢</h2></div>";
            return;
        }

        container.innerHTML = data.map(a => {
            const safeName = a.name.replace(/'/g, "\\'");
            const bioPreview = (a.bio || 'No bio available').substring(0, 80) + (a.bio && a.bio.length > 80 ? '...' : '');
            const img = a.image_url || 'images/default.jpg';
            let editBtn = '';
            if (window.isArtistEditMode) {
                editBtn = `
                    <div class="card-actions" onclick="event.stopPropagation()">
                        <button class="edit-btn" onclick="startEditArtist(${a.artist_id}, '${safeName}', '${a.bio ? a.bio.replace(/'/g, "\\'") : ''}', '${img}', event)" title="Edit">✏️</button>
                        <button class="delete-btn" onclick="deleteArtist(${a.artist_id}, '${safeName}')" title="Delete"><span class="material-symbols-outlined">delete</span></button>
                    </div>`;
            }
            return `
                <div class="card artist-card" onclick="viewArtist(${a.artist_id})">
                    <div class="cover-container">
                        <img src="${img}" class="cover" onerror="this.src='images/default.jpg'" alt="${a.name}">
                        <button class="overlay-play-btn" onclick="playTopSong(${a.artist_id}, '${safeName}'); event.stopPropagation();"><span class="material-symbols-outlined">play_arrow</span></button>
                    </div>
                    <h3>${a.name}</h3>
                    <p>${bioPreview}</p>
                    ${editBtn}
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error('Load artists error:', err);
        container.innerHTML = "<div style='grid-column: 1/-1; text-align:center; padding:40px'><h2>Error loading artists ❌</h2><p>Check console & backend</p></div>";
    }
}

// Client-side search filter
function filterArtists(query = '') {
    const cards = document.querySelectorAll("#artistsContainer .card");
    let visible = 0;

    cards.forEach(card => {
        const match = card.textContent.toLowerCase().includes(query.toLowerCase());
        card.style.display = match ? 'block' : 'none';
        if (match) visible++;
    });

    const container = document.getElementById("artistsContainer");
    const noResults = document.getElementById("noArtists") || document.querySelector('.no-artists-placeholder');
    
    if (visible === 0 && query.trim()) {
        if (noResults) {
            noResults.style.display = 'block';
            noResults.innerHTML = `<h2>No artists match "${query}"</h2><p>Try another search</p>`;
        }
        container.style.display = 'none';
    } else {
        if (noResults) noResults.style.display = 'none';
        container.style.display = 'grid';
    }
}

// Play top song from artist
async function playTopSong(artistId, artistName) {
    try {
        const res = await fetch(`${API}/artists/${artistId}/songs`);
        const songs = await res.json();
        if (songs && songs.length > 0) {
            const song = songs[0];
            playSongGlobal(song.title, artistName, song.image_url || '', song.audio_url);
            showToast(`Playing ${song.title}`);
        } else {
            showToast('No songs available');
        }
    } catch (e) {
        console.error(e);
        showToast('Failed to load artist songs');
    }
}

// Edit Artist
window.startEditArtist = function(id, name, bio, img, e) {
    if(e) e.stopPropagation();
    window.currentEditingArtistId = id;
    document.getElementById('artistName').value = name;
    document.getElementById('artistBio').value = bio || '';
    document.getElementById('artistImage').value = img || '';
    document.getElementById('submitArtistBtn').textContent = 'Update Artist';
    document.getElementById('submitArtistBtn').onclick = () => saveEditArtist(id);
    document.getElementById('artistForm').classList.add('active');
};

window.saveEditArtist = async function(id) {
    const name = document.getElementById('artistName').value.trim();
    const bio = document.getElementById('artistBio').value.trim();
    const image = document.getElementById('artistImage').value.trim();
    if (!name) return window.showToast('Name required');

    try {
        const res = await fetch(`${API}/artists/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, bio, image_url: image})
        });
        if (res.ok) {
            window.showToast("Artist updated <span class='material-symbols-outlined'>mic</span>");
            document.getElementById('artistName').value = '';
            document.getElementById('artistBio').value = '';
            document.getElementById('artistImage').value = '';
            document.getElementById('submitArtistBtn').textContent = 'Add Artist';
            document.getElementById('submitArtistBtn').onclick = addArtist;
            document.getElementById('artistForm').classList.remove('active');
            loadArtists();
        } else {
            const err = await res.json();
            window.showToast('Error: ' + err.error);
        }
    } catch (e) {
        window.showToast('Update failed');
    }
}

// Navigate to artist
function viewArtist(id) {
    window.location.href = `artistSongs.html?id=${id}`;
}

// Auto-init
document.addEventListener("DOMContentLoaded", loadArtists);

// Export for global use
window.filterArtists = filterArtists;
window.loadArtistsDisplay = loadArtists;
