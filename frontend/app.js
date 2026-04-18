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
        window.showToast(title + ' playing <span class="material-symbols-outlined">music_note</span>');
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
    const titleEls = document.querySelectorAll("#now-playing-title");
    const artistEls = document.querySelectorAll("#now-playing-artist");
    const imgEls = document.querySelectorAll("#now-playing-img");
    const playerBars = document.querySelectorAll("#player-bar");

    titleEls.forEach(el => el.textContent = title);
    artistEls.forEach(el => el.textContent = artist || '');
    imgEls.forEach(el => el.src = img || 'images/default.jpg');
    playerBars.forEach(bar => bar.classList.remove('hidden'));
}

window.togglePlay = function() {
    if (!window.currentAudio) {
        window.showToast('No song playing');
        return;
    }
    if (window.currentAudio.paused) {
        window.currentAudio.play();
        document.querySelectorAll('#play-pause-btn').forEach(btn => btn.innerHTML = '<span class="material-symbols-outlined">pause</span>');
    } else {
        window.currentAudio.pause();
        document.querySelectorAll('#play-pause-btn').forEach(btn => btn.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>');
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
    const fileInput = document.getElementById('trackFile');
    const title = document.getElementById('trackTitle').value;
    const image_url = document.getElementById('trackImage').value;
    const album_id = parseInt(document.getElementById('trackAlbum').value) || null;
    const genre_id = parseInt(document.getElementById('trackGenre').value) || null;
    const duration = document.getElementById('trackDuration').value || '00:04:00';

    if (!title) {
        window.showToast('Title required');
        return;
    }

    try {
        let audio_url = '';
        if (fileInput.files[0]) {
            const formData = new FormData();
            formData.append('song', fileInput.files[0]);
            const uploadRes = await fetch(`${API}/upload-song`, {
                method: 'POST',
                body: formData
            });
            if (!uploadRes.ok) throw new Error('Upload failed');
            const uploadData = await uploadRes.json();
            audio_url = uploadData.audio_url;
        } else {
            window.showToast('Please choose MP3 or enter URL');
            return;
        }

        const artistSelect = document.getElementById('trackArtist');
        const artist_id = parseInt(artistSelect.value) || null;
        const artist_name = artistSelect.options[artistSelect.selectedIndex]?.text || '';

        const trackData = {
            title, album_id, artist_id, artist_name, genre_id, duration, audio_url, image_url
        };

        const res = await fetch(`${API}/tracks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trackData)
        });
        if (res.ok) {
            window.showToast('Song added! <span class="material-symbols-outlined">music_note</span>');
            document.getElementById('songForm').reset();
            fileInput.value = '';
            if(window.closeTrackModal) window.closeTrackModal();
            await window.loadMyTracks();
            await window.refreshTracks();
        } else {
            const err = await res.json();
            window.showToast('Error: ' + err.error);
        }
    } catch (e) {
        window.showToast('Failed: ' + e.message);
    }
};

window.startEdit = function(id, title, artist_id, album_id, genre_id, duration, audio_url, image_url) {
    document.getElementById('addTrackModal').classList.add('active');
    document.getElementById('trackModalTitle').innerHTML = '<span class="material-symbols-outlined">edit</span> Edit Track';
    
    document.getElementById('trackTitle').value = title;
    document.getElementById('trackArtist').value = artist_id || '';
    document.getElementById('trackAlbum').value = album_id || '';
    document.getElementById('trackGenre').value = genre_id || '';
    document.getElementById('trackDuration').value = duration || '';
    document.getElementById('trackAudio').value = audio_url || '';
    document.getElementById('trackImage').value = image_url || '';
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.textContent = 'Save Changes';
    submitBtn.onclick = function() { window.editTrack(id); };
};

window.editTrack = async function(id) {

    const artistSelect = document.getElementById('trackArtist');
    const formData = {
        title: document.getElementById('trackTitle').value,
        artist_id: parseInt(artistSelect.value) || null,
        artist_name: artistSelect.options[artistSelect.selectedIndex]?.text || '',
        album_id: parseInt(document.getElementById('trackAlbum').value) || null,
        genre_id: parseInt(document.getElementById('trackGenre').value) || null,
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
            window.showToast('Song updated! <span class="material-symbols-outlined">music_note</span>');
            document.getElementById('songForm').reset();
            if(window.closeTrackModal) window.closeTrackModal();
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
        const [albumsRes, genresRes, artistsRes] = await Promise.all([
            fetch(`${API}/albums`),
            fetch(`${API}/genres`),
            fetch(`${API}/artists`)
        ]);
        const albums = await albumsRes.json();
        const genres = await genresRes.json();
        const artists = await artistsRes.json();

        const albumSelect = document.getElementById('trackAlbum');
        const genreSelect = document.getElementById('trackGenre');
        const artistSelect = document.getElementById('trackArtist');
        
        albumSelect.innerHTML = '<option value="">Select Album</option>' + 
            albums.map(a => `<option value="${a.album_id}">${a.title}</option>`).join('');
        genreSelect.innerHTML = '<option value="">Select Genre</option>' + 
            genres.map(g => `<option value="${g.genre_id}">${g.name}</option>`).join('');
        
        if (artistSelect) {
            artistSelect.innerHTML = '<option value="">Select Artist</option>' + 
                artists.map(ar => `<option value="${ar.artist_id}">${ar.name}</option>`).join('');
        }
    } catch (e) {
        console.error('Failed to load dropdowns', e);
    }
};

// HOME FUNCTIONS
window.fillForm = function(track) {
    document.getElementById('trackTitle').value = track.title || '';
    document.getElementById('trackArtist').value = track.artist_id || '';
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
                <div class="card" data-track-id="${track.track_id}">
                    <div class="cover-container">
                        <img src="${track.image_url || 'images/default.jpg'}" class="cover">
                        <button class="overlay-play-btn" onclick="playSongGlobal('${safeTitle}', '${safeArtist}', '${track.image_url || ''}', '${track.audio_url}'); event.stopPropagation();"><span class="material-symbols-outlined">play_arrow</span></button>
                    </div>
                    <h3>${track.title}</h3>
                    <p>${track.artist} • ${track.album}</p>
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
                <button class="edit-btn" onclick="startEdit(${track.track_id}, '${safeTitle}', ${track.artist_id || 'null'}, ${track.album_id || 'null'}, ${track.genre_id || 'null'}, '${track.duration || ''}', '${track.audio_url || ''}', '${track.image_url || ''}')" title="Edit">
                    ✏️ Edit
                </button>
                <button class="delete-btn" onclick="deleteTrack(${track.track_id}, '${safeTitle}')" title="Delete">
                    <span class="material-symbols-outlined">delete</span> Delete
                </button>
            ` : '';
            
            return `                <div class="card" data-track-id="${track.track_id}">
                    <div class="cover-container">
                        <img src="${track.image_url || 'images/default.jpg'}" class="cover">
                        <button class="overlay-play-btn" onclick="playSongGlobal('${safeTitle}', '${safeArtist}', '${track.image_url || ''}', '${track.audio_url}'); event.stopPropagation();"><span class="material-symbols-outlined">play_arrow</span></button>
                    </div>
                    <h3>${track.title}</h3>
                    <p>${track.artist} • ${track.album} • ${track.genre}</p>
                    ${editHtml ? `<div class="card-actions">${editHtml}</div>` : ''}
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
    document.getElementById('submitBtn').textContent = 'Save Changes';
    document.getElementById('submitBtn').onclick = () => window.editTrack(id);
    if(window.openTrackModal) window.openTrackModal();
};




// My Tracks
window.loadMyTracks = async function() {
  try {
    const res = await fetch(`${API}/my-tracks`);
    if (res.ok) {
      const tracks = await res.json();
      const container = document.getElementById('myTracksContainer');
      if (container) {
        if (tracks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-outlined">music_off</span>
                    <h3>No tracks yet</h3>
                    <p>Upload your first song to get started.</p>
                </div>
            `;
            // Change style of container to block instead of grid if empty to center properly
            container.style.display = 'block';
        } else {
            // Restore grid
            container.style.display = '';
            container.innerHTML = tracks.map(track => {
          const safeTitle = track.title.replace(/'/g, "\\'");
          const safeArtist = (track.artist || '').replace(/'/g, "\\'");
          return `
            <div class="card" data-track-id="${track.track_id}">
              <div class="cover-container">
                  <img src="${track.image_url || 'images/default.jpg'}" class="cover">
                  <button class="overlay-play-btn" onclick="playSongGlobal('${safeTitle}', '${safeArtist}', '${track.image_url || ''}', '${track.audio_url}'); event.stopPropagation();"><span class="material-symbols-outlined">play_arrow</span></button>
              </div>
              <h3>${track.title}</h3>
              <p>${track.artist} • ${track.album} • ${track.genre || 'Unknown'}</p>
              <div class="card-actions">
                <button class="edit-btn" onclick="startEdit(${track.track_id}, '${safeTitle}', ${track.artist_id || 'null'}, ${track.album_id || 'null'}, ${track.genre_id || 'null'}, '${track.duration || ''}', '${track.audio_url || ''}', '${track.image_url || ''}'); Math.random(); event.stopPropagation();" title="Edit"><span class="material-symbols-outlined" style="font-size:16px;">edit</span></button>
                <button class="delete-btn" onclick="deleteTrack(${track.track_id}, '${safeTitle}'); event.stopPropagation();" title="Delete"><span class="material-symbols-outlined">delete</span></button>
              </div>
            </div>
          `;
        }).join('');
      }
    }
   }
  } catch (e) {
    window.showToast('Login to see your tracks');
  }
};


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
    const res = await fetch(`${API}/me`);
    if (res.ok) {
      const user = await res.json();
      localStorage.setItem('user', JSON.stringify(user));
      const uploadBtn = document.getElementById('uploadSidebarBtn');
      if (uploadBtn) uploadBtn.style.display = 'block';
      const mySection = document.getElementById('my-tracks-section');

      if (mySection) mySection.style.display = 'block';
      
      const usernameDisplay = document.getElementById('usernameDisplay');
      if (usernameDisplay) usernameDisplay.textContent = user.username;
      
      const userAvatar = document.getElementById('userAvatar');
      if (userAvatar && user.profile_image) userAvatar.src = user.profile_image;
      
      await window.loadMyTracks();
      await window.loadDropdowns();
    }
  } catch (e) {
    localStorage.removeItem('user');
  }
};

