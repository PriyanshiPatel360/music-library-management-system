// 📌 GET ALBUM ID FROM URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// 🎵 LOAD ALBUM SONGS
async function loadAlbumSongs() {

    const container = document.getElementById("songsContainer");
    if (!container) return;

    try {
        const res = await fetch(`${API}/album/${id}`);
        const data = await res.json();

        // 🧠 Empty state
        if (!data || data.length === 0) {
            container.innerHTML = "<h2>No songs found in this album 🎵</h2>";
            return;
        }

        let html = "";

        data.forEach(track => {
            html += `
<div class="card">

    <div class="img-container">
        <img src="${track.image_url || 'images/default.jpg'}" class="cover">

        <button onclick="playSongGlobal('${track.title}', '${track.artist || 'Unknown'}', '${track.image_url}', '${track.audio_url}')">
            ▶ Play
        </button>
    </div>

    <h3>${track.title}</h3>
    <p>Album: ${track.album}</p>
    <p>Genre: ${track.genre}</p>

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

