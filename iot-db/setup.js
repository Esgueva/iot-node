"use strict";

const debug = require("debug")("iot-node:db:setup");
const inquirer = require("inquirer");
const chalk = require("chalk");
const db = require("./");
const configDb = require("../config");

const prompt = inquirer.createPromptModule();

async function setup() {
  // Confirmation Response for Db Sync
  const answer = await prompt([
    {
      type: "confirm",
      name: "setup",
      default: false,
      message: `${chalk.blue(
        "[NOTICE] This will destroy your database, are you sure?"
      )}`,
    },
  ]);

  // Exit configuration
  if (!answer.setup) return console.log("Nothing Happend");

  // Setup
  await db(configDb).catch(handleFatalError);
  console.log("Success!");
  process.exit(0);
}

// Handle Error
function handleFatalError(err) {
  debug(`${chalk.red("[FATAL ERROR]")} ${chalk.yellow(err.message)}`);
  process.exit(1);
}

setup();
