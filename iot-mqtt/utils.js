'use strict'

function parsePayload (payload) {
  if (payload instanceof Buffer) {
    payload = payload.toString('utf-8')
  }

  try {
    payload = JSON.parse(payload)
  } catch (e) {
    payload = null
  }

  return payload
}

module.exports = { parsePayload }
