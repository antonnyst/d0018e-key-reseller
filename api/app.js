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
    connectionLimit: 10,
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

app.post("/game", async(req, res)=> {
    const {gameName, gameDesc, gameImg } = req.body;
    let query;
    query = `
        SELECT * FROM g3a.Users
        WHERE g3a.Users.Name = ?
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

    {/* Validate that a user is an admin */}
    if(user.userType != "admin"){
        res.statusCode = 401;
        res.send("Unauthorized")
        return;
    }

    {/* An admin needs to atleast enter a gamename */}
    if (!gameName) {
        res.statusCode = 400;
        res.send("The game needs a name");
        return;
    }

    const insertQuery = `
        INSERT INTO g3a.Games (Name, Description, ImageURL)
        VALUES (?, ?, ?)
        RETURNING ID;
    `;

    {/* Insert game and get game Id */}
    const { ID } = (await pool.query(insertQuery, [gameName,gameDesc,gameImg]))[0];
    res.send("Game added sucesfully", {ID})
});

app.put("/game/", async(req, res)=> {
    const {gameName, gameDesc, gameImg } = req.body;
    const gameId = req.params.id;

    let query;
    query = `
    SELECT * FROM g3a.Games
    WHERE g3a.Games.ID = ?
    `

    {/* Verify user session */}
    const userID = await verifySession(session)
    if (userID == null || userID == false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }

    {/* Validate that a user is an admin */}
    if(user.userType != "admin"){
        res.statusCode = 401;
        res.send("Unauthorized")
        return;
    }

    {/* Validate the GameID */}
    if (!gameId) {
        res.statusCode = 400;
        res.send("Invalid GameID");
        return;
    }
    
    {/* Makes sure an admin alters atleast one element */}
    if (!gameName && !gameDesc && !gameImg) {
        res.statusCode = 400;
        res.send("Choose atleast one element to change!");
        return;
    }

    const updateQuery = `
        UPDATE g3a.Games (Name, Description, ImageURL)
        SET Name = ?, Description = ?, ImageURL = ?
        WHERE ID = ?
    `;
    (await pool.query(updateQuery, [gameName,gameDesc,gameImg]))[0];
})

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

app.post('/signup', async (req, res) => {
    const { name, password } = req.body;

    // Validate input
    if (!name || !password) {
        return res.status(400).send("Username and password are required");
    }

    // Check if username already exists
    const existingUser = await getUser(name);
    if (existingUser) {
        return res.status(409).send("Username already taken");
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const result = await createUser(name, hashedPassword);
    if (result) {
        return res.status(201).send({ success: true, message: "User created successfully" });
    } else {
        return res.status(500).send("Failed to create user");
    }
});

app.put("/account", async(req, res)=>{
    const {session, oldPassword, newPassword} = req.body;
    console.log(session);
    console.log(oldPassword);
    console.log(newPassword);
    {/* Verify user session */}
    const userID = await verifySession(session)
    if (userID == null || userID == false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }

    {/* Get user ID*/}
    const user = await getUserID(userID)
    if (user == null) {
        res.statusCode = 401;
        res.send("No user found");
        return;
    }
    
    {/* Force user to enter old password */}
    let result = await bcrypt.compare(oldPassword, user.PasswordHash);

    if (result === false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }

    {/* New password */}
    const saltRounds = 10;
    const hash = await bcrypt.hash(newPassword.toString(), saltRounds);
    const updateQuery = `
        UPDATE g3a.Users
        SET PasswordHash = ?
        WHERE ID = ?
    `;
    {/* Insert new password to database */}
    result = await pool.query(updateQuery, [hash, userID]);

    return res.status(200).send("OK")
})

// Get account name
app.get('/account', async (req, res) => {
    const { session } = req.query;
    if (session == undefined ) {
        res.statusCode = 401;
        res.send("Unauthorized0");
        return;
    }

    const userID = await verifySession(session)
    if (userID == null || userID == false) {
        res.statusCode = 401;
        res.send("Unauthorized1");
        return;
    }

    const user = await getUserID(userID);
    if (user == null) {
        res.statusCode = 401;
        res.send("Unauthorized2");
        return;
    }

    res.send(user.Name);
    return;
});

app.get("/favorites", async (req, res) => {
    const { session } = req.query;

    {/* Verify user session */}
    const userID = await verifySession(session)
    if (userID == null || userID == false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }

    {/* Get user ID*/}
    const user = await getUserID(userID)
    if (user == null) {
        res.statusCode = 401;
        res.send("No user found");
        return;
    }

    const query = `
        SELECT g3a.Favorites.GameID FROM g3a.Favorites
        WHERE g3a.Favorites.UserID = ?
    `;
    try {
        const result = await pool.query(query, [userID]);
        return res.send(result.map((favorite) => favorite.GameID));
    } catch (err) {
        console.log(err);
    }
})
app.post("/favorites", async (req, res) => {
    const { session, gameID } = req.body;

    const userID = await verifySession(session)
    if (userID == null || userID == false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }
    const user = await getUserID(userID)
    if (user == null) {
        res.statusCode = 401;
        res.send("No user found");
    }

    const query = `
        INSERT INTO g3a.Favorites (UserID, GameID)
        VALUES (?, ?);
    `;
    try {
        const result = await pool.query(query, [userID, gameID]);
        return res.send(result);
    } catch (err) {
        console.log(err);
    }
})
app.delete("/favorites", async (req, res) => {
    const { session, gameID } = req.body;

    if(!gameID){
        res.statusCode = 400;
        res.send("Not a valid gameID");
        return;
    }

    const userID = await verifySession(session)
    if (userID == null || userID == false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }
    const user = await getUserID(userID)
    if (user == null) {
        res.statusCode = 401;
        res.send("No user found");
    }

    const query = `
    DELETE FROM g3a.Favorites( gameID)
    WHERE g3a.Favorites.UserID = ? AND g3a.Favorites.GameID = ?;
    `
    try {
        const result = await pool.query(query, [userID, gameID]);
        return res.send(result);
    } catch (err) {
        console.log(err);
        res.send("Could not delete favorite")
    }
})

app.get("/account/keys", async (req, res) => {
    const { session } = req.query;

    {/* Verify session */}
    if (session == undefined ) {
        res.statusCode = 401;
        res.send("Can't define session");
        return;
    }

    {/* Get userID */}
    const userID = await verifySession(session)
    if (userID == null || userID == false) {
        res.statusCode = 401;
        res.send("Unauthorized");
    }

    try{
        query= `
        SELECT g3a.Keys.GameID, g3a.Keys.KeyString
        FROM g3a.Keys WHERE g3a.Keys.ID IN (
            SELECT g3a.OrderKeys.KeyID FROM g3a.OrderKeys        
            WHERE g3a.OrderKeys.OrderID IN (
                SELECT g3a.Order.ID FROM g3a.Order
                WHERE g3a.Order.UserID = ? ))
        `
        const result = await pool.query(query, [userID]);
        return res.send(result);
    }catch(err){
        console.log(err);
        return
    }
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
        console.log(err);
        // Ignore errors in the query and just return null user
    }
    
    return null;
};

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
};

// Creates a new session for user with userID
const createSession = async (userID) => {
    const query = `
        INSERT INTO g3a.Sessions (UserID, SessionCookie)
        VALUES (?, ?);
    `;

    const session = uuid.v4().replace(/-/g,"");
    try {
        const result = await pool.query(query, [userID, session]);
        console.log(result);
        return session;
    } catch (err) {
        console.log(err);
        return null;
    }
    return null;
};

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
            if (checkTimestampValid(result[0].Timestamp)) {
                return result[0].UserID
            }
        }
    } catch (err) {
        console.log(err);
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
