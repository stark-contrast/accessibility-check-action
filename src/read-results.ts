import * as fs from 'fs'
import path from 'path'

export interface ResultData {
  url: string,
  data: {
    name: string
    value: string
  }[]
}

export async function readResults(cliOutDir: string): Promise<ResultData[]> {
  const files = await fs.promises.readdir(cliOutDir)
  const results = []
  for (const file of files) {
    if (path.basename(file) === 'summary.json') {
      const filePath = path.resolve(cliOutDir, file)
      const json = JSON.parse(await fs.promises.readFile(filePath, 'utf8'))
      results.push(json)
    }
  }
  return results
}
