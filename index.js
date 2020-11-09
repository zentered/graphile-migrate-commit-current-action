const core = require('@actions/core')
const commitMigration = require('./src/commitMigration')

try {
  commitMigration()
} catch(e) {
  core.setFailed(e.message)
}