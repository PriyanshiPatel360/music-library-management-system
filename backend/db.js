const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Rrampatel@720',
    database: 'music_library'
});

db.connect(err => {
    if (err) {
        console.log('DB Connection Error:', err);
    } else {
        console.log('MySQL Connected');
    }
});

module.exports = db;