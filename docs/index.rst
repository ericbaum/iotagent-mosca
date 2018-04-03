=============
iotagent-mosca
=============

|License badge| |Docker badge| |Travis badge|

IoT agents are responsible for receiving messages from physical devices
(directly or through a gateway) and sending them commands in order to configure
them. This iotagent-mosca, in particular, receives messages via MQTT with JSON
payloads.

.. toctree::
   :maxdepth: 2
   :caption: Contents:
   :glob:

   concepts
   operation
   building-documentation


How does it work
================

iotagent-mosca depends on a Kafka broker, so that it can receive messages
informing it about new devices (and, in extension, about their updates and
removals). It listens to device management topics on Kafka and for MQTT
messages using its internal broker implemented by Mosca library. For more
information about the internals of this mechanism, check `iotagent-nodejs`_
documentation.


How to build
============

As this is a npm-based project, building it is as simple as

.. code-block:: bash

    npm install


And that's all.

How to run
==========

As simple as:

.. code-block:: bash

    node index.js


Remember that you should already have a Kafka node (with a zookeeper instance).

How do I know if it is working properly?
----------------------------------------

Simply put: you won't. In fact you can implement a simple Kafka publisher to
emulate the behaviour of a device manager instance and a listener to check what
messages it is generating. But it seems easier to get the real components -
they are not that hard to start and to use (given that you use dojot's
`docker-compose`_). Check also `DeviceManager documentation`_ for further
information about how to create a new device.


.. |License badge| image:: https://img.shields.io/badge/license-GPL-blue.svg
   :target: https://opensource.org/licenses/GPL-3.0
.. |Docker badge| image:: https://img.shields.io/docker/pulls/dojot/iotagent-mosca.svg
   :target: https://hub.docker.com/r/dojot/iotagent-mosca/
.. |Travis badge| image:: https://travis-ci.org/dojot/iotagent-mosca.svg?branch=cpqd_master
   :target: https://travis-ci.org/dojot/iotagent-mosca#


.. _docker-compose: https://github.com/dojot/docker-compose
.. _iotagent-nodejs: https://github.com/dojot/iotagent-nodejs
.. _DeviceManager documentation: http://dojotdocs.readthedocs.io/projects/DeviceManager/en/latest/
