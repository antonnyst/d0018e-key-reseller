const express = require('express')
const app = express()
const port = 3333

const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost', 
    user:'root', 
    socketPath: '/var/lib/maria/maria.sock',
    connectionLimit: 5,
    database: "g3a"
});

// GET games 
// returnar alla games i json
app.get('/games', async (req, res) => {
    let conn;
    let result;
    try {
        conn = await pool.getConnection();
        result = await conn.query("SELECT * FROM g3a.Games");
    } catch (err) {
	    throw err;
    } finally {
	    if (conn) conn.end();
    }
    res.send(result);
});

app.listen(port, () => {
    console.log(`API listening on ${port}`)
})
