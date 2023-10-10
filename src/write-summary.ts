import * as core from '@actions/core'
import {ResultData, readResults} from './read-results'

export async function writeSummary(cliOutDir: string): Promise<void> {
  const results = await readResults(cliOutDir)
  const summary = results[0]
  const individualReports = results[1]
  //TODO: Format better. Add error checking

  if (summary) {
    core.summary.addHeading(`Accessibility results Summary`)

    createSummaryTable(summary)

    core.summary.addDetails(
      'Scanned:',
      `${individualReports.length} URLs scanned based on the config.`
    )

    core.summary.addSeparator()
  }

  // Backlink to Starks report for this scan
  const reportURL = results[0].url
    ? results[0].url
    : 'https://account.getstark.co/projects'
  core.summary.addLink('View detailed results', reportURL)

  core.summary.addHeading(
    `Breakdown summary for ${individualReports.length} url(s)`,
    3
  )
  // Breakdown for individual urls
  for (const report of individualReports) {
    core.summary.addSeparator().addHeading(`Summary for: ${report.url}`, 5)
    createSummaryTable(report)
  }

  await core.summary.write()
}

export function createSummaryTable(results: ResultData): void {
  const tableData = []
  for (const data of results.data) {
    tableData.push([data.name, `${data.value}  `])
  }
  core.summary.addTable(tableData)
}
