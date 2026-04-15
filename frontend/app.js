window.playSongGlobal = function(title, artist, img, url) {
    console.log('Playing:', title, url); // Debug

    if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio.currentTime = 0;
    }

    if (!url) {
        window.showToast('No audio file for this song');
        return;
    }

    window.currentAudio = new Audio(url);
    
    // Update UI immediately
    updatePlayerUI(title, artist, img);
    
    // Progress bar
    const progressBar = document.querySelector('#progressBar') || document.querySelector('#progress-slider');
    const currentTimeEl = document.querySelector('#currentTime') || document.querySelector('#current-time');
    const durationEl = document.querySelector('#duration') || document.querySelector('#total-duration');
    
    window.currentAudio.addEventListener('loadedmetadata', () => {
        const duration = window.currentAudio.duration;
        if (durationEl) durationEl.textContent = formatTime(duration);
        if (progressBar) progressBar.max = duration;
    });
    
    window.currentAudio.addEventListener('timeupdate', () => {
        const current = window.currentAudio.currentTime;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(current);
        if (progressBar) progressBar.value = current;
    });
    
    window.currentAudio.addEventListener('ended', () => {
        nextSong();
    });
    
    window.currentAudio.addEventListener('loadstart', () => console.log('Audio loading:', url));
    window.currentAudio.addEventListener('canplay', () => {
        console.log('Audio ready, playing:', title);
        window.currentAudio.play();
        window.showToast(title + ' playing 🎵');
    });
    window.currentAudio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        window.showToast('Song file missing');
    });

    window.currentAudio.load();
    
    // Progress bar click
    const progressBars = document.querySelectorAll('#progressBar, #progress-slider');
    progressBars.forEach(bar => {
        bar.oninput = () => {
            window.currentAudio.currentTime = bar.value;
        };
    });
};

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

function updatePlayerUI(title, artist, img) {
    const titleEls = document.querySelectorAll("#playerTitle");
    const artistEls = document.querySelectorAll("#playerArtist");
    const imgEls = document.querySelectorAll("#playerImg");
    const playerBars = document.querySelectorAll("#playerBar");

    titleEls.forEach(el => el.textContent = title);
    artistEls.forEach(el => el.textContent = artist || '');
    imgEls.forEach(el => el.src = img || 'images/default.jpg');
    playerBars.forEach(bar => bar.style.display = 'flex');
}

window.togglePlay = function() {
    if (!window.currentAudio) {
        window.showToast('No song playing');
        return;
    }
    if (window.currentAudio.paused) {
        window.currentAudio.play();
        document.querySelectorAll('#mainPlayBtn').forEach(btn => btn.textContent = '⏸');
    } else {
        window.currentAudio.pause();
        document.querySelectorAll('#mainPlayBtn').forEach(btn => btn.textContent = '▶');
    }
};

window.setSpeed = function(speed) {
    if (window.currentAudio) {
        window.currentAudio.playbackRate = parseFloat(speed);
        window.showToast(speed + 'x speed');
    }
};

window.currentTrackList = [];
window.currentTrackIndex = 0;

window.prevSong = function() {
    if (window.currentTrackList.length === 0) return window.showToast('No playlist');
    window.currentTrackIndex = Math.max(0, window.currentTrackIndex - 1);
    const track = window.currentTrackList[window.currentTrackIndex];
    playSongGlobal(track.title, track.artist, track.image_url, track.audio_url);
};

window.nextSong = function() {
    if (window.currentTrackList.length === 0) return window.showToast('No playlist');
    window.currentTrackIndex = Math.min(window.currentTrackList.length - 1, window.currentTrackIndex + 1);
    const track = window.currentTrackList[window.currentTrackIndex];
    playSongGlobal(track.title, track.artist, track.image_url, track.audio_url);
};

