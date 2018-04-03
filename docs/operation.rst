=========
Operation
=========


Configuration
=============

iotagent-mosca configuration is pretty simple. These are the environment
variables used by it:

- BACKEND_HOST, BACKEND_PORT: redis host and port to be used.


Receiving messages from DeviceManager via Kafka
===============================================

Messages containing device operations should be in this format:

.. code-block:: json

    {
      "event": "create",
      "meta": {
        "service": "admin"
      },
      "data": {
        "id": "cafe",
        "attrs" : {

        }
      }
    }

These messages are related to device creation, update, removal and actuation.
For creation and update operations, it contains the device data model
to be added or updated. For removal operation, it will contain only the device
ID being removed. The actuation operation will contain all attributes previously
created with their respective values.

The documentation related to this message can be found in `DeviceManager
Messages`_.


Device configuration for iotagent-mosca
---------------------------------------

The following device attributes are considered by iotagent-mosca. All these
attributes are of ``meta`` type.

.. list-table:: Device attributes for iotagent-mosca
    :header-rows: 1

    * - Attribute
      - Description
      - Example
    * - topic
      - Topic to which the device will publish messages.
      - ``/admin/efac/attrs``


Example
*******

The following message serves as an example of a device with all attributes used
by iotagent-mosca.

.. code-block:: json

    {
      "label": "Thermometer Template",
      "attrs": [
        {
          "label": "topic",
          "type": "meta",
          "value_type": "string",
          "static_value": "/agent/main/000BABC80F4A/devinfo"
        },
        {
          "label": "temperature",
          "type": "dynamic",
          "value_type": "float"
        },
        {
          "label": "reset",
          "type": "actuator",
          "value_type": "boolean"
        }
      ]
    }


Sending messages to other components via Kafka
===============================================

When iotagent-mosca receives a new message from a particular device, it must
publish the new data to other components. The default subject used to publish
this information is "device-data". Check `data-broker`_ documentation to check
how these subjects are translated into Kafka topics.

The message sent by iotagent-mosca is like this one:

.. code-block:: json

    {
      "metadata": {
        "deviceid": "efac",
        "protocol": "mqtt",
        "payload": "json"
      },
      "attrs": {
      }
    }

As previously stated, the "attrs" attribute is the same as the one from
`DeviceManager Messages`_.

Receiving messages from devices via MQTT
========================================

Any message payload sent to iotagent-mosca must be in JSON format. Preferably,
they should follow a simple key-value structure, such as:

.. code-block:: json

    {
      "speed": 100.0,
      "weight": 50.2,
      "id": "truck-001"
    }


If more than one device is supposed to use the same topic, you should set the
client ID in all messages sent by devices. Its value should be ``service:ID``,
such as ``admin:efac``.

Should the device send its messages using any other JSON scheme, the user could
translate them into simple key-value structures using flows, using flowbuilder
for that.


Example
-------

This example uses ``mosquitto_pub`` tool, available with ``mosquitto_clients``
package. To send a message to iotagent-mosca via MQTT, just execute this
command:

.. code-block:: bash

    mosquitto_pub -h localhost -i "admin:efac" -t /device/data -m '{"temperature" : 10}'

This command will send the message containing one value for attribute
``speed``. The device ID is ``efac`` and its service is "admin". ``-t`` flag
sets the topic to which this message will be published and ``-i`` sets the
client ID to be sent.

This command assumes that you are running iotagent-mosca in your machine (it
also works if you use dojot's `docker-compose`_).


.. _DeviceManager Concepts: http://dojotdocs.readthedocs.io/projects/DeviceManager/en/latest/concepts.html
.. _DeviceManager Messages: http://dojotdocs.readthedocs.io/projects/DeviceManager/en/latest/kafka-messages.html
.. _dojot documentation: http://dojotdocs.readthedocs.io/en/latest/
.. _JSON patch: http://jsonpatch.com/
.. _JSON pointer: http://jsonpatch.com/#json-pointer
.. _docker-compose: https://github.com/dojot/docker-compose
.. _data-broker: https://github.com/dojot/data-broker
