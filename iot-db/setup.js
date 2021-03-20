'use strict'

const debug = require('debug')('iot-node:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')
const db = require('./')

const prompt = inquirer.createPromptModule()

async function setup () {
  // Confirmation Response for Db Sync
  const answer = await prompt([
    {
      type: 'confirm',
      name: 'setup',
      default: false,
      message: `${chalk.blue(
        '[NOTICE] This will destroy your database, are you sure?'
      )}`
    }
  ])

  // Exit configuration
  if (!answer.setup) return console.log('Nothing Happend')

  // Config
  const config = {
    database: process.env.DB_NAME || 'iot_db',
    username: process.env.DB_USER || 'iot',
    password: process.env.DB_PASS || 'iot',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    dialect: process.env.DB_DIAL || 'postgres',
    setup: true,
    logging: (s) => debug(s)
  }

  // Setup
  await db(config).catch(handleFatalError)
  console.log('Success!')
  process.exit(0)
}

// Handle Error
function handleFatalError (err) {
  console.log(`${chalk.red('[FATAL ERROR]')} ${chalk.yellow(err.message)}`)
  process.exit(1)
}

setup()
