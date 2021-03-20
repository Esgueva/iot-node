'use strict'

const setupDatabase = require('./lib/db')
const setupAgentModel = require('./models/agent')
const setupMetricModel = require('./models/metric')
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

  const Agent = {}
  const Metric = {}

  return {
    Agent,
    Metric
  }
}
