const IotAgent = require('../')

const opts = {
  name: 'untitled',
  username: 'iot-client',
  interval: 5000,
  mqtt: {
    host: 'mqtt://localhost'
  }
}

const agent = new IotAgent(opts)

// Sync Function
agent.addMetric('syncMetrics', function getRss () {
  return process.memoryUsage().rss
})

// Async Function
agent.addMetric('promiseMetrics', function getRandomPromise () {
  return Promise.resolve(Math.random())
})

// Async Callback
agent.addMetric('callbackMetric', function getRandomCallback (callback) {
  setTimeout(() => {
    callback(null, Math.random())
  }, 1000)
})

agent.connect()

// Internal Events
agent.on('connected', handler)
agent.on('disconnected', handler)
agent.on('message', handler)

// External Events
agent.on('agent/connected', handler)
agent.on('agent/disconnected', handler)
agent.on('agent/message', (payload) => {
  console.log(payload)
})

// Handler
function handler (payload) {
  console.log(payload)
}

// Timeout
setTimeout(() => agent.disconnect(), 20000)
