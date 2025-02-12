#!/bin/ash

sleep 5

echo "Initializing database"

# Skapa databasstrukturen
mariadb --socket=/var/lib/maria/maria.sock -e "CREATE DATABASE g3a"

echo "database created"

# Skapa tables
mariadb --socket=/var/lib/maria/maria.sock -e "\
    CREATE TABLE g3a.Games ( \
        ID INT NOT NULL AUTO_INCREMENT, \
        Name VARCHAR(255) NOT NULL, \
        Description TEXT, \
        ImageURL VARCHAR(255), \
        active BOOLEAN NOT NULL DEFAULT TRUE, \
        PRIMARY KEY (ID) \
    );\
"
echo "games table created"

mariadb --socket=/var/lib/maria/maria.sock -e "ALTER TABLE g3a.Games AUTO_INCREMENT=1000;"
echo "auto increment set"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    CREATE TABLE g3a.Users ( \
        ID INT NOT NULL AUTO_INCREMENT, \
        Name VARCHAR(50) NOT NULL UNIQUE, \
        UserType ENUM('user', 'admin') NOT NULL DEFAULT 'user', \
        PasswordHash VARCHAR(255) NOT NULL, \
        SignupTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
        active BOOLEAN NOT NULL DEFAULT TRUE,\
        PRIMARY KEY (ID) \
    );\
"
echo "users table created"

mariadb --socket=/var/lib/maria/maria.sock -e "ALTER TABLE g3a.Users AUTO_INCREMENT=1000;"
echo "auto increment set"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    CREATE TABLE g3a.Tags ( \
        ID INT NOT NULL AUTO_INCREMENT, \
        Name VARCHAR(50) NOT NULL UNIQUE, \
        PRIMARY KEY (ID) \
    );\
"
echo "tags table created"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    CREATE TABLE g3a.GameTags ( \
        GameID INT NOT NULL, \
        TagID INT NOT NULL, \
        PRIMARY KEY (GameID, TagID), \
        FOREIGN KEY (GameID) REFERENCES g3a.Games(ID) ON DELETE CASCADE, \
        FOREIGN KEY (TagID) REFERENCES g3a.Tags(ID) ON DELETE CASCADE \
    );\
"
echo "game tags table created"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    CREATE TABLE g3a.Prices ( \
        ID INT NOT NULL AUTO_INCREMENT, \
        Price VARCHAR(50) NOT NULL, \
        GameID INT NOT NULL, \
        active BOOLEAN NOT NULL DEFAULT TRUE, \
        PRIMARY KEY (ID), \
        FOREIGN KEY (GameID) REFERENCES g3a.Games(ID) ON DELETE CASCADE \
    );\
"
echo "prices table created"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    CREATE TABLE g3a.Keys ( \
        ID INT NOT NULL AUTO_INCREMENT, \
        KeyString VARCHAR(50) NOT NULL UNIQUE, \
        GameID INT NOT NULL, \
        PRIMARY KEY (ID), \
        FOREIGN KEY (GameID) REFERENCES g3a.Games(ID) ON DELETE CASCADE \
    );\
"
echo "key table created"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    CREATE TABLE g3a.Transactions ( \
        ID INT NOT NULL AUTO_INCREMENT, \
        Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
        Sum VARCHAR(50) NOT NULL, \
        UserID INT NOT NULL, \
        PRIMARY KEY (ID, UserID), \
        FOREIGN KEY (UserID) REFERENCES g3a.Users(ID) ON DELETE CASCADE \
    );\
"
echo "transactions table created"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    CREATE TABLE g3a.TransactionKeys ( \
        TransactionID INT NOT NULL, \
        KeyID INT NOT NULL, \
        PriceID INT NOT NULL, \
        PRIMARY KEY (TransactionID, KeyID, PriceID), \
        FOREIGN KEY (TransactionID) REFERENCES g3a.Transactions(ID) ON DELETE CASCADE, \
        FOREIGN KEY (KeyID) REFERENCES g3a.Keys(ID) ON DELETE CASCADE, \
        FOREIGN KEY (PriceID) REFERENCES g3a.Prices(ID) ON DELETE CASCADE \
    );\
"
echo "transaction key table created"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    CREATE TABLE g3a.Basket ( \
        Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
        KeyID INT NOT NULL, \
        UserID INT NOT NULL, \
        PRIMARY KEY (KeyID, UserID), \
        FOREIGN KEY (KeyID) REFERENCES g3a.Keys(ID) ON DELETE CASCADE, \
        FOREIGN KEY (UserID) REFERENCES g3a.Users(ID) ON DELETE CASCADE \
    );\
"
echo "basket table created"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    CREATE TABLE g3a.Favorites ( \
        GameID INT NOT NULL, \
        UserID INT NOT NULL, \
        PRIMARY KEY (GameID, UserID), \
        FOREIGN KEY (GameID) REFERENCES g3a.Games(ID) ON DELETE CASCADE, \
        FOREIGN KEY (UserID) REFERENCES g3a.Users(ID) ON DELETE CASCADE \
    );\
"
echo "favorites table created"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    CREATE TABLE g3a.Sessions ( \
        ID INT NOT NULL AUTO_INCREMENT, \
        UserID INT NOT NULL, \
        Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
        SessionCookie VARCHAR(255) UNIQUE NOT NULL, \
        PRIMARY KEY (ID), \
        FOREIGN KEY (UserID) REFERENCES g3a.Users(ID) ON DELETE CASCADE \
    );\
"
echo "sessions table created"

# Lägg in default data
mariadb --socket=/var/lib/maria/maria.sock -e "\
    INSERT INTO g3a.Games (Name, Description, ImageURL) VALUES \
    (\"Gruvkraft - Kiruna Edition\", \"A mining simulation game set in Kiruna\", \"GRUVKRAFT.jpg\"), \
    (\"EEE\", \"Do NOT stack the blocks...\", \"eee.png\"), \
    (\"EEE2\", \"Do NOT NOT stack the blocks...\", \"eee.png\"), \
    (\"EEE3\", \"Do NOT NOT NOT stack the blocks...\", \"eee.png\"), \
    (\"EEE4\", \"Do NOT NOT NOT NOT stack the blocks...\", \"eee.png\"),  \
    (\"EEE5\", \"...stack the blocks...\", \"eee.png\"),  \
    (\"EEE6\", \"...the blocks...\", \"eee.png\"),  \
    (\"EEE7\", \"...blocks...\", \"eee.png\")  \
"
echo "games data inserted"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    INSERT INTO g3a.Users (Name, PasswordHash) VALUES \
    (\"player1\", \"hashed_password_1\") \
"
#echo "users data inserted"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    INSERT INTO g3a.Tags (Name) VALUES \
    (\"Action\"), \
    (\"Online Co-Op\") \
"
echo "tags data inserted"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    INSERT INTO g3a.Keys (KeyString) VALUES \
    (\"12345YU7b4\") \
"
echo "key data inserted"


echo "Done initializing database"
