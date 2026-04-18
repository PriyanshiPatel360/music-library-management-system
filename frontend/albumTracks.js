// 📌 GET ALBUM ID FROM URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// <span class="material-symbols-outlined">music_note</span> LOAD ALBUM SONGS
async function loadAlbumSongs() {

    const container = document.getElementById("songsContainer");
    if (!container) return;

    try {
        const res = await fetch(`${API}/album/${id}`);
        const data = await res.json();

        // 🧠 Empty state
        if (!data || data.length === 0) {
            container.innerHTML = "<h2>No songs found in this album <span class='material-symbols-outlined'>music_note</span></h2>";
            return;
        }

        let html = "";

        data.forEach(track => {
            const safeTitle = track.title.replace(/'/g, "\\'");
            const safeArtist = (track.artist || 'Unknown').replace(/'/g, "\\'");
            html += `
<div class="card" data-track-id="${track.track_id}">
    <div class="cover-container">
        <img src="${track.image_url || 'images/default.jpg'}" class="cover">
        <button class="overlay-play-btn" onclick="playSongGlobal('${safeTitle}', '${safeArtist}', '${track.image_url || ''}', '${track.audio_url}'); event.stopPropagation();"><span class="material-symbols-outlined">play_arrow</span></button>
    </div>
    <h3>${track.title}</h3>
    <p>${track.album || 'Unknown Album'} • ${track.genre || 'Unknown Genre'}</p>
</div>
`;
        });

        container.innerHTML = html;

    } catch (err) {
        console.error("Error loading album songs:", err);
        container.innerHTML = "<h2>Failed to load songs ❌</h2>";
    }
}

// 🚀 INIT
loadAlbumSongs();

