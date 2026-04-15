(function() {
'use strict';

const params = new URLSearchParams(window.location.search);
const playlistId = params.get("id");

if (!playlistId) {
    document.getElementById("songsContainer").innerHTML = "<h2>Invalid playlist ID</h2>";
    return;
}

document.getElementById("playlistTitle").textContent = "Playlist Songs";

let localAudio = null;

// LOAD PLAYLIST SONGS
async function loadPlaylistSongs() {
    try {
        const res = await fetch(`${API}/playlist/${playlistId}`);
        const tracks = await res.json();

        const container = document.getElementById("songsContainer");
        if (!container) return;

        if (tracks.length === 0) {
            container.innerHTML = "<h2>No songs in this playlist yet 😴</h2>";
            return;
        }

        let html = "";

        tracks.forEach(track => {
            html += `
            <div class="card">
                <div class="img-container">
                    <img src="${track.image_url || 'images/default.jpg'}" class="cover">
                    <button onclick="playSongGlobal('${track.title}', '${track.artist || 'Unknown'}', '${track.image_url || 'images/default.jpg'}', '${track.audio_url}')">
                        ▶ Play
                    </button>
                </div>
                <h3>${track.title}</h3>
                <p>${track.album || 'N/A'}</p>
                <button onclick="removeSong(${track.track_id})">
                    ❌ Remove
                </button>
            </div>`;
        });

        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        document.getElementById("songsContainer").innerHTML = "<h2>Error loading playlist</h2>";
    }
}

// REMOVE SONG
async function removeSong(trackId) {
    if (!confirm("Remove from playlist?")) return;

    try {
        const res = await fetch(`${API}/playlist/remove`, {
            method: "DELETE",
            headers:{"Content-Type": "application/json"},
            body: JSON.stringify({
                playlist_id: playlistId,
                track_id: trackId
            })
        });
        if (res.ok) {
            loadPlaylistSongs();
            showToast("Removed");
        }
    } catch (err) {
        showToast("Remove failed");
    }
}

loadPlaylistSongs();
})();

