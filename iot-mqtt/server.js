'use strict'

// Config
const { configDb, configRedis } = require('../config')

// Redis
const persistence = require('aedes-persistence-redis')(configRedis)
const mq = require('mqemitter-redis')(configRedis)

// Mqtt
const mqtt = require('aedes')({ persistence, mq, concurrency: 0 })

// Debug
const debug = require('debug')('iot-node:mqtt')
const chalk = require('chalk')

// Server Net & Mqtt Handler & Socket
const server = require('net').createServer(mqtt.handle)
const http = require('http').createServer()
const ws = require('websocket-stream')

// const { pid } = require("process");
const mqPort = 1883
const wsPort = 8888
const dbPort = 5432

// Parse Payload
const { parsePayload } = require('./utils')

// Db
const db = require('iot-db')
const clients = new Map()
let Agent, Metric

// Init Server & Services Mqtt
server.listen(mqPort, async () => {
  msgSuccess('SERVER', 'listening on: ', mqPort)
  msgSuccess(' MQTT ', 'listening on: ', mqPort)

  // Init Mqtt Services, Agent & Metric
  const services = await db(configDb).catch(handleFatalError)
  Agent = services.Agent
  Metric = services.Metric
  msgSuccess('  DB  ', 'listening on: ', dbPort)
})

// Init Socket
ws.createServer({ server: http }, mqtt.handle)
http.listen(wsPort, () => {
  msgSuccess('  WS  ', 'listening on: ', wsPort)
})

// Client Connected
mqtt.on('client', (client) => {
  clients.set(client.id, null)
  msgSuccess('CLIENT', 'connected:    ', client.id)
})

// Client Disconnect
mqtt.on('clientDisconnect', async (client) => {
  const agent = clients.get(client.id)

  if (agent) {
    // Mark Agent as disconnected
    agent.connected = false
    try {
      await Agent.createOrUpdate(agent)
    } catch (e) {
      return handleFatalError(e)
    }

    // Delete Agent from Clients List
    clients.delete(client.id)

    // Notify
    mqtt.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    })
    msgFail(
      'CLIENT',
      'disconneted:  ',
      `${client.id} associated to Agent ${agent.uuid} marked as disconeted`
    )
  }
})

// Subscribe
mqtt.on('subscribe', (subscriptions, client) => {
  if (client) {
    const subs = subscriptions.map((s) => s.topic)
    msgSuccess('CLIENT', 'subscribed:   ', `${client.id}' to topic ${subs}`)
  }
})

// Unsubscribe
mqtt.on('unsubscribe', function (subscriptions, client) {
  if (client) {
    const subs = subscriptions.map((s) => s.topic)
    msgFail('CLIENT', 'unsubscribed: ', `${client.id}' to topic ${subs}`)
  }
})

// Publish
mqtt.on('publish', async (packet, client) => {
  if (client) {
    switch (packet.topic) {
      case 'agent/connected':
      case 'agent/disconnected':
        break
      case 'agent/message':
        const payload = parsePayload(packet.payload)
        if (payload) {
          payload.agent.connected = true
          let agent
          try {
            agent = await Agent.createOrUpdate(payload.agent)
          } catch (e) {
            return handleError(e)
          }
          msgSuccess('AGENT ', 'save on DB:   ', agent.uuid)

          // Notify Agent is Conneted
          if (!clients.get(agent.id)) {
            clients.set(client.id, agent)
            mqtt.publish({
              topic: 'agent/connected',
              payload: JSON.stringify({
                agent: {
                  uuid: agent.uuid,
                  name: agent.name,
                  hostname: agent.hostname,
                  pid: agent.pid,
                  connected: agent.connected
                }
              })
            })
          }

          // Store Metrics
          for (const metric of payload.agent.metrics) {
            let m
            try {
              m = await Metric.create(agent.uuid, metric)
            } catch (e) {
              return handleError(e)
            }
            msgSuccess('METRIC', 'save on Agent:', agent.uuid)
          }
        }
        break
    }

    msgPublish(client, packet)
  }
})

// Errors
mqtt.on('clientError', (client, err) => {
  handleClientError(client, 'CLIENT ERROR', err)
})

mqtt.on('connectionError', (client, err) => {
  handleClientError(client, 'CONNECTION ERROR', err)
})

mqtt.on('error ', handleFatalError)
process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

// Handlers
function handleError (err) {
  debug(
    chalk.redBright('[ ERROR ]'),
    chalk.red(err.message + '\n'),
    chalk.red(err.stack)
  )
}

function handleFatalError (err) {
  debug(
    chalk.redBright('[ FATAL ERROR ]'),
    chalk.red(err.message + '\n'),
    chalk.red(err.stack)
  )
  process.exit(1)
}

function handleClientError (client, title, err) {
  debug(
    chalk.redBright(title),
    chalk.redBright(client.id),
    chalk.red(err.message + '\n'),
    chalk.red(err.stack)
  )
}

// Messages
function msgSuccess (header, body, data) {
  debug(
    chalk.greenBright('[', header, ']'),
    chalk.green(body),
    chalk.yellow(data)
  )
}

function msgFail (header, body, data) {
  debug(chalk.redBright('[', header, ']'), chalk.red(body), chalk.yellow(data))
}

function msgPublish (client, packet) {
  debug(chalk.blueBright('-----------PUBLISH----------'))
  debug(chalk.blueBright('Client: '), chalk.blue(client.id))
  debug(chalk.blueBright('Topic:  '), chalk.blue(packet.topic))
  debug(chalk.blueBright('Payload:'), chalk.blue(packet.payload))
  debug(chalk.blueBright('----------------------------'))
}
