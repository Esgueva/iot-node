'use strict'

const setupDatabase = require('./lib/db')
const setupAgentModel = require('./models/agent')
const setupMetricModel = require('./models/metric')
const setupAgent = require('./lib/agent')
const setupMetric = require('./lib/metric')
const defaults = require('defaults')

module.exports = async function (config) {
  // Default Config
  config = defaults(config, {
    dialect: 'sqlite',
    pool: {
      max: 10,
      min: 0,
      idle: 10000 // Timeout
    },
    query: {
      raw: true // Json format
    }
  })

  // Sequelize
  const sequelize = setupDatabase(config)

  // Models
  const AgentModel = setupAgentModel(config)
  const MetricModel = setupMetricModel(config)

  // Relationship
  AgentModel.hasMany(MetricModel)
  MetricModel.belongsTo(AgentModel)

  // DB config validation
  await sequelize.authenticate()

  // DB Sync (Warning - Drop Tables)
  if (config.setup) {
    await sequelize.sync({ force: true })
  }

  const Agent = setupAgent(AgentModel)
  const Metric = setupMetric(MetricModel, AgentModel)

  return {
    Agent,
    Metric
  }
}
