'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const config = { logging: () => {} }

const MetricStub = { belongsTo: sinon.spy() }

let AgentStub = null
let db = null
let sandbox = null

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  AgentStub = { hasMany: sandbox.spy() }

  // Proxyquire for tests requires
  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach((t) => {
  sandbox && sandbox.restore()
})

test('Agent', (t) => {
  t.truthy(db.Agent, 'Agent service should exist')
})

test.serial('Setup', (t) => {
  // Agent Stub
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(
    AgentStub.hasMany.calledWith(MetricStub),
    'Argument should be the MetricModel'
  )

  // Metric Stub
  t.true(MetricStub.belongsTo.called, 'MetricStub.belongsTo was executed')
  t.true(
    MetricStub.belongsTo.calledWith(AgentStub),
    'Argument should be the MetricModel'
  )
})
