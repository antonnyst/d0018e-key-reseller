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
    let params = [];
    let session = req.query.session;

    if (req.query.search) {
        // Search for games based on Name, Description, or Tags
        query = `
            SELECT * FROM g3a.Games 
            WHERE 
                active = 1 AND (
                    Name LIKE ? 
                    OR Description LIKE ? 
                    OR ID IN (
                        SELECT GameID FROM g3a.GameTags 
                        WHERE TagID IN (
                            SELECT ID FROM g3a.Tags WHERE Name LIKE ?
                        )
                    )
                )
            ORDER BY ID
        `;
        const searchTerm = `%${req.query.search}%`;
        params = [searchTerm, searchTerm, searchTerm];
    
    } else {
        // Get all games
        query = "SELECT * FROM g3a.Games WHERE active = 1"

        // Session for admins
        if (session != undefined) {
            let userID = await verifySession(session);
            if (userID) {
                let user = await getUserID(userID);
                if (user && user.UserType == "admin") {
                    query = "SELECT * FROM g3a.Games"
                }
            }
        }
    }

    try {
        const result = await pool.query(query, params);
        res.json(result);
    } catch (err) {
        console.error("Database Query Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/game", async(req, res)=> {
    const {gameName, gameDesc, gameImg, Price } = req.body;
    const session = req.query.session;

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
    if(user.UserType != "admin"){
        res.statusCode = 401;
        res.send("Unauthorized")
        return;
    }

    {/* An admin needs to atleast enter a gamename */}
    if (gameName == undefined || Price === undefined) {
        res.statusCode = 400;
        res.send("The game needs a name");
        return;
    }

    const insertQuery = `
        INSERT INTO g3a.Games (Name, Description, ImageURL, Price)
        VALUES (?, ?, ?, ?)
    `;

    {/* Insert game and get game Id */}
    await pool.query(insertQuery, [gameName,gameDesc,gameImg,Price]);

    res.send("Game added sucesfully")
    return;
});

app.put("/game/:id", async(req, res)=> {
    const {gameName, gameDesc, gameImg, Price , active } = req.body;
    const gameId = req.params.id;
    const session = req.query.session;

    if (!gameName || !gameDesc || !gameImg || active == undefined || active == null || Price == null) {
        return res.status(500).send("Bad");
    }

    {/* Verify user session */}
    const userID = await verifySession(session)
    if (userID == null || userID == false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }

    const user = await getUserID(userID);
    if (!user) {
        return res.status(401).send("Unauthorized");
    }

    {/* Validate that a user is an admin */}
    if(user.UserType != "admin"){
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

    const updateQuery = `
        UPDATE g3a.Games
        SET Name = ?, Description = ?, ImageURL = ?, active = ?, Price = ?
        WHERE ID = ?
    `;
    (await pool.query(updateQuery, [gameName, gameDesc, gameImg, active, Price, gameId]))[0];

    return res.status(200).send("OK")
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

app.get("/gametags", async (req, res) => {
    const { id } = req.query;

    {/* Get game ID*/}
    const game = await getGameID(id)
    if (game == null) {
        res.statusCode = 401;
        res.send("No game found");
        return;
    }

    try{
        query=`
        SELECT g3a.Tags.Name FROM g3a.Tags 
        WHERE g3a.Tags.ID IN (
            SELECT g3a.GameTags.TagID FROM g3a.GameTags
            WHERE g3a.GameTags.GameID = ?
        )
        `;
        const result = await pool.query(query, [id]);
        return res.send(result);
    } catch (err) {
        console.log(err);
        return res.status(500).send("Error getting tag");
    }
})

// Add a tag to a game
app.post('/gametags', async (req, res) => {
    const { session, gameID, tagName } = req.body;

    const userID = await verifySession(session);
    if (!userID) {
        return res.status(401).send("Unauthorized");
    }

    const user = await getUserID(userID);
    if (!user || user.userType !== "admin") {
        return res.status(403).send("Only admins can add tags");
    }

    if (!gameID || !tagName) {
        return res.status(400).send("Game ID and Tag Name are required");
    }

    try {
        // Check if tag exists, otherwise create it
        let tagQuery = `SELECT ID FROM g3a.Tags WHERE Name = ?`;
        let tagResult = await pool.query(tagQuery, [tagName]);

        let tagID;
        if (tagResult.length === 0) {
            const insertTagQuery = `INSERT INTO g3a.Tags (Name) VALUES (?) RETURNING ID;`;
            tagID = (await pool.query(insertTagQuery, [tagName]))[0].ID;
        } else {
            tagID = tagResult[0].ID;
        }

        // Insert into GameTags
        const insertGameTagQuery = `INSERT INTO g3a.GameTags (GameID, TagID) VALUES (?, ?);`;
        await pool.query(insertGameTagQuery, [gameID, tagID]);

        return res.send({ success: true, message: "Tag added successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).send("Error adding tag");
    }
});

// Remove a tag from a game
app.delete('/gametags', async (req, res) => {
    const { session, gameID, tagName } = req.body;

    const userID = await verifySession(session);
    if (!userID) {
        return res.status(401).send("Unauthorized");
    }

    const user = await getUserID(userID);
    if (!user || user.userType !== "admin") {
        return res.status(403).send("Only admins can remove tags");
    }

    if (!gameID || !tagName) {
        return res.status(400).send("Game ID and Tag Name are required");
    }

    try {
        // Find the tag ID
        const tagQuery = `SELECT ID FROM g3a.Tags WHERE Name = ?`;
        const tagResult = await pool.query(tagQuery, [tagName]);

        if (tagResult.length === 0) {
            return res.status(404).send("Tag not found");
        }

        const tagID = tagResult[0].ID;

        // Delete from GameTags
        const deleteGameTagQuery = `DELETE FROM g3a.GameTags WHERE GameID = ? AND TagID = ?;`;
        await pool.query(deleteGameTagQuery, [gameID, tagID]);

        return res.send({ success: true, message: "Tag removed successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).send("Error removing tag");
    }
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
        return
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

app.get("/account/orders", async (req, res) => {
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
        return
    }

    try{
        query= `
            SELECT * FROM g3a.Order
            WHERE g3a.Order.UserID = ?
        `
        const result = await pool.query(query, [userID]);
        return res.send(result);
    }catch(err){
        console.log(err);
        return
    }
})

app.get("/orderkeys", async (req, res) => {
    const { session, orderID } = req.query;

    if (session == undefined || orderID == undefined ) {
        res.statusCode = 401;
        res.send("Can't define session");
        return;
    }

    const userID = await verifySession(session)
    if (userID == null || userID == false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return
    }

    try{
        let securityquery = `
            SELECT * FROM g3a.Order
            WHERE g3a.Order.ID = ? AND g3a.Order.UserID = ?
        `

        const sec = await pool.query(securityquery, [orderID, userID]);

        if (sec.length == 0) {
            return res.code(401).send("Unauthorized");
        }

        let query= `
            SELECT g3a.Keys.KeyString, g3a.Games.Name, g3a.Games.ImageURL, g3a.Games.ID as GameID
            FROM g3a.Keys   
            INNER JOIN g3a.Games ON g3a.Keys.GameID = g3a.Games.ID AND g3a.Keys.ID IN (
                SELECT g3a.OrderKeys.KeyID 
                FROM g3a.OrderKeys WHERE g3a.OrderKeys.OrderID = ?
            )
        `
        const result = await pool.query(query, [orderID]);
        return res.send(result);
    }catch(err){
        console.log(err);
        return
    }
})

app.post("/sale", async (req, res) => {
    const session = req.body.session;

    {/* Verify session */}
    if (session == undefined ) {
        res.statusCode = 401;
        res.send("Can't define session");
        return;
    }

    {/* Get userID */}
    const UserID = await verifySession(session)
    if (UserID == null || UserID == false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return
    }
    const securityquery = `
    SELECT * FROM g3a.Basket WHERE UserID = ?;
    `

    const sumquery = `
        SELECT SUM(g3a.Games.Price) AS Total 
        FROM g3a.Basket 
        INNER JOIN g3a.Keys ON g3a.Keys.ID = g3a.Basket.KeyID
        INNER JOIN g3a.Games ON g3a.Games.ID = g3a.Keys.GameID
        WHERE g3a.Basket.UserID = ?
    `

    const firstquery= `
    INSERT INTO g3a.Order (UserId, Sum)
    VALUES (?, ?)
    RETURNING g3a.Order.ID 
    `

    /*const secoundquery= `
    INSERT INTO g3a.OrderKeys (OrderID, KeyID, Price) 
    SELECT ?, g3a.Basket.KeyID, g3a.Basket.Price FROM g3a.Basket WHERE g3a.Basket.UserID = ?
    `*/

    const secoundquery= `
        INSERT INTO g3a.OrderKeys (OrderID, KeyID, Price) 
        SELECT ?, g3a.Basket.KeyID, g3a.Games.Price 
        FROM g3a.Basket 
        INNER JOIN g3a.Keys ON g3a.Keys.ID = g3a.Basket.KeyID
        INNER JOIN g3a.Games ON g3a.Games.ID = g3a.Keys.GameID
        WHERE g3a.Basket.UserID = ?
    `

    const thirdquery= `
    DELETE FROM g3a.Basket WHERE UserID = ?`

    try{
        const security = await pool.query(securityquery, [UserID])
        if(security.length === 0){
            return res.send("No game in basket!")
        }

        const sum = await pool.query(sumquery, [UserID]);

        const result = await pool.query(firstquery, [UserID, sum[0].Total]);
        console.log(result);
        const result2 = await pool.query(secoundquery, [result[0].ID, UserID]);
        const result3 = await pool.query(thirdquery, [UserID]);
        return res.send("This is ok!");
    }catch(err){
        console.log(err);
    }
})

app.post("/keys", async (req, res) => {
    const { GameID, KeyString} = req.body;
    const session = req.query.session;

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
        return;
    }

    if(user.UserType != "admin") {
        return res.status(401).send("Unauthorized");
    }
    const query = `
        INSERT INTO g3a.Keys (KeyString, GameID)
        VALUES (?, ?);
    `;
    try {
        const result = await pool.query(query, [KeyString, GameID]);
        return res.send("OK");
    } catch (err) {
        console.log(err);
    }
})

// Returns all keys for admin only
app.get("/keys", async (req, res) => {
    const { session } = req.query;

    if (session == undefined ) {
        res.statusCode = 401;
        res.send("Can't define session");
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
        return;
    }

    if (user.UserType !== "admin") {
        return res.status(401).send("Unauthorized");
    }

    try{
        query= `
            SELECT * FROM g3a.Keys ORDER BY g3a.Keys.GameID
        `
        const result = await pool.query(query);
        return res.send(result);
    } catch(err) {
        console.log(err);
        return res.status(500).send("Internal Server Error")
    }
})

app.get("/basket", async (req, res) => {
    const { session } = req.query;

    {/* Verify session */}
    if (session == undefined ) {
        res.statusCode = 401;
        res.send("Can't define session");
        return;
    }

    {/* Get userID */}
    const UserID = await verifySession(session)
    if (UserID == null || UserID == false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }
    try {
        query= `
        SELECT g3a.Keys.GameID FROM g3a.Keys
        WHERE g3a.Keys.ID IN (
            SELECT g3a.Basket.KeyID FROM g3a.Basket
            WHERE g3a.Basket.UserID = ?
            )
        `
        const result = await pool.query(query, [UserID]);
        return res.send(result.map((basket) => basket.GameID));
    }catch(err){
        console.log(err);
    }
})
app.post("/basket", async (req, res) => {
    const { session, GameID } = req.body;

    const userID = await verifySession(session)
    const KeyIDs = await getStock(GameID)

    if(KeyIDs.length === 0) {
        res.statusCode = 402;
        res.send("No KeyID left to buy");
        return;
    }
    if (userID == null || userID == false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }

    try{
        query = `
            INSERT INTO g3a.Basket (UserID, KeyID)
            VALUES (?, ?)
        `
        const result = await pool.query(query, [userID, KeyIDs[0].ID]);
        return res.send(result);
    }catch(err){
        console.log(err);
    }
})
app.delete("/basket", async (req, res) => {
    const { GameID } = req.body;
    const session = req.body.session;

    {/* Verify session */}
    if (session == undefined ) {
        res.statusCode = 401;
        res.send("Can't define session");
        return;
    }

    const UserID = await verifySession(session)
    if (UserID == null || UserID == false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }

    try {
        query = `
        DELETE FROM g3a.Basket
        WHERE UserID = ? AND KeyID IN (
            SELECT ID FROM g3a.Keys
            WHERE g3a.Keys.GameID = ?
            )
        `
        const result = await pool.query(query, [UserID, GameID]);
        return res.send(result);
    } catch (err) {
        console.log(err);
        res.send("Could not delete from basket")
    }
})
// Gets all orders and information
// admin only
app.get("/orders", async (req, res) => {
    const { session } = req.query;

    // Verify session
    if (session == undefined) {
        res.statusCode = 401;
        res.send("No session provided");
        return;
    }

    // Get userID
    const userID = await verifySession(session);
    if (userID == null || userID == false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }

    const user = await getUserID(userID);
    if (user == null) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }

    if (user.UserType !== "admin") {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }
    
    try{
        query= `
            SELECT * FROM g3a.Order
        `
        const result = await pool.query(query, [userID]);
        return res.send(result);
    }catch(err){
        console.log(err);
        return
    }
})

// Gets all users
// admin only
app.get("/users", async (req, res) => {
    const { session } = req.query;

    // Verify session
    if (session == undefined) {
        res.statusCode = 401;
        res.send("No session provided");
        return;
    }

    // Get userID
    const userID = await verifySession(session);
    if (userID == null || userID == false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }

    const user = await getUserID(userID);
    if (user == null) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }

    if (user.UserType !== "admin") {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }
    
    try{
        query= `
            SELECT ID, Name, UserType, SignupTimestamp FROM g3a.Users
        `
        const result = await pool.query(query, [userID]);
        return res.send(result);
    }catch(err){
        console.log(err);
        return
    }
})

app.get("/reviews", async (req, res) => {
    let query;
    if(req.query.GameID){
    query = `
            SELECT * FROM g3a.Reviews
            WHERE g3a.Reviews.GameId = ?
        `
    }
    try{
        result = await pool.query(query, [req.query.GameID]);
    }catch(err){
        console.log(err);
    }
    res.send(result);
})
app.post("/reviews", async (req, res) => {
    const { description, positive, session, GameID } = req.body;

    {/* Verify user session */}
    const UserID = await verifySession(session)
    if (UserID == null || UserID == false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }
    const user = await getUserID(UserID)
    if (user == null) {
        res.statusCode = 401;
        res.send("No user found");
        return;
    }
    try{
        {/* Verifies that a user can only leave one review per game */}
        verifycomment = `
        SELECT * FROM g3a.Reviews
        WHERE UserID = ? AND GameID = ?`

        const verifyresponse = await pool.query(verifycomment, [GameID, UserID]);
        console.log(verifyresponse)
        if (verifyresponse.length>0){
            console.log(verifyresponse);
            res.statusCode = 403;
            res.send("Action only allowed once");
            return;
        } else {
            {/* Verifies that a user has bought the item they're trying to review */}
            try {
                verifypurchase = `
                    SELECT g3a.Keys.GameID, g3a.Keys.KeyString
                    FROM g3a.Keys WHERE g3a.Keys.ID IN (
                        SELECT g3a.OrderKeys.KeyID FROM g3a.OrderKeys
                        WHERE g3a.OrderKeys.OrderID IN (
                            SELECT g3a.Order.ID FROM g3a.Order
                            WHERE g3a.Order.UserID = ? )) AND g3a.Keys.GameID = ?
                `

                const tryVerifypurchase = await pool.query(verifypurchase, [UserID, GameID]);

                if(tryVerifypurchase.length===0){
                    res.statusCode = 403;
                    res.send("Action not permitted without purchase");
                    return;
                }
            }catch(err){
                console.log(err);
            }
        }
    }catch(err){
        console.log(err);
    }

    const query = `
        INSERT INTO g3a.Reviews (UserID, GameID, Description, Positive)
        VALUES (?,?,?,?)
    `
    try{
        const result = await pool.query(query, [UserID, GameID, description, positive]);
        if(result){
            return res.send("ok")
        }
    } catch (err) {
        console.log(err);
    }

})

app.get("/comments", async (req, res) => {
    let query;
    if(req.query.ReviewID){
        query = `
            SELECT * FROM g3a.Comments
            WHERE g3a.Comments.ReviewID = ?
        `
    }
    try{
        result = await pool.query(query, [req.query.ReviewID]);
    }catch(err){
        console.log(err);
    }
    res.send(result);
})
app.post("/comments", async (req, res) => {
    const { description, session, reviewID} = req.body;

    {/* Verify session */}
    if (session == undefined) {
        res.statusCode = 401;
        res.send("No session provided");
        return;
    }

    {/* Verify that a user is an admin */}
    const userID = await verifySession(session);
    if (userID == null || userID == false) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }
    const user = await getUserID(userID);
    if (user == null) {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }
    if (user.UserType !== "admin") {
        res.statusCode = 401;
        res.send("Unauthorized");
        return;
    }
    const query = `
    INSERT INTO g3a.Comments (reviewID, userID, description)
    VALUES (?,?,?)
    `
    try{
        const result = await pool.query(query, [reviewID, userID, description]);
        if(result){
            return res.send("ok")
        }
    }catch(err){
        console.log(err);
    }
})
// For checking if user is admin
app.get("/admin", async (req, res) => {
    const { session } = req.query;

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
        return;
    }

    if (user.UserType == "admin") {
        return res.status(200).send("OK")
    } else {
        return res.status(401).send("Unauthorized")
    }
})

// Retrieves a user or null if no user is found
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

const getGameID = async (gameID) => {
    const query = `   
        SELECT * FROM g3a.Games 
        WHERE g3a.Games.ID = ?
    `;
    
    try {
        const result = await pool.query(query, [gameID]);
        if (result.length > 0) {
            // There is an game with id
            return result[0];
        }
    } catch (err) {
        // Ignore errors in the query and just return null user
    }
    
    return null;
};

// Get amount of keys in stock
app.get("/game/:id/stock", async (req, res) => {
    const GameID = req.params.id;

    const stock = await getStock(GameID);

    if (stock == null) {
        return res.status(500).send("Internal Server Error");
    }

    return res.status(200).send(stock.length.toString());
})

// Returns array of keyIDs which are availible for an game
const getStock = async (GameID) => {
    const query = `
        SELECT g3a.Keys.ID 
        FROM g3a.Keys
        WHERE 
            g3a.Keys.GameID = ?
            AND
            g3a.Keys.ID NOT IN (
                (SELECT g3a.OrderKeys.KeyID FROM g3a.OrderKeys)
                UNION
                (SELECT g3a.Basket.KeyID FROM g3a.Basket)
            )    
    `

    try {
        const result = await pool.query(query, [GameID]);
        return result;
    } catch(err) {
        console.log(err)
        return null;
    }
}