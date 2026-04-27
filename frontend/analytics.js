async function loadAnalytics() {
    try {
        // Popular Genres
        const genresRes = await fetch('/analytics/popular-genre');
        const genresData = await genresRes.json();
        displayGenres(genresData.popular_genres);
        
        // Songs per Artist  
        const artistsRes = await fetch('/analytics/songs-per-artist');
        const artistsData = await artistsRes.json();
        displayArtists(artistsData.songs_per_artist);
        
        // Playlist Counts
        const playlistsRes = await fetch('/analytics/playlist-counts');
        const playlistsData = await playlistsRes.json();
        displayPlaylists(playlistsData.playlist_counts);
        
    } catch (error) {
        console.error('Error loading analytics:', error);
        document.querySelector('.container').innerHTML += '<p style="color: red; text-align: center;">Error loading data. Is server running?</p>';
    }
}

function displayGenres(genres) {
    const container = document.getElementById('popular-genres');
    container.innerHTML = '';
    genres.forEach(genre => {
        const div = document.createElement('div');
        div.className = 'stat-card';
        div.innerHTML = `<strong>${genre.name}</strong><br>${genre.count} songs`;
        container.appendChild(div);
    });
}

function displayArtists(artists) {
    const container = document.getElementById('songs-per-artist');
    container.innerHTML = '';
    artists.slice(0, 10).forEach(artist => {  // Top 10
        const div = document.createElement('div');
        div.className = 'stat-item';
        div.innerHTML = `<strong>${artist.name}</strong>: ${artist.song_count} songs`;
        container.appendChild(div);
    });
}

function displayPlaylists(playlists) {
    const container = document.getElementById('playlist-counts');
    container.innerHTML = '';
    playlists.forEach(playlist => {
        const div = document.createElement('div');
        div.className = 'stat-item';
        div.innerHTML = `<strong>${playlist.name}</strong> (${playlist.playlist_id}): ${playlist.song_count} songs`;
        container.appendChild(div);
    });
}

// Load on page load
loadAnalytics();
