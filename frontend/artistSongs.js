(function() {
const params = new URLSearchParams(window.location.search);
const artistId = params.get("id");

async function loadArtistSongs() {

    const container = document.getElementById("songsContainer");
    if (!container) return;

    container.innerHTML = "<h2>Loading...</h2>";

    try {
        const res = await fetch(`${API}/artist/${artistId}`);
        const data = await res.json();

        if (!data.length) {
            container.innerHTML = "<h2>No songs found</h2>";
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
                <p>Artist • Song</p>
            </div>`;
        });

        container.innerHTML = html;

    } catch (err) {
        container.innerHTML = "<h2>Error loading songs</h2>";
    }
}

loadArtistSongs();
})();

