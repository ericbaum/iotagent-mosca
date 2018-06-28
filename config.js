'use strict';

var config = {};

config.backend_host = process.env.BACKEND_HOST || 'mosca-redis'
config.backend_port = process.env.BACKEND_PORT || 6379
config.mosca_tls = process.env.MOSCA_TLS || 'true' //Enable mosca TLS

module.exports = config;
