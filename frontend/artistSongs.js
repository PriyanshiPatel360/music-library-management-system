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
            html += `
            <div class="card">
                <div class="img-container">
                    <img src="${track.image_url || 'images/default.jpg'}" class="cover">
                    <button onclick="playSongGlobal('${track.title}', '${track.artist || 'Unknown'}', '${track.image_url}', '${track.audio_url}')">
                        ▶
                    </button>
                </div>
                <h3>${track.title}</h3>
            </div>`;
        });

        container.innerHTML = html;

    } catch (err) {
        container.innerHTML = "<h2>Error loading songs</h2>";
    }
}

loadArtistSongs();
})();

