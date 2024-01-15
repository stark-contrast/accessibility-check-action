import * as path from 'path'
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as exec from '@actions/exec'
import {execa, $} from 'execa'
import {wait} from './wait'
import {dumpMetadata} from './metadata'
import {parseInputs} from './parse-inputs'
import {writeSummary} from './write-summary'

const {
  setupScript,
  preBuildScript,
  buildScript,
  serveScript,
  cleanupScript,
  urls,
  minScore,
  sleepTime,
  token,
  puppeteerTimeout,
  puppeteerWaitUntil,
  stealthMode,
  skipErrors,
  scanDelay
} = parseInputs()

async function run(): Promise<void> {
  core.startGroup('Stark Accessibility Checker: Setup')
  await exec.exec(setupScript)
  core.endGroup()

  core.startGroup('Stark Accessibility Checker: Prebuild')
  await exec.exec(preBuildScript)
  core.endGroup()

  core.startGroup('Stark Accessibility Checker: Build')
  await exec.exec(buildScript)
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
  const params = ['scan', '--min-score', minScore, '--sandbox-mode', 'off']

  // Push all urls as params
  for (const url of urls) {
    params.push('--url', url)
  }

  if (token) {
    // TODO: change this to be 2 separate things
    params.push('--stark-token', token)
    params.push('--scan-id', token)
  }

  for (const waitUntil of puppeteerWaitUntil) {
    params.push('--puppeteer-wait-until')
    params.push(waitUntil)
  }

  if (stealthMode) {
    params.push('--stealth-mode')
  }
  if (skipErrors) {
    params.push('--skip-errors')
  }
  params.push(...['--puppeteer-timeout', puppeteerTimeout])
  params.push(...['--scan-delay', scanDelay])

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
  core.endGroup()

  core.startGroup('Writing action summary')
  const cliOutDir = path.resolve(process.cwd(), './.stark-contrast/')
  await writeSummary(cliOutDir)
  core.endGroup()

  core.startGroup('Stark Accessibility Checker: Cleanup')
  await exec.exec(cleanupScript)
  core.endGroup()
  return
}

run()
