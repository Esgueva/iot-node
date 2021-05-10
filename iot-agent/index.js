'use strict'

const EventEmitter = require('events')
const mqtt = require('mqtt')
const uuid = require('uuid')
const util = require('util')
const defaults = require('defaults')
const { parsePayload } = require('./utils')

const debug = require('debug')('iot-node:agent')
const os = require('os')

const options = {
  name: 'untitled',
  username: 'iot-client',
  interval: 5000,
  mqtt: {
    host: 'mqtt://localhost'
  }
}

class IotAgent extends EventEmitter {
  constructor (opts) {
    super()

    this._options = defaults(opts, options)
    this._started = false
    this._timer = null
    this._client = null
    this._agentId = null
    this._metrics = new Map()
  }

  addMetric (type, fn) {
    this._metrics.set(type, fn)
  }

  removeMetric (type) {
    this._metrics.delete(type)
  }

  connect () {
    if (!this._started) {
      // Options
      const opt = this._options

      // Client Mqtt
      this._client = mqtt.connect(opt.mqtt.host)

      // Connected
      this._started = true

      // Subscibes
      this._client.subscribe('agent/message')
      this._client.subscribe('agent/connected')
      this._client.subscribe('agent/disconnected')

      // Connect Event
      this._client.on('connect', () => {
        // Emit
        this._agentId = uuid.v4()
        // Local Emit Not Mqtt
        this.emit('connected ')
        // Timer
        this._timer = setInterval(async () => {
          if (this._metrics.size > 0) {
            // Message
            const message = {
              agent: {
                uuid: this._agentId,
                username: opt.username,
                name: opt.name,
                hostname: os.hostname() || 'localhost',
                pid: process.pid,
                metrics: []
              },

              timestamp: new Date().getTime()
            }
            // Metrics
            for (let [metric, fn] of this._metrics) {
              // Callback to Promise
              if (fn.length === 1) {
                fn = util.promisify(fn)
              }
              // Add Metrics
              message.agent.metrics.push({
                type: metric,
                value: await Promise.resolve(fn())
              })
            }
            // Mqtt
            this._client.publish('agent/message', JSON.stringify(message))
            // Internal Event
            this.emit('message', message)
            // Debug
            debug('Sending ', message)
          }
        }, opt.interval)
      })

      // Message Event
      this._client.on('message', (topic, payload) => {
        payload = parsePayload(payload)

        // Broadcast
        let broadcast = false
        switch (topic) {
          case 'agent/connected':
          case 'agent/disconnected':
          case 'agent/message':
            broadcast =
              payload && payload.agent && payload.agent.uuid !== this._agentId
            break
        }

        // Emit
        if (broadcast) {
          this.emit(topic, payload)
        }
      })

      // Error Event
      this._client.on('error', () => this.disconnect())
    }
  }

  disconnect () {
    if (this._started) {
      clearInterval(this._timer)
      this._started = false
      this._client.end()
      this.emit('disconnected', this._agentId)
    }
  }
}

module.exports = IotAgent
