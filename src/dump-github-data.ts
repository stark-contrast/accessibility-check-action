import * as fs from 'fs/promises'
import {pick} from 'lodash'
import * as path from 'path'

export async function dumpGithubData(github: any) {
  const dirName = '.stark-metadata'
  const fileName = 'github.json'
  const fullDirPath = path.join(dirName)
  const requiredProps = [
    'context.eventName',
    'context.sha',
    'context.ref',
    'context.workflow',
    'context.action',
    'context.actor',
    'context.job',
    'context.runNumber',
    'context.runId',
    'context.apiUrl',
    'context.serverUrl',
    'context.graphqlUrl',
    'context.payload.organization'
  ]
  const githubData = pick(github, ...requiredProps)
  await fs.mkdir(dirName)
  await fs.writeFile(path.join(fullDirPath, fileName), JSON.stringify(githubData))
  return fullDirPath
}
