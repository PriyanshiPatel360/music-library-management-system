async function loadAlbums() {

    // 🛑 Prevent error if page doesn't have albumsContainer
    const container = document.getElementById("albumsContainer");
    if (!container) return;

    try {
        const res = await fetch(`${API}/albums`);
        const data = await res.json();

        // 🧠 Empty state
        if (!data || data.length === 0) {
            container.innerHTML = "<h2>No albums found 🎵</h2>";
            return;
        }

        let html = "";

        data.forEach(a => {
            html += `
            <div class="card" onclick="openAlbum(${a.album_id})">

                <div class="img-container">
                    <img src="${a.image_url}" class="cover">
                </div>

                <h3>${a.title}</h3>
                <p>Year: ${a.release_year}</p>

            </div>
            `;
        });

        container.innerHTML = html;

    } catch (err) {
        console.error("Error loading albums:", err);
        container.innerHTML = "<h2>Failed to load albums ❌</h2>";
    }
}

/* 🔗 OPEN ALBUM PAGE */
function openAlbum(id) {
    window.location.href = `albumTracks.html?id=${id}`;
}

/* 🚀 INIT */
loadAlbums();
