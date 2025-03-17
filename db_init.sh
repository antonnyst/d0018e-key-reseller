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
        Price DOUBLE NOT NULL, \
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
    CREATE TABLE g3a.Reviews ( \
        ID INT NOT NULL AUTO_INCREMENT, \
        Description TEXT NOT NULL, \
        Positive BOOLEAN NOT NULL, \
        GameID INT NOT NULL, \
        UserID INT NOT NULL, \
        PRIMARY KEY (ID), \
        FOREIGN KEY (GameID) REFERENCES g3a.Games(ID) ON DELETE CASCADE, \
        FOREIGN KEY (UserID) REFERENCES g3a.Users(ID) ON DELETE CASCADE \
    );\
"
echo "Reviews table created"
mariadb --socket=/var/lib/maria/maria.sock -e "ALTER TABLE g3a.Reviews AUTO_INCREMENT=1;"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    CREATE TABLE g3a.Comments ( \
        ID INT NOT NULL AUTO_INCREMENT, \
        ReviewID INT NOT NULL, \
        UserID INT NOT NULL, \
        Description TEXT NOT NULL, \
        PRIMARY KEY (ID), \
        FOREIGN KEY (UserID) REFERENCES g3a.Users(ID) ON DELETE CASCADE, \
        FOREIGN KEY (ReviewID) REFERENCES g3a.Reviews(ID) ON DELETE CASCADE \
    );\
"
echo "comments table created"
mariadb --socket=/var/lib/maria/maria.sock -e "ALTER TABLE g3a.Comments AUTO_INCREMENT=1;"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    CREATE TABLE g3a.Tags ( \
        ID INT NOT NULL AUTO_INCREMENT, \
        Name VARCHAR(50) NOT NULL UNIQUE, \
        PRIMARY KEY (ID) \
    );\
"
echo "tags table created"
mariadb --socket=/var/lib/maria/maria.sock -e "ALTER TABLE g3a.Tags AUTO_INCREMENT=50000;"

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
    CREATE TABLE g3a.Keys ( \
        ID INT NOT NULL AUTO_INCREMENT, \
        KeyString VARCHAR(50) NOT NULL UNIQUE, \
        GameID INT NOT NULL, \
        PRIMARY KEY (ID), \
        FOREIGN KEY (GameID) REFERENCES g3a.Games(ID) ON DELETE CASCADE \
    );\
"
echo "key table created"
mariadb --socket=/var/lib/maria/maria.sock -e "ALTER TABLE g3a.Keys AUTO_INCREMENT=30000;"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    CREATE TABLE g3a.Order ( \
        ID INT NOT NULL AUTO_INCREMENT, \
        Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
        Sum VARCHAR(50) NOT NULL, \
        UserID INT NOT NULL, \
        PRIMARY KEY (ID, UserID), \
        FOREIGN KEY (UserID) REFERENCES g3a.Users(ID) ON DELETE CASCADE \
    );\
"
echo "transactions table created"
mariadb --socket=/var/lib/maria/maria.sock -e "ALTER TABLE g3a.Order AUTO_INCREMENT=1000;"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    CREATE TABLE g3a.OrderKeys ( \
        OrderID INT NOT NULL, \
        KeyID INT NOT NULL, \
        Price DOUBLE NOT NULL, \
        PRIMARY KEY (OrderID, KeyID), \
        FOREIGN KEY (OrderID) REFERENCES g3a.Order(ID) ON DELETE CASCADE, \
        FOREIGN KEY (KeyID) REFERENCES g3a.Keys(ID) ON DELETE CASCADE\
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
    INSERT INTO g3a.Games (Name, Price, Description, ImageURL) VALUES \
    (\"Gruvkraft - Kiruna Edition\", 10,\"A mining simulation game set in Kiruna\", \"GRUVKRAFT.jpg\"), \
    (\"EEE\", 10,\"Do NOT stack the blocks...\", \"eee.png\"), \
    (\"EEE2\", 10,\"Do NOT NOT stack the blocks...\", \"eee.png\"), \
    (\"EEE3\", 10,\"Do NOT NOT NOT stack the blocks...\", \"eee.png\"), \
    (\"EEE4\", 10,\"Do NOT NOT NOT NOT stack the blocks...\", \"eee.png\"),  \
    (\"EEE5\", 10,\"...stack the blocks...\", \"eee.png\"),  \
    (\"EEE6\", 10,\"...the blocks...\", \"eee.png\"),  \
    (\"EEE7\", 10,\"...blocks...\", \"eee.png\"),  \
    (\"Elden Loop: Timeless Trials in the Realm of Echoes\", 10, \"Step into the captivating world of Elden Loop, a realm where time flows uniquely, offering endless opportunities for strategic play. The setting features a diverse array of biomes and environments, each with its own time-based nuances, creating a dynamic exploration experience.\", \"eldenloop.png\")  \
"
echo "games data inserted"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    INSERT INTO g3a.Users (Name, PasswordHash, UserType) VALUES \
    (\"root\", \"\$2b\$10\$dn7MXvxWxdZOe1\/RSfYZSeEAoqetH\/sWC41LKizH7fRRFM\/3wBEfK\", \"admin\") \
"
#echo "users data inserted"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    INSERT INTO g3a.Keys (KeyString, GameID ) VALUES \
    (\"asjfnajsf\",  \"1000\"), \
    (\"idididid\",  \"1000\"), \
    (\"209420jfj202\",  \"1008\"), \
    (\"EEEEEEEEEEEEEEE\",  \"1004\") 
"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    INSERT INTO g3a.Tags (Name) VALUES \
    (\"Action\"), \
    (\"Online Co-Op\"), \
    (\"Puzzle\") 
"
echo "tags data inserted"

mariadb --socket=/var/lib/maria/maria.sock -e "\
  INSERT INTO g3a.Reviews (ID, GameID, UserID, Positive, Description) VALUES \
  (\"1\", \"1000\", \"1000\", \"1\", \"I LIKE GAME\"), \
  (\"2\", \"1000\", \"1000\", \"0\", \"I THINK GAME NOT GOOD LIKE MINECRAFT MOVIE\")
"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    INSERT INTO g3a.GameTags (GameID, TagID) VALUES \
    (1008, 50000), \
    (1000, 50001), \
    (1001, 50002), \
    (1002, 50002), \
    (1008, 50001) 
"
echo "gametags data inserted"

mariadb --socket=/var/lib/maria/maria.sock -e "\
    INSERT INTO g3a.Favorites (GameID, UserID) VALUES \
    (1000, 1000)"


echo "Done initializing database"
