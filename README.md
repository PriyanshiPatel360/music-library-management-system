# music-library-management-system
 # 🎵 Music App (Full-Stack)

A full-stack music web application where users can explore songs, view artists & albums, and create playlists with an integrated audio player.

---

## Features

- 🎧 Play songs with built-in audio player  
- 👨‍🎤 Browse artists and their songs  
- 💿 View albums and album tracks  
- 📁 Create playlists  
- ➕ Add songs to playlists  
- 🗑 Remove playlists  
- 🔍 Search songs  
- 🔐 User login & register system  

---

## 🛠 Tech Stack

### Frontend
- HTML  
- CSS  
- JavaScript  

### Backend
- Node.js  
- Express.js  

### Database
- MySQL  

---

## 📂 Project Structure
MUSIC APP/
│── backend/
│ └── server.js
│
│── database/
│ └── schema.sql
│
│── frontend/
│ ├── images/
│ ├── songs/
│ ├── index.html
│ ├── landing.html
│ ├── login.html
│ ├── register.html
│ ├── artists.html
│ ├── artistSongs.html
│ ├── albums.html
│ ├── albumTracks.html
│ ├── playlist.html
│ ├── playlistSongs.html
│ ├── app.js
│ ├── artists.js
│ ├── albums.js
│ ├── albumTracks.js
│ ├── playlists.js
│ ├── playlistSongs.js
│ ├── login.js
│ ├── register.js
│ ├── config.js
│ └── style.css




---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/music-app.git
cd music-app

2️⃣ Install Dependencies
npm install

3️⃣ Setup Database
Open MySQL (Workbench / XAMPP / phpMyAdmin)
Run:
database/schema.sql

Make sure database name is:
music_library

4️⃣ Configure Backend

📁 Open backend/server.js

Update:

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "music_library"
});

5️⃣ Run Server
node backend/server.js

6️⃣ Open App

-> Open in browser:

http://localhost:5000/frontend/landing.html

