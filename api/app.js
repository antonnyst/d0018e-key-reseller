const express = require('express')
const app = express()
const port = 3333
const bcrypt = require('bcrypt');
const uuid = require('uuid');

const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    socketPath: '/var/lib/maria/maria.sock',
    connectionLimit: 5,
    database: "g3a"
});

app.use(express.json());

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
        result = await pool.query(query);
    } catch (err) {
        throw err;
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

app.post('/account', async (req, res) => {
    const { name, password } = req.body;
    let query;

    // If username is not set
    if (!name) {
        res.statusCode = 400;
        res.send("Enter username");
        return;
    }
    
    query = `
        SELECT * FROM g3a.Users
        WHERE g3a.Users.Name = ?
    `;
    const result = await pool.query(query, [name]);
    if (result.length > 0) {
        res.statusCode = 500,
        res.send("Username taken")
        return;
    } 
    const saltRounds = 10;
    const hash = await bcrypt.hash(password.toString(), saltRounds);
    const insertQuery = `
        INSERT INTO g3a.Users (Name, PasswordHash)
        VALUES (?, ?)
        RETURNING ID;
    `;

    // Insert user and get their new UserID
    const { ID } = (await pool.query(insertQuery, [name, hash]))[0];

    // Create session for their ID
    const session = await createSession(ID)

    if (session == null) {
        res.code = 500;
        res.send("Internal Server Error");
        return;
    }
    
    res.send(session);
});

app.post('/login', async (req, res) => {
    const { name, password } = req.body;
    console.log(req.body);
    if (name == undefined || password == undefined) {
        res.statusCode = 400;
        res.send("Bad Request");
        return;
    }

    // Check that user exists
    const user = await getUser(name);
    if (user == null) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }

    // Compare password with hash
    const result = await bcrypt.compare(password, user.PasswordHash);

    if (result === false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }

    // Create session as they are authenticated
    const session = await createSession(user.ID);

    res.send(session);    
});

app.put("/account", async(req, res)=>{
    const {session, oldPassword, newPassword} = req.body;
    let query;
    query = `
        SELECT * FROM g3a.Users
        WHERE g3a.Users.ID = ?
    `;
    
    {/* Verify user session */}
    const userID = await verifySession(session)
    if (userID == null || userID == false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }

    {/* Get user ID */}
    const user = await getUserID(userID)
    if (user == null) {
        res.statusCode = 401;
        res.send("No user found");
        return;
    }
    
    {/* Force user to enter old password */}
    const result = await bcrypt.compare(oldPassword, user.PasswordHash);

    if (result === false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }

    {/* New password */}
    const saltRounds = 10;
    const hash = await bcrypt.hash(newPassword.toString(), saltRounds);
    const updateQuery = `
        UPDATE g3a.Users (PasswordHash)
        SET PasswordHash = ?
        WHERE ID = ?
    `;
    {/* Insert new password to database */}
    (await pool.query(updateQuery, [hash, userID]))[0];
})


// Retrieves an user or null if no user is found
const getUser = async (name) => {
    const query = `   
        SELECT * FROM g3a.Users 
        WHERE g3a.Users.Name = ?
    `;
    
    try {
        const result = await pool.query(query, [name]);
        if (result.length > 0) {
            // There is an user with name
            return result[0];
        }
    } catch (err) {
        // Ignore errors in the query and just return null user
    }
    
    return null;
}

const getUserID = async (userID) => {
    const query = `   
        SELECT * FROM g3a.Users 
        WHERE g3a.Users.ID = ?
    `;
    
    try {
        const result = await pool.query(query, [userID]);
        if (result.length > 0) {
            // There is an user with name
            return result[0];
        }
    } catch (err) {
        // Ignore errors in the query and just return null user
    }
    
    return null;
}

// Creates a new session for user with userID
const createSession = async (userID) => {
    const query = `
        INSERT INTO g3a.Sessions (UserID, SessionCookie)
        VALUES (?, ?);
    `;

    const session = uuid.v4();

    try {
        const result = await pool.query(query, [userID, session]);
        console.log(result);
        return session;
    } catch (err) {
        console.log(err);
        return null;
    }
    return null;
}

// Returns UserID from an session if it is actual (not too old)
const verifySession = async (session) => {
    const query = `
        SELECT UserID, Timestamp FROM g3a.Sessions
        WHERE g3a.Sessions.SessionCookie = ?;
    `;

    try {
        const result = await pool.query(query, [session]);
        if (result.length > 0) {
            // Found the session!
            // Check if it is not too old
            if (checkTimestampValid(timestamp)) {
                return result[0].UserID
            }
        }
    } catch (err) {
        // Ignore errors and just return null
    }
    return null;
}

const checkTimestampValid = async (timestamp) => {
    console.log(timestamp);
    console.log(timestamp.toString());
    // TODO compare time!
    return true;
}

app.listen(port, () => {
    console.log(`API listening on ${port}`)
})
