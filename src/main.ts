import * as path from 'path'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {execa, $} from 'execa'
import {wait} from './wait'
import {readResults} from './read-results'
import {dumpMetadata} from './metadata'
import {parseInputs} from './parse-inputs'

const {
  setupScript,
  preBuildScript,
  buildScript,
  serveScript,
  cleanupScript,
  url,
  minScore,
  sleepTime,
  token
} = parseInputs()

const shCommand = $({shell: true})

async function run(): Promise<void> {
  core.startGroup('Stark Accessibility Checker: Setup')
  await shCommand`${setupScript}`
  core.endGroup()

  core.startGroup('Stark Accessibility Checker: Prebuild')
  await shCommand`${preBuildScript}`
  core.endGroup()

  core.startGroup('Stark Accessibility Checker: Build')
  await shCommand`${buildScript}`
  core.endGroup()

  core.startGroup('Stark Accessibility Checker: Serve & Scan')
  core.info(
    `Sleeping for ${sleepTime} ms. Giving the start command time to complete!`
  )
  // TODO: Pipe stdio to file stream.
  const childProcess = $({
    shell: true,
    detached: true,
    stdio: 'inherit'
  })`${serveScript}`

  await wait(Number.parseInt(sleepTime))
  // TODO: Also pipe to logs
  const params = ['scan', '--url', url, '--min-score', minScore]
  if (token) {
    // TODO: change this to be 2 separate things
    params.push('--stark-token', token)
    params.push('--scan-id', token)
  }
  try {
    const metadataDir = await dumpMetadata(github, 'github')
    if (metadataDir) params.push('--metadata', metadataDir)
  } catch (error) {
    core.info(
      'Could not dump github metadata to file. Continuing without metadata'
    )
  }
  // TODO: Check run id
  await execa('stark-accessibility', params, {
    stdio: 'inherit'
  })

  core.info('Shutting down server. Scanning done.')
  childProcess.unref()

  const cliOutDir = path.resolve(process.cwd(), './.stark-contrast/')
  const results = await readResults(cliOutDir)

  //TODO: Format better. Add error checking
  const tableData = []
  //TODO: Handling if results = []
  for (const data of results[0].data) {
    tableData.push([data.name, `${data.value}  `])
  }

  core.summary
    .addHeading(`Accessibility results Summary`)
    .addHeading(url, 4)
    .addTable(tableData)

  const reportURL = results[0].url
    ? results[0].url
    : 'https://account.getstark.co/projects'
  core.summary.addLink('View full results', reportURL)

  core.summary.addSeparator()

  await core.summary.write()
  core.endGroup()

  core.startGroup('Stark Accessibility Checker: Cleanup')
  await shCommand`${cleanupScript}`
  core.endGroup()
  return
}

run()
