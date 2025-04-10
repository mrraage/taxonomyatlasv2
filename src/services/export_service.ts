import Constants from "../context/constants"
import Excel from "../context/excel"
import Rest from "../context/rest"
import {sortByKey} from "../context/util"
import EventDispatcher from "../context/event_dispatcher"

class Localization {
  /**
   * Returns the localized string for the specified key
   * @param key The key to get the localized string for
   */
  static get(key: string): string {
    return key
  }
}

export class ExportService {
  /**
   * Exports occupations data to Excel
   */
  static async exportOccupations(): Promise<void> {
    EventDispatcher.fire(Constants.EVENT_SHOW_POPUP_INDICATOR, Localization.get("exporting") + "...")
    
    const versionName = Constants.getArg("v")
    const version = versionName != null ? `, version: "${versionName}"` : ""
    
    const query = `
      query Atlas {
        concepts(type: "occupation-field"${version}) {
          label: preferred_label
          children: narrower(type: "ssyk-level-4") {
            label: preferred_label
            code: ssyk_code_2012
            children: narrower(type: "occupation-name") {
              label: preferred_label
            }
          }
        }
      }
    `
    
    const structure = await Rest.awaitGraphQl(query)
    
    if (structure != null) {
      const data = structure.data.concepts
      sortByKey(data, "label", true)
      
      const vs = await Rest.getVersionsPromise()
      const resolvedVersion = versionName == null ? vs[vs.length - 1].version : versionName
      
      // Generate excel
      const columns = [
        { text: "Yrkesområde", width: 30 },
        { text: "SSYK 2012", width: 20 },
        { text: "Yrkesgrupp", width: 55 },
        { text: "Yrkesbenämning", width: 40 }
      ]
      
      const name = "Yrkesgrupper"
      const context = Excel.createSimple(name, resolvedVersion, columns)
      
      for (let i = 0; i < data.length; ++i) {
        const field = data[i]
        sortByKey(field.children, "code", true)
        
        for (let j = 0; j < field.children.length; ++j) {
          const group = field.children[j]
          sortByKey(group.children, "label", true)
          
          for (let k = 0; k < group.children.length; ++k) {
            const occupation = group.children[k]
            context.addRow(["", field.label, group.code, group.label, occupation.label])
          }
        }
      }
      
      context.download(name + ".xlsx")
    }
    
    EventDispatcher.fire(Constants.EVENT_HIDE_POPUP_INDICATOR)
  }

  /**
   * Exports skills data to Excel
   */
  static async exportSkills(): Promise<void> {
    EventDispatcher.fire(Constants.EVENT_SHOW_POPUP_INDICATOR, Localization.get("exporting") + "...")
    
    const versionName = Constants.getArg("v")
    const version = versionName != null ? `, version: "${versionName}"` : ""
    
    const query = `
      query Atlas {
        concepts(type: "skill"${version}) {
          label: preferred_label
          parent: broader(type: "skill-headline") {
            id
            label: preferred_label
          }
          children: related(type: "ssyk-level-4") {
            label: preferred_label
            code: ssyk_code_2012
          }
        }
      }
    `
    
    const structure = await Rest.awaitGraphQl(query)
    
    if (structure != null) {
      const data = structure.data.concepts
      sortByKey(data, "label", true)
      
      const vs = await Rest.getVersionsPromise()
      const resolvedVersion = versionName == null ? vs[vs.length - 1].version : versionName
      
      // Generate excel
      const name = "Kompetenser"
      const context = Excel.create(name, name, resolvedVersion)
      context.addRow()
      
      // Insert data
      let prevParentId = null
      
      for (let i = 0; i < data.length; ++i) {
        const item = data[i]
        item.parent = item.parent[0]
        sortByKey(item.children, "code", true)
        
        if (prevParentId != item.parent.id) {
          prevParentId = item.parent.id
          context.addRow()
          context.addGroupRow(item.parent.label, null, null, true)
        }
        
        if (item.children.length) {
          context.addGroupRow(item.label, item.children[0].code, item.children[0].label)
          
          for (let j = 1; j < item.children.length; ++j) {
            context.addGroupRow(null, item.children[j].code, item.children[j].label)
          }
        } else {
          context.addGroupRow(item.label)
        }
      }
      
      context.download(name + ".xlsx")
    }
    
    EventDispatcher.fire(Constants.EVENT_HIDE_POPUP_INDICATOR)
  }

  /**
   * Exports SSYK data to Excel
   */
  static async exportSsyk(): Promise<void> {
    EventDispatcher.fire(Constants.EVENT_SHOW_POPUP_INDICATOR, Localization.get("exporting") + "...")
    
    const versionName = Constants.getArg("v")
    const version = versionName != null ? `, version: "${versionName}"` : ""
    
    const query = `
      query Atlas {
        concepts(type: "occupation-field"${version}) {
          label: preferred_label
          children: narrower(type: "ssyk-level-4") {
            label: preferred_label
            code: ssyk_code_2012
          }
        }
      }
    `
    
    const structure = await Rest.awaitGraphQl(query)
    
    if (structure != null) {
      const data = structure.data.concepts
      sortByKey(data, "label", true)
      
      const vs = await Rest.getVersionsPromise()
      const resolvedVersion = versionName == null ? vs[vs.length - 1].version : versionName
      
      // Generate excel
      const name = "Yrken"
      const context = Excel.create(name, name, resolvedVersion)
      context.addRow()
      
      // Insert data
      for (let i = 0; i < data.length; ++i) {
        const item = data[i]
        sortByKey(item.children, "code", true)
        
        if (item.children.length) {
          context.addRow()
          context.addGroupRow(item.label, item.children[0].code, item.children[0].label)
          
          for (let j = 1; j < item.children.length; ++j) {
            context.addGroupRow(null, item.children[j].code, item.children[j].label)
          }
        } else {
          context.addRow()
          context.addGroupRow(item.label)
        }
      }
      
      context.download(name + ".xlsx")
    }
    
    EventDispatcher.fire(Constants.EVENT_HIDE_POPUP_INDICATOR)
  }
}

export default ExportService
