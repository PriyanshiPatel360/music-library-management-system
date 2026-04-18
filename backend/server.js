const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const db = require('./db');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const JWT_SECRET = 'music-app-super-secret-jwt-key-2024';

app.use(cors({
    origin: function(origin, callback) { return callback(null, true); },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({
  dest: path.join(__dirname, '../frontend/songs/'),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
      cb(null, true);
    } else {
      cb(new Error('Only MP3 files allowed'), false);
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please login.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

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
    const { name, bio, image_url } = req.body;
    db.query('UPDATE artists SET name=?, bio=?, image_url=? WHERE artist_id=?', [name, bio, image_url, req.params.id], (err) => {
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
        a.title AS album, t.artist_name AS artist, g.name AS genre
        FROM tracks t 
        LEFT JOIN albums a ON t.album_id = a.album_id 
        LEFT JOIN genres g ON t.genre_id = g.genre_id
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

app.post('/tracks', authMiddleware, (req, res) => {
    const { title, album_id, artist_id, artist_name, genre_id, duration, audio_url, image_url } = req.body;
    const owner_id = req.user.user_id;
    // album_id can be empty string -> make it null
    const finalAlbumId = album_id || null;
    db.query(
        'INSERT INTO tracks (title, album_id, artist_id, artist_name, genre_id, duration, audio_url, image_url, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [title, finalAlbumId, artist_id, artist_name, genre_id, duration, audio_url, image_url, owner_id],
        (err, result) => {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ message: 'Track added', insertId: result.insertId });
        }
    );
});

app.post('/upload-song', authMiddleware, upload.single('song'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No MP3 file uploaded' });
  
  const newFilename = uuidv4() + '.mp3';
  const newPath = path.join(req.file.destination, newFilename);
  await fs.rename(req.file.path, newPath);
  
  res.json({ audio_url: `/songs/${newFilename}` });
});

app.put('/tracks/:id', authMiddleware, (req, res) => {
    const { title, album_id, artist_id, artist_name, genre_id, duration, audio_url, image_url } = req.body;
    const userId = req.user.user_id;
    const finalAlbumId = album_id || null;
    db.query(
        'UPDATE tracks SET title=?, album_id=?, artist_id=?, artist_name=?, genre_id=?, duration=?, audio_url=?, image_url=? WHERE track_id=? AND (owner_id = ? OR owner_id IS NULL)',
        [title, finalAlbumId, artist_id, artist_name, genre_id, duration, audio_url, image_url, req.params.id, userId],
        (err, result) => {
            if (err) return res.status(400).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Track not found or not owned by you' });
            res.json({ message: 'Track updated' });
        }
    );
});

app.delete('/tracks/:id', authMiddleware, (req, res) => {
    const userId = req.user.user_id;
    db.query('DELETE FROM tracks WHERE track_id=? AND (owner_id = ? OR owner_id IS NULL)', [req.params.id, userId], (err, result) => {
        if (err) return res.status(400).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Track not found or not owned by you' });
        res.json({ message: 'Track deleted' });
    });
});


/* ---------------- ALBUMS & GENRES ---------------- */

app.get('/albums', (req, res) => {
    db.query(`
        SELECT al.*, ar.name AS artist_name 
        FROM albums al 
        LEFT JOIN artists ar ON al.artist_id = ar.artist_id
    `, (err, result) => {
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
        SELECT t.*, a.title AS album, t.artist_name AS artist
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
        JOIN artists ar ON t.artist_id = ar.artist_id
        WHERE t.album_id = ?
    `, [req.params.id], (err, result) => {
        if (err) return res.json({ error: err.message });
        res.json(result);
    });
});

/* ---------------- AUTH ---------------- */

app.get('/me', authMiddleware, (req, res) => {
    res.json(req.user);
});

app.get('/my-tracks', authMiddleware, (req, res) => {
  const userId = req.user.user_id;
  db.query(`
    SELECT t.*, a.title AS album, ar.name AS artist, g.name AS genre
    FROM tracks t 
    LEFT JOIN albums a ON t.album_id = a.album_id 
    LEFT JOIN artists ar ON t.artist_id = ar.artist_id 
    LEFT JOIN genres g ON t.genre_id = g.genre_id
    WHERE t.owner_id = ?
    ORDER BY t.created_at DESC
  `, [userId], (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result);
  });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err, result) => {
        if (err) return res.status(400).json({ error: err.message });
        const user = { user_id: result.insertId, username, email: null, profile_image: null };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT * FROM users WHERE LOWER(username)=LOWER(?) AND password=?", [username, password], (err, result) => {
        if (err || !result.length) return res.json({ success: false });
        
        const user = result[0];
        delete user.password; // Don't put password in JWT
        
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user });
    });
});

app.put('/users/me', authMiddleware, (req, res) => {
    const { username, email, password, profile_image } = req.body;
    const userId = req.user.user_id;

    // Build dynamic query depending on what's provided
    let query = 'UPDATE users SET username=?, email=?, profile_image=?';
    let params = [username, email, profile_image];
    
    if (password) {
        query += ', password=?';
        params.push(password);
    }
    
    query += ' WHERE user_id=?';
    params.push(userId);
    
    db.query(query, params, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        
        db.query('SELECT user_id, username, email, profile_image FROM users WHERE user_id=?', [userId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            const updatedUser = result[0];
            const token = jwt.sign(updatedUser, JWT_SECRET, { expiresIn: '7d' });
            res.json({ message: 'Profile updated', token, user: updatedUser });
        });
    });
});

/* ---------------- SERVER ---------------- */
app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});

