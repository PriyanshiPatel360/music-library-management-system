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
            const safeTitle = track.title.replace(/'/g, "\\'");
            const safeArtist = (track.artist || 'Unknown').replace(/'/g, "\\'");
            html += `
            <div class="card" data-track-id="${track.track_id}">
                <div class="cover-container">
                    <img src="${track.image_url || 'images/default.jpg'}" class="cover">
                    <button class="overlay-play-btn" onclick="playSongGlobal('${safeTitle}', '${safeArtist}', '${track.image_url || ''}', '${track.audio_url}'); event.stopPropagation();"><span class="material-symbols-outlined">play_arrow</span></button>
                </div>
                <h3>${track.title}</h3>
                <p>${track.album || 'N/A'}</p>
                <div class="card-actions">
                    <button class="delete-btn" onclick="removeSong(${track.track_id}); event.stopPropagation();" title="Remove"><span class="material-symbols-outlined">close</span></button>
                </div>
            </div>`;
        });

        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        document.getElementById("songsContainer").innerHTML = "<h2>Error loading playlist</h2>";
    }
}

// REMOVE SONG
window.removeSong = async function(trackId) {
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
            window.showToast("Removed");
        }
    } catch (err) {
        window.showToast("Remove failed");
    }
}

loadPlaylistSongs();
})();