// Other functions...
window.toggleTheme = function() { document.body.classList.toggle('light'); };

window.logout = function() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.location.href = 'landing.html';
};

let searchTimeout;
window.searchTracks = function(query) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    try {
      const suggestions = document.getElementById('searchSuggestions');
      if (!suggestions) return;
      if (!query || query.trim() === '') {
        suggestions.style.display = 'none';
        return;
      }
      const res = await fetch(`${API}/search?q=${encodeURIComponent(query)}`);
      const tracks = await res.json();
      suggestions.style.display = 'flex';
      if(tracks.length === 0) {
          suggestions.innerHTML = '<div style="color:var(--text-secondary); cursor:default;">No results found</div>';
      } else {
          suggestions.innerHTML = tracks.slice(0, 6).map(t => `<div onclick="playSongGlobal('${t.title.replace(/'/g, "\\'")}', '${(t.artist_name||t.artist||'').replace(/'/g, "\\'")}', '${t.image_url||''}', '${t.audio_url||''}'); document.getElementById('searchSuggestions').style.display='none';"><span class="material-symbols-outlined" style="font-size:16px; margin-right:8px; vertical-align:middle;">music_note</span> ${t.title} - ${t.artist_name||t.artist||'Unknown'}</div>`).join('');
      }
    } catch (e) {
      console.error(e);
    }
  }, 300);
};



/* -- PLAYBACK STATE PERSISTENCE -- */
window.addEventListener('beforeunload', () => {
    if (window.currentAudio && !window.currentAudio.paused) {
        localStorage.setItem('cachedTrack', JSON.stringify({
            src: window.currentAudio.src,
            currentTime: window.currentAudio.currentTime,
            title: document.getElementById('now-playing-title').textContent,
            artist: document.getElementById('now-playing-artist').textContent,
            img: document.getElementById('now-playing-img').src
        }));
    } else {
        localStorage.removeItem('cachedTrack');
    }
});
window.addEventListener('DOMContentLoaded', () => {
    const cached = localStorage.getItem('cachedTrack');
    if (cached) {
        try {
            const t = JSON.parse(cached);
            window.playSongGlobal(t.title, t.artist, t.img, t.src, true); 
            // We pass an optional true flag to indicate restoration. Let's update playSongGlobal if needed!
        } catch(e) {}
    }
});
