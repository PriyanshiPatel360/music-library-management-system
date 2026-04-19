const fs = require('fs');
let code = fs.readFileSync('frontend/app.js', 'utf8');


code = code.replace(
    'window.startEdit = function(id, title, album_id, genre_id, duration, audio_url, image_url) {',
    'window.startEdit = function(id, title, artist_id, album_id, genre_id, duration, audio_url, image_url) {'
);


code = code.replace(
    "document.getElementById('trackAlbum').value = album_id || '';",
    "document.getElementById('trackArtist').value = artist_id || '';\n    document.getElementById('trackAlbum').value = album_id || '';"
);


code = code.replace(
    "startEdit(${track.track_id}, '${safeTitle}', ${track.album_id || 'null'}, ${track.genre_id || 'null'}, '${track.duration || ''}', '${track.audio_url || ''}', '${track.image_url || ''}')",
    "startEdit(${track.track_id}, '${safeTitle}', ${track.artist_id || 'null'}, ${track.album_id || 'null'}, ${track.genre_id || 'null'}, '${track.duration || ''}', '${track.audio_url || ''}', '${track.image_url || ''}')"
);


const globalMatch = /startEdit\(\$\{track\.track_id\}, '\$\{safeTitle\}', \$\{track\.album_id/g;
code = code.replace(globalMatch, "startEdit(${track.track_id}, '${safeTitle}', ${track.artist_id || 'null'}, ${track.album_id");


const persistLogic = `
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
`;

if (!code.includes('PLAYBACK STATE PERSISTENCE')) {
    code += persistLogic;
}


if (!code.includes('restoreFlag')) {
    code = code.replace(
        'window.playSongGlobal = function(title, artist, img, src) {',
        'window.playSongGlobal = function(title, artist, img, src, restoreFlag) {'
    );

    code = code.replace(
        "window.currentAudio.play().catch(e => console.error('Play error:', e));",
        `
        if (restoreFlag && localStorage.getItem('cachedTrack')) {
            const ct = JSON.parse(localStorage.getItem('cachedTrack'));
            window.currentAudio.addEventListener('loadedmetadata', () => {
                window.currentAudio.currentTime = ct.currentTime;
            }, {once:true});
        }
        window.currentAudio.play().catch(e => console.error('Play error:', e));
        `
    );
}

fs.writeFileSync('frontend/app.js', code);
console.log('Processed app.js edits!');