window.showToast = function(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.className = 'toast';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// CRUD FUNCTIONS
window.refreshTracks = async function() {
    await window.loadTracks();
    window.showToast('Tracks refreshed');
};

window.addTrack = async function() {
    const formData = {
        title: document.getElementById('trackTitle').value,
        album_id: parseInt(document.getElementById('trackAlbum').value),
        genre_id: parseInt(document.getElementById('trackGenre').value),
        duration: document.getElementById('trackDuration').value,
        audio_url: document.getElementById('trackAudio').value,
        image_url: document.getElementById('trackImage').value
    };

    if (!formData.title || !formData.audio_url) {
        window.showToast('Title and audio URL required');
        return;
    }

    try {
        const res = await fetch(`${API}/tracks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            window.showToast('Song added! 🎵');
            document.getElementById('songForm').reset();
            await window.refreshTracks();
        } else {
            const err = await res.json();
            window.showToast('Error: ' + err.error);
        }
    } catch (e) {
        window.showToast('Failed to add song');
    }
};

window.editTrack = async function(id) {
    const track = window.currentEditingTrack; // Set before calling
    if (!track) return;

    const formData = {
        title: document.getElementById('trackTitle').value,
        album_id: parseInt(document.getElementById('trackAlbum').value),
        genre_id: parseInt(document.getElementById('trackGenre').value),
        duration: document.getElementById('trackDuration').value,
        audio_url: document.getElementById('trackAudio').value,
        image_url: document.getElementById('trackImage').value
    };

    try {
        const res = await fetch(`${API}/tracks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            window.showToast('Song updated! 🎵');
            document.getElementById('songForm').reset();
            document.getElementById('editModeToggle').textContent = 'Edit Mode';
            window.isEditMode = false;
            await window.refreshTracks();
        } else {
            const err = await res.json();
            window.showToast('Error: ' + err.error);
        }
    } catch (e) {
        window.showToast('Failed to update song');
    }
};

window.deleteTrack = async function(id, title) {
    if (!confirm(`Delete "${title}"?`)) return;

    try {
        const res = await fetch(`${API}/tracks/${id}`, { method: 'DELETE' });
        if (res.ok) {
            window.showToast('Song deleted');
            await window.refreshTracks();
        } else {
            const err = await res.json();
            window.showToast('Error: ' + err.error);
        }
    } catch (e) {
        window.showToast('Failed to delete song');
    }
};

window.toggleEditMode = function() {
    window.isEditMode = !window.isEditMode;
    const btn = document.getElementById('editModeToggle');
    btn.textContent = window.isEditMode ? 'Cancel Edit' : 'Edit Mode';
    window.showToast(window.isEditMode ? 'Edit mode ON' : 'Edit mode OFF');
};

// Load dropdowns
window.loadDropdowns = async function() {
    try {
        const [albumsRes, genresRes] = await Promise.all([
            fetch(`${API}/albums`),
            fetch(`${API}/genres`)
        ]);
        const albums = await albumsRes.json();
        const genres = await genresRes.json();

        const albumSelect = document.getElementById('trackAlbum');
        const genreSelect = document.getElementById('trackGenre');
        
        albumSelect.innerHTML = '<option value="">Select Album</option>' + 
            albums.map(a => `<option value="${a.album_id}">${a.title}</option>`).join('');
        genreSelect.innerHTML = '<option value="">Select Genre</option>' + 
            genres.map(g => `<option value="${g.genre_id}">${g.name}</option>`).join('');
    } catch (e) {
        console.error('Failed to load dropdowns', e);
    }
};

// HOME FUNCTIONS
window.fillForm = function(track) {
    document.getElementById('trackTitle').value = track.title || '';
    document.getElementById('trackAlbum').value = track.album_id || '';
    document.getElementById('trackGenre').value = track.genre_id || '';
    document.getElementById('trackDuration').value = track.duration || '';
    document.getElementById('trackAudio').value = track.audio_url || '';
    document.getElementById('trackImage').value = track.image_url || '';
};

window.searchTracks = async function(query) {
    const container = document.getElementById('tracksContainer');
    if (!container) return;

    try {
        const res = await fetch(`${API}/search?q=${encodeURIComponent(query)}`);
        const tracks = await res.json();
        
        container.innerHTML = tracks.map(track => {
            const safeTitle = track.title.replace(/'/g, "\\'");
            const safeArtist = (track.artist || '').replace(/'/g, "\\'");
            return `
                <div class="card">
                    <img src="${track.image_url || 'images/default.jpg'}" class="cover">
                    <h3>${track.title}</h3>
                    <p>${track.artist} • ${track.album}</p>
                    <div class="card-actions">
                        <button class="play-btn" onclick="playSongGlobal('${safeTitle}', '${safeArtist}', '${track.image_url || ''}', '${track.audio_url}')" title="Play">
                            ▶ Play
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error(e);
        container.innerHTML = '<h2>No results found</h2>';
    }
};

window.loadTracks = async function() {
    const container = document.getElementById('tracksContainer');
    if (!container) return;

    try {
        const res = await fetch(`${API}/tracks`);
        const tracks = await res.json();
        console.log('Loaded', tracks.length, 'tracks');

        window.currentTrackList = tracks; // For prev/next

        container.innerHTML = tracks.map(track => {
            const safeTitle = track.title.replace(/'/g, "\\'");
            const safeArtist = (track.artist || '').replace(/'/g, "\\'");
            const editHtml = window.isEditMode ? `
                <button class="edit-btn" onclick="startEdit(${track.track_id}, '${safeTitle}', ${track.album_id || 'null'}, ${track.genre_id || 'null'}, '${track.duration || ''}', '${track.audio_url || ''}', '${track.image_url || ''}')" title="Edit">
                    ✏️ Edit
                </button>
                <button class="delete-btn" onclick="deleteTrack(${track.track_id}, '${safeTitle}')" title="Delete">
                    🗑️ Delete
                </button>
            ` : '';
            
            return `
                <div class="card" data-track-id="${track.track_id}">
                    <img src="${track.image_url || 'images/default.jpg'}" class="cover">
                    <h3>${track.title}</h3>
                    <p>${track.artist} • ${track.album} • ${track.genre}</p>
                    <div class="card-actions">
                        <button class="play-btn" onclick="playSongGlobal('${safeTitle}', '${safeArtist}', '${track.image_url || ''}', '${track.audio_url}')" title="Play">
                            ▶ Play
                        </button>
                        ${editHtml}
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error(e);
        container.innerHTML = '<h2>Failed to load songs</h2>';
    }
};

window.startEdit = function(id, title, album_id, genre_id, duration, audio_url, image_url) {
    window.currentEditingTrackId = id;
    window.fillForm({title, album_id, genre_id, duration, audio_url, image_url});
    document.getElementById('submitBtn').onclick = () => window.editTrack(id);
    window.showToast('Edit mode - Update form and click Add Song');
};




// Other functions...
window.toggleTheme = function() { document.body.classList.toggle('light'); };
window.logout = function() { localStorage.removeItem('user'); window.location.href = 'landing.html'; };

