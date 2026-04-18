// 🔥 GLOBAL
let selectedPlaylist = null;

// <span class="material-symbols-outlined">music_note</span> LOAD PLAYLISTS
async function loadPlaylists() {
    try {
        const res = await fetch(`${API}/playlists`);
        const data = await res.json();

        let html = "";

        data.forEach(p => {
            html += `
            <div class="card" onclick="selectPlaylist(${p.playlist_id})" ondblclick="openPlaylist(${p.playlist_id})">
                <div class="cover-container">
                    <img src="images/default.jpg" class="cover">
                    <button class="overlay-play-btn"><span class="material-symbols-outlined">play_arrow</span></button>
                </div>
                <h3>${p.name}</h3>
                <div class="card-actions">
                    <button onclick="deletePlaylist(${p.playlist_id}); event.stopPropagation();" title="Delete"><span class="material-symbols-outlined">delete</span></button>
                </div>
            </div>`;
        });

        document.getElementById("playlistContainer").innerHTML = html;
    } catch (err) {
        console.error('Load playlists error:', err);
    }
}

// ✅ SELECT PLAYLIST
function selectPlaylist(id) {
    selectedPlaylist = id;

    document.querySelectorAll("#playlistContainer .card").forEach(c => c.classList.remove("active"));
    event.currentTarget.classList.add("active");

    showToast("Playlist selected for adding songs ✅");
}

// 📂 OPEN PLAYLIST (double-click or add button)
function openPlaylist(id) {
    window.location.href = `playlistSongs.html?id=${id}`;
}

// <span class="material-symbols-outlined">music_note</span> LOAD TRACKS FOR ADDING
async function loadTracks() {
    try {
        const res = await fetch(`${API}/tracks`);
        const data = await res.json();

        let html = "";

        data.forEach(track => {
            html += `
            <div class="card">
                <div class="cover-container">
                    <img src="${track.image_url}" class="cover" onerror="this.src='images/default.jpg'">
                    <button class="overlay-play-btn" onclick="addToPlaylist(${track.track_id}); event.stopPropagation();" title="Add to Playlist"><span class="material-symbols-outlined">add</span></button>
                </div>
                <h3>${track.title}</h3>
                <p>${track.album}</p>
            </div>`;
        });

        document.getElementById("tracksContainer").innerHTML = html;
    } catch (err) {
        console.error('Load tracks error:', err);
        document.getElementById("tracksContainer").innerHTML = "<p>Error loading tracks</p>";
    }
}

// <span class="material-symbols-outlined">add</span> ADD SONG
async function addToPlaylist(trackId) {
    if (!selectedPlaylist) {
        showToast("Select a playlist first!");
        return;
    }

    try {
        const res = await fetch(`${API}/playlists/add`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                playlist_id: selectedPlaylist,
                track_id: trackId
            })
        });

        if (res.ok) {
            showToast("Added to playlist <span class='material-symbols-outlined'>music_note</span>");
        } else {
            showToast("Failed to add");
        }
    } catch (err) {
        showToast("Network error");
    }
}

// 🗑 DELETE PLAYLIST
async function deletePlaylist(id) {
    if (!confirm("Delete playlist?")) return;

    try {
        await fetch(`${API}/playlists/${id}`, {method: "DELETE"});
        loadPlaylists();
        showToast("Playlist deleted");
    } catch (err) {
        showToast("Delete failed");
    }
}

// <span class="material-symbols-outlined">add</span> CREATE PLAYLIST
async function createPlaylist() {
    const name = document.getElementById("playlistName").value.trim();
    if (!name) return showToast("Enter name");

    try {
        await fetch(`${API}/playlists`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name})
        });
        document.getElementById("playlistName").value = "";
        loadPlaylists();
        showToast("Created!");
    } catch (err) {
        showToast("Create failed");
    }
}

// TOAST
function showToast(msg) {
    const toast = document.createElement("div");
    toast.textContent = msg;
    toast.style.cssText = `position:fixed;bottom:20px;right:20px;background:#333;color:white;padding:12px 20px;border-radius:8px;z-index:9999;opacity:0;transition:0.3s;`;
    document.body.appendChild(toast);
    setTimeout(() => toast.style.opacity = "1", 100);
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// INIT
loadPlaylists();
loadTracks();

