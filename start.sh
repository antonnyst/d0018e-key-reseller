#!/bin/ash
# From https://community.hetzner.com/tutorials/dockerizing-mariadb-with-alpine-linux

set -e

USER=root
DIR_DATA=/var/lib/maria

signal_terminate_trap() {
    #
    # Shutdown MariaDB with mariadb-admin
    # https://mariadb.com/kb/en/mariadb-admin/
    mariadb-admin --user=$USER shutdown &
    #
    # Wait for mariadb-admin until sucessfully done (exit)
    wait $!
    echo "MariaDB shut down successfully"
}

trap "signal_terminate_trap" SIGTERM

if [ ! -f "$DIR_DATA/ibdata1" ]; then
    initialize_status="MariaDB initialization done"

    # Initialize MariaDB with mariadb-install-db
    # https://mariadb.com/kb/en/mariadb-install-db/
    mariadb-install-db \
        --user=$USER \
        --datadir=$DIR_DATA \
        --auth-root-authentication-method=socket &
    #
    # Wait for mariadb-install-db until sucessfully done (exit)
    wait $!
fi

echo $initialize_status

# Run
echo "Starting MariaDB ..."
#
# Run MariaDB with exec bash command
exec mariadbd --user=$USER --datadir=$DIR_DATA --socket=/var/lib/maria/maria.sock &

exec /db_init.sh &

exec node /api/app.js &

exec node /web/app.js &

#
# Wait for processes to stop
wait
exit 1

