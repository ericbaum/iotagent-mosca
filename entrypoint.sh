#!/bin/sh

if [ "${MOSCA_TLS}" = "true" ]; then
    echo "Generating keys and certificates for TLS..."
    echo "1"
    /opt/initialConf.py
    echo "... all security confgurations were performed."

    if ! /opt/initialConf.py
    then
        echo "Error ocurred on initial mosca TLS setup"
        return 1
    fi
else 
    echo "No TLS is configured. All connections are not secured."
fi

echo "Starting iotagent-mosca..."
node /opt/index.js
