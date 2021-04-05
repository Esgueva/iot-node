'use strict'

const db = require('..')

async function run () {
  // Config
  const config = {
    database: process.env.DB_NAME || 'iot_db',
    username: process.env.DB_USER || 'iot',
    password: process.env.DB_PASS || 'iot',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    dialect: process.env.DB_DIAL || 'postgres'
  }

  const { Agent, Metric } = await db(config).catch(handleFatalError)

  const agent = await Agent.createOrUpdate({
    uuid: 'yyx',
    name: 'test',
    username: 'test',
    hostname: 'test',
    pid: 1,
    connected: true
  }).catch(handleFatalError)

  console.log('----AGENT----')
  console.log(agent)

  const agents = await Agent.findAll(handleFatalError)

  console.log('----AGENTS----')
  console.log(agents)

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(
    handleFatalError
  )

  console.log('----METRICS----')
  console.log(metrics)

  const metric = await Metric.create(agent.uuid, {
    type: 'memory',
    value: '300'
  }).catch(handleFatalError)

  console.log('----METRIC----')
  console.log(metric)

  const metricsByType = await Metric.findByTypeAgentUuid(
    'memory',
    agent.uuid
  ).catch(handleFatalError)

  console.log('----METRIC MEMORY----')
  console.log(metricsByType)
}

function handleFatalError (err) {
  console.error(err.message)
  console.error(err.stack)
  process.exit(1)
}

run()
