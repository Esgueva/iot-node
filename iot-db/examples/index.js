"use strict";

const db = require("..");
const { configDb } = require("../../config");
async function run() {
  const { Agent, Metric } = await db(configDb).catch(handleFatalError);

  const agent = await Agent.createOrUpdate({
    uuid: "yyx",
    name: "test",
    username: "testo",
    hostname: "testo",
    pid: 1,
    connected: true,
  }).catch(handleFatalError);

  console.log("----AGENT----");
  console.log(agent);

  const agents = await Agent.findAll(handleFatalError);

  console.log("----AGENTS----");
  console.log(agents);

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(
    handleFatalError
  );

  console.log("----METRICS----");
  console.log(metrics);

  const metric = await Metric.create(agent.uuid, {
    type: "memory",
    value: "300",
  }).catch(handleFatalError);

  console.log("----METRIC----");
  console.log(metric);

  const metricsByType = await Metric.findByTypeAgentUuid(
    "memory",
    agent.uuid
  ).catch(handleFatalError);

  console.log("----METRIC MEMORY----");
  console.log(metricsByType);
}

function handleFatalError(err) {
  console.error(err.message);
  console.error(err.stack);
  process.exit(1);
}

run();
