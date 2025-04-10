import LZString from "lz-string"
import TaxUtil, { processStructure, setupTreeItems } from "../taxonomy/util.tsx"
import Rest from "../context/rest.ts"
import GraphQL from "../context/graphql.ts"
import { sortByKey } from "../context/util.ts"

class Context {
    escoLoadCompleteCallback: (items: any, isOccupations: any) => void
    skillLoadCompleteCallback: (items: any) => void
    isLoadingSkills(SHOW_SKILLS: any, isLoadingSkills: any, skillItems: any) {
        throw new Error("Method not implemented.")
    }
    skillItems(SHOW_SKILLS: any, isLoadingSkills: any, skillItems: any) {
        throw new Error("Method not implemented.")
    }
    isLoadingEscoOccupation(SHOW_ESCO_OCCUPATION: any, isLoadingEscoOccupation: any, escoOccupationItems: any) {
        throw new Error("Method not implemented.")
    }
    escoOccupationItems(SHOW_ESCO_OCCUPATION: any, isLoadingEscoOccupation: any, escoOccupationItems: any) {
        throw new Error("Method not implemented.")
    }
    isLoadingEscoSkills(SHOW_ESCO_SKILL: any, isLoadingEscoSkills: any, escoSkillItems: any) {
        throw new Error("Method not implemented.")
    }
    escoSkillItems(SHOW_ESCO_SKILL: any, isLoadingEscoSkills: any, escoSkillItems: any) {
        throw new Error("Method not implemented.")
    }

    constructor() {
        this.escoOccupationItems = this.getCacheValue("atlas_esco_occupation_cache")
        this.escoSkillItems = this.getCacheValue("atlas_esco_skill_cache")
        this.skillItems = this.getCacheValue("atlas_skill_cache")
        this.isLoadingEscoOccupation = this.escoOccupationItems == null
        this.isLoadingEscoSkills = this.escoSkillItems == null
        this.isLoadingSkills = this.skillItems == null
        this.escoLoadCompleteCallback = null
        this.skillLoadCompleteCallback = null
    }

    setCacheValue(key, value) {
        localStorage.setItem(key + "_date", Date.now())
        localStorage.setItem(key, LZString.compress(JSON.stringify(value)))
    }

    getCacheValue(key) {
        var date = localStorage.getItem(key + "_date")
        if (date != null && (Date.now() - parseInt(date)) < 12 * 60 * 60 * 1000) {
            var value = localStorage.getItem(key)
            try {
                value = LZString.decompress(value)
                return JSON.parse(value)
            } catch (e) {
                return null
            }
        }
        return null
    }

    async getSkills() {
        var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_SKILLS)
        if (structure != null) {
            setupTreeItems(structure.data.concepts, "label")
            sortByKey(structure.data.concepts, "label", true)
            return structure.data.concepts
        } else {
            // TODO: error popup?
            return []
        }
    }

    async getEscoOccupation() {
        var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_ESCO_OCCUPATION)
        return processStructure(structure, null)
    }

    async getEscoSkill() {
        var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_ESCO_SKILL)
        return processStructure(structure, null)
    }

    async fetchSkill() {
        this.isLoadingSkills = true
        this.skillItems = await this.getSkills()
        this.isLoadingSkills = false
        if (this.skillItems != null) {
            this.setCacheValue("atlas_skill_cache", this.skillItems)
        }
        if (this.skillLoadCompleteCallback) {
            this.skillLoadCompleteCallback(this.skillItems)
        }
    }


    async fetchEscoOccupation() {
        this.isLoadingEscoOccupation = true
        this.escoOccupationItems = await this.getEscoOccupation()
        this.isLoadingEscoOccupation = false
        if (this.escoOccupationItems != null) {
            this.setCacheValue("atlas_esco_occupation_cache", this.escoOccupationItems)
        }
        if (this.escoLoadCompleteCallback) {
            this.escoLoadCompleteCallback(this.escoOccupationItems, true)
        }
    }

    async fetchEscoSkill() {
        this.isLoadingEscoSkills = true
        this.escoSkillItems = await this.getEscoSkill()
        this.isLoadingEscoSkills = false
        if (this.escoSkillItems != null) {
            this.setCacheValue("atlas_esco_skill_cache", this.escoSkillItems)
        }
        if (this.escoLoadCompleteCallback) {
            this.escoLoadCompleteCallback(this.escoSkillItems, false)
        }
    }

    async init() {
        if (this.skillItems == null) {
            await this.fetchSkill()
        }
        if (this.escoOccupationItems == null) {
            await this.fetchEscoOccupation()
        }
        if (this.escoSkillItems == null) {
            await this.fetchEscoSkill()
        }
    }

}

export default new Context()