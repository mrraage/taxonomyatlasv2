import { ConfigEnv, Plugin, UserConfig } from "vite"
import http from "http"
import fs from "fs"

const PLUGIN_NAME = "jobtech-taxonomy"

const DATA_DIR = "data"

const TAXONOMY_HOST = "https://taxonomy.api.jobtechdev.se"

const versions_url = TAXONOMY_HOST + "/v1/taxonomy/main/versions"
const concept_url = TAXONOMY_HOST + "/v1/taxonomy/main/concept/changes"
const relation_url = TAXONOMY_HOST + "/v1/taxonomy/main/relation/changes"

async function get(url: string): Promise<any> {
  console.log("Fetching " + url)
  const response = await fetch(url)
  if (!response.ok) {
    console.error("Failed to fetch " + url)
    return [];
  }
  return await response.json()
}

async function loadVersions(): Promise<any> {
  return await get(versions_url)
}

function fromVersionToVersion(url: string, fromVersion: number, toVersion: number): string {
  return url + "?after-version=" + (fromVersion - 1) + "&to-version-inclusive=" + toVersion
}

async function loadRelationChanges(version: number): Promise<any> {
  return await get(fromVersionToVersion(relation_url, version, version))
}

async function loadConceptChanges(version: number): Promise<any> {
  return await get(fromVersionToVersion(concept_url, version, version))
}

function relation_changes_file(version: number): String {
  return `${DATA_DIR}/relation_changes_${version}.json`
}

function concept_changes_file(version: number): String {
  return `${DATA_DIR}/concept_changes_${version}.json`
}

async function writefile(input1: number, input2: string , input3 : string): Promise<any> { 
    console.log("Fetched changes for version " + input1)
    return fs.writeFileSync(input2, JSON.stringify(input3))
}

export default (): Plugin => {
  return {
    name: PLUGIN_NAME,
    config: async (config: UserConfig, env: ConfigEnv) => {

      fs.mkdirSync(DATA_DIR, { recursive: true })
      const versions = await loadVersions()
      fs.writeFileSync(DATA_DIR + "/versions.json", JSON.stringify(versions))

      const numbered_versions = versions.map((elt: any) => {return {
        version: elt["taxonomy/version"],
        relation: relation_changes_file(elt["taxonomy/version"]),
        concept: concept_changes_file(elt["taxonomy/version"])
      }})

      const fetchers = numbered_versions.map((version: { version: number, relation: string, concept: string }) => {
        return async () => {

          if (fs.existsSync(version.relation)) {
            console.log("Already fetched relation changes for version " + version.version)
          } else {
            const relationChanges = await loadRelationChanges(version.version)
            writefile(version.version, version.relation , relationChanges)
          }

          if (fs.existsSync(version.concept)) {
            console.log("Already fetched concept changes for version " + version.version)
          } else {
            const conceptChanges = await loadConceptChanges(version.version)
            writefile(version.version, version.concept , conceptChanges)
          }
          
          // if (fs.existsSync(version.relation)) {
          //   console.log("Already fetched relation changes for version " + version.version)
          // } else {
          //   const relationChanges = await loadRelationChanges(version.version)
          //   fs.writeFileSync(version.relation, JSON.stringify(relationChanges))
          //   console.log("Fetched relation changes for version " + version.version)
          // }

          // if (fs.existsSync(version.concept)) {
          //   console.log("Already fetched concept changes for version " + version.version)
          // } else {
          //   const conceptChanges = await loadConceptChanges(version.version)
          //   fs.writeFileSync(version.concept, JSON.stringify(conceptChanges))
          //   console.log("Fetched concept changes for version " + version.version)
          // }


        }     
      })

      Promise.all(fetchers.map((fetcher: any) => fetcher()))

    }
  }
}