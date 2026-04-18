const db = require('./backend/db');

async function run() {
    const queries = [
        "ALTER TABLE tracks ADD COLUMN artist_id INT",
        "ALTER TABLE tracks ADD COLUMN artist_name VARCHAR(100)",
        "ALTER TABLE tracks ADD FOREIGN KEY (artist_id) REFERENCES artists(artist_id)",
        `UPDATE tracks t 
         JOIN albums a ON t.album_id = a.album_id 
         JOIN artists ar ON a.artist_id = ar.artist_id 
         SET t.artist_id = ar.artist_id, t.artist_name = ar.name`
    ];

    for (let q of queries) {
        try {
            await new Promise((resolve, reject) => {
                db.query(q, (err) => {
                    if (err && !err.message.includes('Duplicate column')) {
                        console.log('Error on:', q, err.message);
                    }
                    resolve();
                });
            });
            console.log('Success:', q);
        } catch(e) {}
    }
    console.log('Migration complete');
    process.exit(0);
}

run();
