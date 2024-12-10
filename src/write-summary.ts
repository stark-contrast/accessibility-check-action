import * as core from '@actions/core';
import { ResultData, readResults } from './read-results.js';

export async function writeSummary(cliOutDir: string): Promise<void> {
  const results = await readResults(cliOutDir);
  const summary = results[0];
  const individualReports = results[1];
  //TODO: Format better. Add error checking

  if (summary) {
    core.summary.addHeading(`Accessibility results Summary`);

    createSummaryTable(summary);
  }

  // Backlink to Starks report for this scan
  const reportURL = summary.url ? summary.url : 'https://account.getstark.co/projects';
  core.summary.addLink('View detailed results', reportURL);

  core.summary.addHeading(`Breakdown summary for ${individualReports.length} url(s):`, 3);
  // Breakdown for individual urls
  for (const report of individualReports) {
    core.summary.addSeparator().addHeading(`Summary for: ${report.url}`, 5);
    createSummaryTable(report);
  }

  await core.summary.write();
}

export function createSummaryTable(results: ResultData): void {
  const tableData = [];
  for (const data of results.data) {
    tableData.push([data.name, `${data.value}  `]);
  }
  core.summary.addTable(tableData);
}
