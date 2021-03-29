"use strict";

const agent = {
  id: 1,
  uuid: "yyy-yyy-yyy",
  name: "reo",
  username: "reo",
  hostname: "reo-host",
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const agents = [
  agent,
  { ...agent, id: 2, uuid: "yyy-yyy-yyw", connected: false, username: "test" },
  { ...agent, id: 3, uuid: "yyy-yyy-yyx" },
  { ...agent, id: 4, uuid: "yyy-yyy-yyz", username: "test" },
];

module.exports = {
  single: agent,
  all: agents,
  connected: agents.filter((a) => a.connected),
  reo: agents.filter((a) => a.username === "reo"),
  findByUuid: (uuid) => agents.filter((a) => a.uuid === uuid).shift(),
  findById: (id) => agents.filter((a) => a.id === id).shift(),
};
