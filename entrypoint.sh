#!/bin/sh
/opt/initialConf.py

if ! /opt/initialConf.py
then
    echo "Error ocurred on initial mosca TLS setup"
    return 1
fi

node /opt/index.js