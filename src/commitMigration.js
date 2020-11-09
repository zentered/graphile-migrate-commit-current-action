const fs = require('fs')
const { parseMigrationText, getAllMigrations, serializeMigration } = require('graphile-migrate/dist/migration')
const { readCurrentMigration, getCurrentMigrationLocation, writeCurrentMigration } = require('graphile-migrate/dist/current')
const { sluggify } = require('graphile-migrate/dist/sluggify')
const { calculateHash }  = require('graphile-migrate/dist/hash')
const omit = require('lodash/omit')

const migrationsFolder = './migrations'
const currentMigrationPath = `${migrationsFolder}/current.sql`
const pgmSettings = { migrationsFolder }

module.exports = async function() {
  try {
    await fs.promises.access(
      `${migrationsFolder}/committed`,
      fs.constants.R_OK
    )
  } catch (e) {
    console.error(`Failed to open migrations directory: ${e.message}`)
    return;
  }
  const committedMigrations = await getAllMigrations(pgmSettings)
  const lastCommittedMigration = committedMigrations[committedMigrations.length - 1]
  console.log(`Last committed migration: ${lastCommittedMigration.realFilename}`)

  const newMigrationNumber = lastCommittedMigration
    ? parseInt(lastCommittedMigration.filename, 10) + 1
    : 1;
  
  const currentLocation = await getCurrentMigrationLocation(pgmSettings);
  const currentMigrationContent = await readCurrentMigration(pgmSettings, currentLocation);

  const { headers: currentMigrationHeaders, body: currentMigrationBody } = parseMigrationText(
    currentMigrationPath,
    currentMigrationContent,
    false
  )
  const currentMigrationMessage = currentMigrationHeaders.Message

  if (currentMigrationBody.trim() === '') {
    console.log('Current migration is empty - skipping commit.')
    return
  }

  if (currentMigrationMessage && /[\r\n\0\b\v\f\cA-\cZ]/u.test(currentMigrationMessage)) {
    throw new Error("Invalid commit message: contains disallowed characters");
  }
  if (currentMigrationMessage && currentMigrationMessage.length > 512) {
    throw new Error(
      "Invalid commit message: message is too long (max: 512 chars)",
    );
  }

  const newMigrationFileName = `${
    String(newMigrationNumber).padStart(6, '0')
  }${
    currentMigrationMessage ? `-${sluggify(currentMigrationMessage)}` : '' 
  }.sql`
  console.log(`New migration name: ${newMigrationFileName}`)

  const newMigrationHash = calculateHash(
    currentMigrationBody,
    lastCommittedMigration && lastCommittedMigration.hash
  )

  const newMigrationContent = serializeMigration(
    currentMigrationBody,
    {
      Previous: lastCommittedMigration ? lastCommittedMigration.hash : "-",
    Hash: newMigrationHash,
    Message: currentMigrationMessage || undefined,
    ...omit(currentMigrationHeaders, ["Previous", "Hash", "Message"]),
    }
  )
  fs.writeFileSync(
    `${migrationsFolder}/committed/${newMigrationFileName}`,
    newMigrationContent
  )
  await writeCurrentMigration({}, currentLocation, "\n");
}
