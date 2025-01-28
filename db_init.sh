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
        PRIMARY KEY (ID) \
    );\
"
echo "games table created"


mariadb --socket=/var/lib/maria/maria.sock -e "ALTER TABLE g3a.Games AUTO_INCREMENT=1000;"
echo "auto increment set"

# Lägg in default data
mariadb --socket=/var/lib/maria/maria.sock -e "\
    INSERT INTO g3a.Games SET Name=\"Gruvkraft - Kiruna Edition\"\
"
echo "data inserted"


echo "Done initializing database"
