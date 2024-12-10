import * as path from 'path';
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as exec from '@actions/exec';
import { execa, $ } from 'execa';
import { wait } from './wait.js';
import { dumpMetadata } from './metadata.js';
import { parseInputs } from './parse-inputs.js';
import { writeSummary } from './write-summary.js';
import {
  getCombinedSummary,
  PageScore,
  ScanOptions,
  ScanResult,
  scanUrl,
  sendEndScan,
  sendScanResult,
  sendStartScanMetadata,
  StartScanMetadata,
} from '@stark-contrast/stark-scan';

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
  scanDelay,
  viewport,
} = parseInputs();

async function run(): Promise<void> {
  //#region Set up the environment and start the server
  core.startGroup('Stark Accessibility Checker: Setup');
  await exec.exec(setupScript);
  core.endGroup();

  core.startGroup('Stark Accessibility Checker: Prebuild');
  await exec.exec(preBuildScript);
  core.endGroup();

  core.startGroup('Stark Accessibility Checker: Build');
  await exec.exec(buildScript);
  core.endGroup();

  core.startGroup('Stark Accessibility Checker: Serve & Scan');
  core.info(`Sleeping for ${sleepTime} ms. Giving the start command time to complete!`);
  const childProcess = $({
    shell: true,
    detached: true,
    stdio: 'inherit',
  })`${serveScript}`;

  await wait(Number.parseInt(sleepTime));
  //#endregion

  //#region Run the Stark scan
  try {
    const version = '0.7.2-beta.0'; // This is the latest pre-Ferryman version so that user-app knows how to parse it.
    process.env.BROWSER_PATH = '/usr/bin/google-chrome'; // Installed in our container.

    if (token !== 'MISSING STARK TOKEN') {
      try {
        // Send the start scan metadata to Stark
        const startScanMetadata: StartScanMetadata = {
          urlCount: urls.length,
          authDetails: {
            error: undefined,
          },
          version,
        };
        await sendStartScanMetadata(token, startScanMetadata);
      } catch (err) {
        console.warn('Error sending start scan metadata');
      }
    }

    let summaries: PageScore[] = [];

    for (const url of urls) {
      // Do the scan
      const scanOptions: ScanOptions = {
        url,
        token,
        skipErrors,
        puppeteerTimeout: Number(puppeteerTimeout),
        viewport,
        stealthMode,
        waitUntil: puppeteerWaitUntil.join(','),
        useSamePage: false,
        scanDelayMs: parseInt(scanDelay),
        authenticationMode: 'none',
        loginPageUrl: '',
      };
      const scanData = await scanUrl(scanOptions);

      if (!skipErrors && scanData.error) {
        throw scanData.error;
      }

      if (scanData.summary) {
        summaries.push(scanData.summary);
        console.log(`Summary for ${url}: ${JSON.stringify(scanData.summary, null, 2)}`);
      }

      if (token !== 'MISSING STARK TOKEN') {
        try {
          // Send the results to Stark
          const scanResult: ScanResult = { url, minScore: parseInt(minScore), scanData, version };
          await sendScanResult(token, scanResult);
        } catch (err) {
          console.warn('Error sending scan results');
        }
      }
    }

    const combinedSummary = getCombinedSummary(summaries);
    console.log(`Overall summary for all URLs: ${JSON.stringify(combinedSummary, null, 2)}`);
  } catch (err) {
    console.warn('Error running the scan', err);
  } finally {
    try {
      if (token !== 'MISSING STARK TOKEN') {
        // Send the end scan notification to Stark
        await sendEndScan(token);
      }
    } catch (err) {
      console.warn('Error sending end scan');
    }
  }
  //#endregion

  //#region Clean up
  core.info('Shutting down server. Scanning done.');
  childProcess.unref();
  core.endGroup();

  core.startGroup('Writing action summary');
  const cliOutDir = path.resolve(process.cwd(), './.stark-contrast/');
  await writeSummary(cliOutDir);
  core.endGroup();

  core.startGroup('Stark Accessibility Checker: Cleanup');
  await exec.exec(cleanupScript);
  core.endGroup();
  //#endregion

  return;
}

run();
