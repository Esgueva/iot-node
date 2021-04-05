'use strict'

module.exports = function setupMetric (MetricModel, AgentModel) {
  async function findByAgentUuid (uuid) {
    return await MetricModel.findAll({
      attributes: ['type'],
      group: ['type'],

      include: [
        // join
        {
          attributes: [], // no return data from AgentModel
          model: AgentModel, // data model for join
          where: {
            uuid
          }
        }
      ],
      raw: true // force raw data return (json)
    })
  }

  async function findByTypeAgentUuid (type, uuid) {
    return await MetricModel.findAll({
      attributes: ['id', 'type', 'value', 'createdAt'],
      where: {
        type
      },
      limit: 20,
      order: [['createdAt', 'DESC']],
      // join
      include: [
        {
          attributes: [],
          model: AgentModel,
          where: {
            uuid
          }
        }
      ],
      raw: true
    })
  }

  async function create (uuid, metric) {
    const agent = await AgentModel.findOne({
      where: { uuid }
    })

    if (agent) {
      Object.assign(metric, { agentId: agent.id })
      const result = await MetricModel.create(metric)
      return result.toJSON()
    }
  }

  return { create, findByAgentUuid, findByTypeAgentUuid }
}
