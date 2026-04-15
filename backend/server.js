const express = require('express');
const db = require('./db');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

/* ---------------- STATIC FILES ---------------- */

app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/songs', express.static(path.join(__dirname, '../frontend/songs')));
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));

/* ---------------- ARTISTS ---------------- */

app.get('/artists', (req, res) => {
    db.query('SELECT * FROM artists', (err, result) => {
        if (err) return res.json({ error: err.message });
        res.json(result);
    });
});

/* ---------------- Artist Top Songs (LIMIT 5) ---------------- */
app.get('/artists/:id/songs', (req, res) => {
    db.query(`
        SELECT t.*, g.name AS genre, al.title AS album, ar.name AS artist
        FROM tracks t
        JOIN genres g ON t.genre_id = g.genre_id
        JOIN albums al ON t.album_id = al.album_id
        JOIN artists ar ON al.artist_id = ar.artist_id
        WHERE al.artist_id = ?
        ORDER BY t.title 
        LIMIT 5
    `, [req.params.id], (err, result) => {
        if (err) return res.json({ error: err.message });
        res.json(result);
    });
});

app.post('/artists', (req, res) => {
    const { name, bio, image_url } = req.body;
    db.query('INSERT INTO artists (name, bio, image_url) VALUES (?, ?, ?)', [name, bio, image_url], (err) => {
        if (err) return res.json({ error: err.message });
        res.json({ message: "Artist added" });
    });
});

app.put('/artists/:id', (req, res) => {
    const { name, bio } = req.body;
    db.query('UPDATE artists SET name=?, bio=? WHERE artist_id=?', [name, bio, req.params.id], (err) => {
        if (err) return res.json({ error: err.message });
        res.json({ message: "Artist updated" });
    });
});

app.get('/artist/:id', (req, res) => {
    db.query(`
        SELECT t.*, g.name AS genre, al.title AS album, ar.name AS artist
        FROM tracks t
        JOIN genres g ON t.genre_id = g.genre_id
        JOIN albums al ON t.album_id = al.album_id
        JOIN artists ar ON al.artist_id = ar.artist_id
        WHERE al.artist_id = ?
    `, [req.params.id], (err, result) => {
        if (err) return res.json({ error: err.message });
        res.json(result);
    });
});

app.delete('/artists/:id', (req, res) => {
    db.query('DELETE FROM artists WHERE artist_id=?', [req.params.id], (err) => {
        if (err) return res.json({ error: err.message });
        res.json({ message: "Artist deleted" });
    });
});

/* ---------------- TRACKS ---------------- */

app.get('/tracks', (req, res) => {
    db.query(`
        SELECT t.track_id, t.title, t.audio_url, t.image_url, t.duration,
        a.title AS album, ar.name AS artist, g.name AS genre
        FROM tracks t JOIN albums a ON t.album_id = a.album_id 
        JOIN artists ar ON a.artist_id = ar.artist_id 
        JOIN genres g ON t.genre_id = g.genre_id
    `, (err, result) => {
        if (err) return res.json({ error: err.message });
        res.json(result);
    });
});

app.get('/search', (req, res) => {
    const q = `%${req.query.q}%`;
    db.query('SELECT * FROM tracks WHERE title LIKE ?', [q], (err, result) => {
        if (err) return res.json({ error: err.message });
        res.json(result);
    });
});

/* ---------------- TRACKS CRUD ---------------- */

app.post('/tracks', (req, res) => {
    const { title, album_id, genre_id, duration, audio_url, image_url } = req.body;
    db.query(
        'INSERT INTO tracks (title, album_id, genre_id, duration, audio_url, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        [title, album_id, genre_id, duration, audio_url, image_url],
        (err, result) => {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ message: 'Track added', insertId: result.insertId });
        }
    );
});

