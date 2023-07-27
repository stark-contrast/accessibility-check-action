import * as fs from 'fs/promises'
import {pick} from 'lodash'
import * as path from 'path'

const DIRNAME = '.stark-metadata'

type MetadataType = 'github'
type Metadata = Partial<Record<MetadataType, object>>

export async function dumpMetadata(
  data: object,
  type: MetadataType
): Promise<string> {
  const metadata: Metadata = {}
  let extractedData = {}
  switch (type) {
    case 'github':
      extractedData = extractGithubData(data)
      break
    default:
      extractedData = data
  }
  metadata[type] = extractedData
  return await dumpDataToFile(metadata)
}

export function extractGithubData(github: object): object {
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
  return githubData
}

export async function dumpDataToFile(data: Metadata): Promise<string> {
  try {
    await fs.access(DIRNAME)
  } catch {
    await fs.mkdir(DIRNAME)
  }
  const fullDirPath = path.join(DIRNAME)
  for (const key of Object.keys(data)) {
    const fileName = `${key}.json`
    const fileData = data[key as keyof Metadata]
    await fs.writeFile(
      path.join(fullDirPath, fileName),
      JSON.stringify(fileData)
    )
  }
  return fullDirPath
}
