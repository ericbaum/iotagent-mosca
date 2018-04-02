var mosca = require('mosca');
var iotalib = require('dojot-iotagent');
var config = require('./config');

var iota = new iotalib.IoTAgent();
iota.init();

var mosca_backend = {
  type: 'redis',
  redis: require('redis'),
  db: 12,
  port: config.backend_port,
  return_buffers: true, // to handle binary payloads
  host: config.backend_host
};

var moscaSettings = {
  port: 1883,
  backend: mosca_backend,
  persistence: {
    factory: mosca.persistence.Redis,
    host: mosca_backend.host
  }
};

var server = new mosca.Server(moscaSettings);
server.on('ready', setup);

server.on('clientConnected', function(client) {
  // console.log('client up', client.id, client.user, client.passwd);
  // TODO notify dojot that device is online
  // what about pings?
});

server.on('clientDisconnected', function(client) {
  // console.log('client down', client.id, client.user, client.passwd);
  // TODO notify dojot that device is offline
  // what about pings?
});

function parseClient(packet, client) {
  function fromString(clientid) {
    if (clientid && (typeof clientid == 'string')){
      let data = clientid.match(/^(.*):(.*)$/);
      if (data) {
        return { tenant: data[1], device: data[2] };
      }
    }
  }

  function validate(idInfo) {
    return new Promise((resolve, reject) => {
      iota.getDevice(idInfo.device, idInfo.tenant).then((device) => {
        resolve([idInfo, device]);
      }).catch((error) => {
        reject(new Error("Unknown device"));
      })
    });
  }

  let result;
  if (client.user !== undefined) {
    console.log('will attempt to use client.user as id source');
    result = fromString(client.user);
    if (result){
      return validate(result);
    }
  }

  if (client.id !== undefined) {
    console.log('will attempt to use client.id as id source');
    result = fromString(client.id);
    if (result){
      return validate(result);
    }
  }

  // If we're here, it means that neither clientid nor username has been
  // properly set, so fallback to topic-based id scheme
  result = packet.topic.match(/^\/([^/]+)\/([^/]+)/)
  if (result){
    console.log('will attempt to use topic as id source');
    return validate({tenant: result[1], device: result[2]});
  }

  return new Promise((resolve, reject) => {
    reject(new Error("Unknown device - event missing id info"));
  })
}

// fired when a message is received
server.on('published', function(packet, client) {

  // ignore meta (internal) topics
  if ((packet.topic.split('/')[0] == '$SYS') || (client === undefined) || (client === null)) {
    console.log('ignoring internal message', packet.topic, client);
    return;
  }

  parseClient(packet, client).then((info) => {
    let data = packet.payload.toString();
    try {
      const device = info[1];
      const idInfo = info[0];

      for (let template in device.attrs) {
        for (let attr of device.attrs[template]) {
          if (attr.label == "topic") {
            if (packet.topic !== attr.static_value) {
              console.log(`Received message on invalid topic "${packet.topic}" for device. Ignoring`);
              return;
            }
          }
        }
      }

      data = JSON.parse(data);
      console.log('Published', packet.topic, data, client.id, client.user, client.passwd ? client.passwd.toString() : 'undefined');
      iota.updateAttrs(idInfo.device, idInfo.tenant, data, {});
    } catch (e) {
      console.log('Payload is not valid json. Ignoring.', packet.payload.toString(), e);
    }
  }).catch((error) => {
    console.error("Failed to identify device which originated the event. Ignoring. (clientid: %s, username: %s, topic: %s)", client.id, client.user, packet.topic);
  })
});

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running');

  server.authenticate = (client, username, password, callback) => {
    console.log('will handle authentication request', username, password, client.id);
    // TODO: check if given credentials are valid against cache
    client.user = username;
    client.passwd = password;
    callback(null, true);
  }
}

iota.on('device.configure', (event) => {
  console.log('got configure event')
  let device_id = event.data.id;
  delete event.data.id;
  iota.getDevice(device_id, event.meta.service).then((device) => {
    let topic = `/${event.meta.service}/${device_id}/config`;
    for (template in device.attrs){
      for (attr of device.attrs[template]){
        if ((attr.label == 'topic-config') && (attr.type == 'meta')) {
          topic = attr.static_value;
        }
      }
    }

    let message = {
      'topic': topic,
      'payload': JSON.stringify(event.data),
      'qos': 0,
      'retain': false
    }

    console.log('will publish', message)
    server.publish(message, function() {console.log('message out')});
  })
})