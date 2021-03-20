'use strict'

import Sequelize from 'sequelize'
let sequelize = null

// Singleton
export default function setupDataBase (config) {
  if (!sequelize) sequelize = new Sequelize(config)

  return sequelize
}
