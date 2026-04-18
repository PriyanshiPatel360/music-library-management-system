const db = require('./backend/db');

db.query(`
    ALTER TABLE users
    ADD COLUMN email VARCHAR(255) NULL,
    ADD COLUMN profile_image VARCHAR(255) NULL;
`, (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist.');
        } else {
            console.error(err);
        }
    } else {
        console.log('Migration successful', result);
    }
    process.exit();
});