app.put('/tracks/:id', (req, res) => {
    const { title, album_id, genre_id, duration, audio_url, image_url } = req.body;
    db.query(
        'UPDATE tracks SET title=?, album_id=?, genre_id=?, duration=?, audio_url=?, image_url=? WHERE track_id=?',
        [title, album_id, genre_id, duration, audio_url, image_url, req.params.id],
        (err, result) => {
            if (err) return res.status(400).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Track not found' });
            res.json({ message: 'Track updated' });
        }
    );
});

app.delete('/tracks/:id', (req, res) => {
    db.query('DELETE FROM tracks WHERE track_id=?', [req.params.id], (err, result) => {
        if (err) return res.status(400).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Track not found' });
        res.json({ message: 'Track deleted' });
    });
});


/* ---------------- ALBUMS & GENRES ---------------- */

app.get('/albums', (req, res) => {
    db.query('SELECT * FROM albums', (err, result) => {
        if (err) return res.json({ error: err.message });
        res.json(result);
    });
});

app.get('/genres', (req, res) => {
    db.query('SELECT * FROM genres', (err, result) => {
        if (err) return res.json({ error: err.message });
        res.json(result);
    });
});

/* ---------------- PLAYLISTS ---------------- */

app.get('/playlists', (req, res) => {
    db.query('SELECT * FROM playlists', (err, result) => {
        if (err) return res.json({ error: err.message });
        res.json(result);
    });
});

app.post('/playlists', (req, res) => {
    const { name } = req.body;
    db.query('INSERT INTO playlists (name) VALUES (?)', [name], (err) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Playlist created" });
    });
});

app.post('/playlists/add', (req, res) => {
    const { playlist_id, track_id } = req.body;

    // CHECK IF EXISTS FIRST
    db.query('SELECT * FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?', [playlist_id, track_id], (err, exists) => {
        if (err) return res.status(500).json({ error: err.message });

        if (exists.length > 0) {
            return res.json({ success: false, message: "Song already in playlist" });
        }

        // INSERT IF NOT EXISTS
        db.query('INSERT INTO playlist_tracks (playlist_id, track_id) VALUES (?, ?)', [playlist_id, track_id], (err) => {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ success: true, message: "Added" });
        });
    });
});

app.get('/playlist/:id', (req, res) => {
    db.query(`
        SELECT t.*, a.title AS album
        FROM playlist_tracks pt 
        JOIN tracks t ON pt.track_id = t.track_id
        LEFT JOIN albums a ON t.album_id = a.album_id
        WHERE pt.playlist_id = ?
    `, [req.params.id], (err, result) => {
        if (err) return res.json({ error: err.message });
        res.json(result);
    });
});

app.delete('/playlist/remove', (req, res) => {
    const { playlist_id, track_id } = req.body;
    db.query('DELETE FROM playlist_tracks WHERE playlist_id=? AND track_id=?', [playlist_id, track_id], (err) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Removed" });
    });
});

app.delete('/playlists/:id', (req, res) => {
    db.query('DELETE FROM playlists WHERE playlist_id=?', [req.params.id], (err) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Deleted" });
    });
});

/* ---------------- ALBUM TRACKS ---------------- */

app.get('/album/:id', (req, res) => {
    db.query(`
        SELECT t.*, g.name AS genre, a.title AS album, ar.name AS artist
        FROM tracks t 
        JOIN genres g ON t.genre_id = g.genre_id
        JOIN albums a ON t.album_id = a.album_id
        JOIN artists ar ON a.artist_id = ar.artist_id
        WHERE t.album_id = ?
    `, [req.params.id], (err, result) => {
        if (err) return res.json({ error: err.message });
        res.json(result);
    });
});

/* ---------------- AUTH ---------------- */

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ success: true });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT * FROM users WHERE LOWER(username)=LOWER(?) AND password=?", [username, password], (err, result) => {
        if (err || !result.length) return res.json({ success: false });
        res.json({ success: true, user: result[0] });
    });
});

/* ---------------- SERVER ---------------- */

app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});

