-- CREATE DATABASE
CREATE DATABASE music_library;
USE music_library;

-- ========================
-- TABLES
-- ========================

CREATE TABLE artists (
    artist_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    bio TEXT,
    image_url VARCHAR(255)
);

CREATE TABLE genres (
    genre_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE albums (
    album_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    artist_id INT,
    release_year INT,
    image_url VARCHAR(255),
    FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE
);

CREATE TABLE tracks (
    track_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    artist_name VARCHAR(100),
    artist_id INT,
    album_id INT NULL,
    genre_id INT,
    duration TIME,
    audio_url VARCHAR(255),
    image_url VARCHAR(255),
    FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE,
    FOREIGN KEY (album_id) REFERENCES albums(album_id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(genre_id)
);

CREATE TABLE playlists (
    playlist_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE playlist_tracks (
    playlist_id INT,
    track_id INT,
    PRIMARY KEY (playlist_id, track_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(playlist_id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(track_id) ON DELETE CASCADE
);

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50),
    password VARCHAR(50)
);

CREATE TABLE favorites (
    user_id INT,
    track_id INT,
    PRIMARY KEY(user_id, track_id)
);

-- NEW FOR USER TRACKS: Add owner_id column + timestamps
ALTER TABLE tracks ADD COLUMN owner_id INT NULL AFTER image_url,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tracks ADD FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE SET NULL;


-- ========================
-- INSERT DATA (CORRECT ORDER)
-- ========================

-- Artists
INSERT INTO artists (name, bio, image_url) VALUES
('Arijit Singh', 'Indian singer', 'http://localhost:5000/images/arijit.jpg'),
('Shreya Ghoshal', 'Playback singer', 'http://localhost:5000/images/shreya.jpg'),
('Armaan Malik', 'Singer', 'http://localhost:5000/images/armaan.jpg'),
('Atif Aslam', 'Singer', 'http://localhost:5000/images/atif.jpg'),
('Neha Kakkar', 'Singer', 'http://localhost:5000/images/neha.jpg'),
('KK', 'Legendary Bollywood singer', 'http://localhost:5000/images/kk.jpg'),
('Sonu Nigam', 'Versatile playback singer', 'http://localhost:5000/images/sonu.jpg'),
('Jubin Nautiyal', 'Modern romantic singer', 'http://localhost:5000/images/jubin.jpg'),
('Diljit Dosanjh', 'Punjabi singer and actor', 'http://localhost:5000/images/diljit.jpg'),
('Badshah', 'Indian rapper', 'http://localhost:5000/images/badshah.jpg'),
('Kumar Sanu', '90s Bollywood singer', 'http://localhost:5000/images/kumar.jpg'),
('A R Rahman', 'Music legend', 'http://localhost:5000/images/arrahman.jpg'),
('Stebin Ben', 'Modern singer', 'http://localhost:5000/images/stebin.jpg'),
('Kishore Kumar', 'Legendary singer', 'http://localhost:5000/images/kishore.jpg'),
('Nusrat Fateh Ali Khan', 'Qawwali legend', 'http://localhost:5000/images/nusrat.jpg'),
('Faheem Abdullah', 'Singer', 'http://localhost:5000/images/faheem.jpg'),
('Afusic', 'Singer', 'http://localhost:5000/images/afusic.jpg'),
('Flipperachi', 'Singer', 'http://localhost:5000/images/flipperachi.jpg'),
('Samantha Prabhu', 'Actress and singer', 'http://localhost:5000/images/samantha.jpg'),
('Alka Yagnik', '90s Bollywood singer', 'http://localhost:5000/images/alka.jpg'),
('Sunidhi Chuhan', 'Singer', 'http://localhost:5000/images/sunidi.jpg');

-- Genres
INSERT INTO genres (name) VALUES
('Romantic'),
('Pop'),
('Sad'),
('Rock'),
('EDM'),
('Hip Hop'),
('Classical'),
('Punjabi'),
('Indie'),
('Lo-fi');

-- Albums
INSERT INTO albums (title, artist_id, release_year, image_url) VALUES
('Love Album', 1, 2020, 'http://localhost:5000/images/album1.jpg'),
('Melody Hits', 2, 2021, 'http://localhost:5000/images/album2.webp'),
('Romantic Hits', 3, 2019, 'http://localhost:5000/images/album3.jpg'),
('Soulful Voice', 4, 2018, 'http://localhost:5000/images/album4.jpg'),
('Soul Hits', 6, 2015, 'http://localhost:5000/images/album5.jpg'),
('Evergreen Classics', 7, 2010, 'http://localhost:5000/images/album6.jpg'),
('Modern Love', 8, 2022, 'http://localhost:5000/images/album7.jpg'),
('Punjabi Vibes', 9, 2021, 'http://localhost:5000/images/album8.jpg'),
('Rap Beats', 10, 2020, 'http://localhost:5000/images/album9.jpg'), 
('Atif Hits', 4, 2010, 'http://localhost:5000/images/album10.jpg'),
('Arijit Hits', 1, 2015, 'http://localhost:5000/images/album11.jpg'),
('90s Classics', 11, 1995, 'http://localhost:5000/images/album12.jpg'),
('AR Rahman Hits', 12, 2000, 'http://localhost:5000/images/album13.jpg'),
('Sonu Hits', 7, 2005, 'http://localhost:5000/images/album14.jpg'),
('Stebin Hits', 13, 2020, 'http://localhost:5000/images/album15.jpg'),
('Kishore Hits', 14, 1980, 'http://localhost:5000/images/album16.jpg'),
('Nusrat Hits', 15, 1990, 'http://localhost:5000/images/album17.jpg');

-- Tracks (NOW NO ERROR 🔥)
INSERT INTO tracks (title, album_id, genre_id, duration, audio_url, image_url) VALUES
-- Flipperachi
('Dhurandhar Song Baloch', 9, 4, '00:04:10', 'http://localhost:5000/songs/dhurandharsongbaloch.mp3', 'http://localhost:5000/images/dhurandhar.jpg'),

-- Samantha Prabhu
('Tufan', 9, 2, '00:04:00', 'http://localhost:5000/songs/tufan.mp3', 'http://localhost:5000/images/tufan.webp'),

-- Arijit Singh (Album 1)
('Channa Mereya', 11, 1, '00:04:50', 'http://localhost:5000/songs/channa.mp3', 'http://localhost:5000/images/channa.jpg'),
('Sun Raha Hai', 1, 1, '00:05:00', 'http://localhost:5000/songs/sunrahahai.mp3', 'http://localhost:5000/images/sunrahahai.jpg'),
('Tum Hi Ho', 1, 1, '00:04:00', 'http://localhost:5000/songs/tumhiho.mp3', 'http://localhost:5000/images/tumhiho.jpg'),
('Sanam Ko Apna Banane', 1, 1, '00:05:00', 'http://localhost:5000/songs/sanam.mp3', 'http://localhost:5000/images/sanam.jpg'),

-- Shreya Ghoshal (Album 2)
('Teri Ore', 2, 1, '00:05:20', 'http://localhost:5000/songs/teriore.mp3', 'http://localhost:5000/images/teriore.jpg'),
('Deewani Mastani', 2, 7, '00:05:30', 'http://localhost:5000/songs/deewani.mp3', 'http://localhost:5000/images/deewani.jpg'),
('Isq Da Chehra', 2, 5, '00:03:50', 'http://localhost:5000/songs/isqdachehra.mp3', 'http://localhost:5000/images/isqdachehra.jpg'),
('Raabta', 2, 1, '00:04:10', 'http://localhost:5000/songs/raabta.mp3', 'http://localhost:5000/images/raabta.jpg'),

-- Armaan Malik (Album 3)
('Bol Do Na Zara', 3, 1, '00:04:00', 'http://localhost:5000/songs/boldo.mp3', 'http://localhost:5000/images/boldo.jpg'),
('Main Rahoon Ya Na Rahoon', 3, 3, '00:05:00', 'http://localhost:5000/songs/mainrahoon.mp3', 'http://localhost:5000/images/mainrahoon.jpg'),

-- Atif Aslam (Album 4)
('Pehli Nazar Mein', 10, 1, '00:05:10', 'http://localhost:5000/songs/pehli.mp3', 'http://localhost:5000/images/pehli.jpg'),
('Tera Hone Laga Hoon', 10, 1, '00:04:00', 'http://localhost:5000/songs/tera.mp3', 'http://localhost:5000/images/tera.jpg'),
('Dil Diyan Gallan', 10, 1, '00:05:00', 'http://localhost:5000/songs/dilgalan.mp3', 'http://localhost:5000/images/dilgalan.jpg'),
('Dil Meri Na Sune', 10, 1, '00:04:30', 'http://localhost:5000/songs/dilmeri.mp3', 'http://localhost:5000/images/dilmeri.jpg'),
('Dheere Dheere Se', 10, 1, '00:05:00', 'http://localhost:5000/songs/dheere.mp3', 'http://localhost:5000/images/dheere.jpg'),

-- KK (Album 5)
('Zara Sa', 4, 3, '00:05:00', 'http://localhost:5000/songs/zarasa.mp3', 'http://localhost:5000/images/zarasa.jpg'),
('Khuda Jaane', 4, 1, '00:05:30', 'http://localhost:5000/songs/khudajaane.mp3', 'http://localhost:5000/images/khudajaane.jpg'),

-- Sonu Nigam (Album 6)
('Kal Ho Naa Ho', 14, 3, '00:05:20', 'http://localhost:5000/songs/kalhonaaho.mp3', 'http://localhost:5000/images/kalhonaaho.jpg'),
('Abhi Mujh Mein Kahin', 14, 3, '00:06:00', 'http://localhost:5000/songs/abhimujh.mp3', 'http://localhost:5000/images/abhimujh.jpg'),
('Tumhe Jo Maine Dekha', 14, 4, '00:05:20', 'http://localhost:5000/songs/tumhe.mp3', 'http://localhost:5000/images/tumhe.jpg'),

-- Jubin Nautiyal (Album 7)
('Lut Gaye', 8, 1, '00:04:10', 'http://localhost:5000/songs/lutgaye.mp3', 'http://localhost:5000/images/lutgaye.jpg'),
('Tum Hi Aana', 8, 3, '00:04:20', 'http://localhost:5000/songs/tumhiaana.mp3', 'http://localhost:5000/images/tumhiaana.jpg'),


-- Kumar Sanu
('Us Ladki Pe Dil Aaya Hai', 12, 1, '00:05:00', 'http://localhost:5000/songs/usladki.mp3', 'http://localhost:5000/images/usladki.jpg'),
('Pehli Pehli Baar Mohabbat Ki Hai', 12, 1, '00:04:40', 'http://localhost:5000/songs/pehlipheli.mp3', 'http://localhost:5000/images/pehlipheli.jpg'),
('Aap Ka Aana Dil Dhadkana', 12, 1, '00:05:00', 'http://localhost:5000/songs/aapka.mp3', 'http://localhost:5000/images/aapka.jpg'),

-- A R Rahman
('Dil Hai Chota Sa', 13, 7, '00:04:20', 'http://localhost:5000/songs/dilhchota.mp3', 'http://localhost:5000/images/dilhchota.jpg'),
('Taal Se Taal Mila', 13, 7, '00:05:30', 'http://localhost:5000/songs/taal.mp3', 'http://localhost:5000/images/taal.jpg'),

-- Stebin Ben
('Tum Jo Aaye Yaara', 15, 1, '00:04:00', 'http://localhost:5000/songs/tumjoaye.mp3', 'http://localhost:5000/images/tumjoaye.jpg'),

-- Kishore Kumar
('Saiyaara Tu Badla Nahi (Old)', 16, 7, '00:05:10', 'http://localhost:5000/songs/saiyaara_old.mp3', 'http://localhost:5000/images/saiyaara_old.jpg'),

-- Faheem Abdullah
('Saiyaara Tu Badla Nahi (New)', 1, 1, '00:04:10', 'http://localhost:5000/songs/saiyaara_new.mp3', 'http://localhost:5000/images/saiyaara_new.jpg'),

-- Afusic
('Pal Pal Jeena Muhal', 4, 3, '00:04:30', 'http://localhost:5000/songs/palpal.mp3', 'http://localhost:5000/images/palpal.jpg'),

-- Nusrat Fateh Ali Khan
('Afreen Afreen', 17, 7, '00:06:00', 'http://localhost:5000/songs/afreen.mp3', 'http://localhost:5000/images/afreen.jpg'),
('Nit Khair Manga', 17, 1, '00:06:30', 'http://localhost:5000/songs/nitkhair.mp3', 'http://localhost:5000/images/nitkhair.jpg');


-- Playlist
INSERT INTO playlists (name) VALUES ('My Favorites');

INSERT INTO playlist_tracks VALUES (1,1),(1,2);

-- ========================
-- QUERIES
-- ========================

-- Search by title
SELECT * FROM tracks WHERE title LIKE '%Tum%';

-- Search by artist
SELECT t.*
FROM tracks t
JOIN albums al ON t.album_id = al.album_id
JOIN artists ar ON al.artist_id = ar.artist_id
WHERE ar.name LIKE '%Arijit%';

-- Search by genre
SELECT t.*
FROM tracks t
JOIN genres g ON t.genre_id = g.genre_id
WHERE g.name = 'Pop';

SELECT t.*
FROM playlist_tracks pt
JOIN tracks t ON pt.track_id = t.track_id
WHERE pt.playlist_id = 1;


-- Analytics
SELECT g.name, COUNT(*) AS total
FROM tracks t
JOIN genres g ON t.genre_id = g.genre_id
GROUP BY g.name
ORDER BY total DESC
LIMIT 1;