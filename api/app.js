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
// search string genom /game?search=text
app.get('/game', async (req, res) => {
    let query;
    if (req.query.search) {
        // Search with string
        query = `
            SELECT * FROM g3a.Games 
            WHERE 
                (g3a.Games.Name LIKE '%${req.query.search}%') OR 
                (g3a.Games.Description LIKE '%${req.query.search}%')
        `
    } else {
        // Get all games
        query = "SELECT * FROM g3a.Games"
    }

    let conn;
    let result;
    try {
        conn = await pool.getConnection();
        console.log(query)
        result = await conn.query(query);
    } catch (err) {
	    throw err;
    } finally {
	    if (conn) conn.end();
    }
    res.send(result);
});

app.get('/game/:id', async (req, res) => {
    let query;
    if (req.params.id) {
        query = `
            SELECT * FROM g3a.Games 
            WHERE g3a.Games.ID = '${req.params.id}'
        `;
    } else {
        res.statusCode = 500;
        res.send("Error");
        return;
    }

    let conn;
    let result;
    try {
        conn = await pool.getConnection();
        result = await conn.query(query);
    } catch (err) {
	    throw err;
    } finally {
	    if (conn) conn.end();
    }
    res.send(result[0]);
});

app.listen(port, () => {
    console.log(`API listening on ${port}`)
})
