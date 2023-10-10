import * as fs from 'fs'
import path from 'path'
import * as core from '@actions/core'

export interface ResultData {
  url: string
  data: {
    name: string
    value: string
  }[]
}

/**
 * Reads the stark directory for output files. Currently only expects that the folder has summary.json and individual reports for one run.
 * The method loosely checks if the file is in correct format and only then appends it to the results
 * @param cliOutDir
 * @returns [summary, results[]] Tuple where the first value is the summary and the second is an array of individual scans
 */
export async function readResults(
  cliOutDir: string
): Promise<[ResultData, ResultData[]]> {
  const files = await fs.promises.readdir(cliOutDir)
  let summary = undefined
  const results = []
  for (const file of files) {
    core.debug(`Parsing ${file}`)
    try {
      const filePath = path.resolve(cliOutDir, file)
      const json = JSON.parse(await fs.promises.readFile(filePath, 'utf8'))
      core.debug(json)
      if (json.url && json.data && Array.isArray(json.data)) {
        if (path.basename(file) === 'summary.json') {
          summary = json
        } else {
          results.push(json)
        }
      }
    } catch (error) {
      core.error(error as Error | string)
    }
  }
  return [summary, results]
}
