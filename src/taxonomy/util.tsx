import Rest from "../context/rest.ts"
import GraphQL from "../context/graphql.ts"
import {sortByKey} from "../context/util.ts"
import Constants from "../context/constants.ts"

function generateQuery(args: Array<string>) {
	var query = "query Atlas {"
	for(var i=0; i<args.length; ++i) {
		query += args[i]
	}
	query += "}"
	return query
}

export function setupTreeItems(items, sortKey) {
	for(var i=0; i<items.length; ++i) {
		var item = items[i]
		item.isExpanded = false
		item.sortOrder = item.sortOrder != null ? item.sortOrder : item.sort_order
		// remove old codes if this is a updated concept
		if(item["nuts_level_3_code_2013"] != null && item["nuts_level_3_code_2021"] != null) {
			delete item["nuts_level_3_code_2013"]
		}
		// setup sub items
		if(item.children) {
			setupTreeItems(item.children, sortKey)
			if(item.children.length && item.children[0][sortKey] != null) {
				sortByKey(item.children, sortKey, true)
			} else {
				sortByKey(item.children, "label", true)
			}
		}
	}
}

export function processStructure(structure, sortKey) {
	if(structure != null) {
		var id = 0
		var roots: Array<{id: number, label: string, children: any}> = []
		for(var property in structure.data) {
			roots.push({
				id: id++,
				label: "db_" + property.replace(/_/g, "-"),
				children: structure.data[property],
			})
		}
		setupTreeItems(roots, sortKey != null ? sortKey : "label")
		sortByKey(roots, sortKey != null ? sortKey : "label", true)
		return roots
	} else {
		// TODO: error popup?
		return []
	}
}

class Util {
	t: any

	constructor(t) {
		this.t = t
	}

	setupSsykCode(items) {
		for(var i=0; i<items.length; ++i) {
			var item = items[i]
			if(item.ssyk_code) {
				item.ssyk_code = {
					code: item.ssyk_code,
					label: item.label,
				}
			}
			if(item.children) {
				this.setupSsykCode(item.children)
			}
		}
	}

	setupSubstitues(item) {
		var high = {
			id: "high_substitutability",
			label: "high_substitutability",
			children: []
		}
		var low = {
			id: "low_substitutability",
			label: "low_substitutability",
			children: []
		}
		for(var i=0; i<item.substitutes.length; ++i) {
			var substitute = item.substitutes[i]
			if(substitute.percentage >= 50) {
				high.children.push(substitute)
			} else  {
				low.children.push(substitute)
			}
		}
		//replace current substitutes
		item.substitutes = []
		if(high.children.length > 0) {
			item.substitutes.push(high)
		}
		if(low.children.length > 0) {
			item.substitutes.push(low)
		}
		setupTreeItems(item.substitutes, "label")
	}

	getDisplayTypeForConcept(type) {
		if(type.startsWith("ssyk") || 
		   type == "occupation-name" ||
		   type == "occupation-field") {
			return Constants.DISPLAY_TYPE_WORK_SSYK
		} else if(type.startsWith("isco")) {
			return Constants.DISPLAY_TYPE_WORK_ISCO
		} else if(type.startsWith("skill")) {
			return Constants.DISPLAY_TYPE_SKILL
		} else if(type.startsWith("sun-education")) {
			return Constants.DISPLAY_TYPE_EDUCATION
		} else if(type.startsWith("employment") ||
				  type == "wage-type" ||
				  type == "worktime-extent" ||
				  type == "occupation-experience-year") {
			return Constants.DISPLAY_TYPE_WORK_DESC
		} else if(type == "continent" ||
				  type == "country" ||
				  type == "region" ||
				  type == "municipality") {
			return Constants.DISPLAY_TYPE_GEOGRAPHY
		} else if(type.startsWith("language")) {
			return Constants.DISPLAY_TYPE_LANGUAGE
		} else if(type.startsWith("sni")) {
			return Constants.DISPLAY_TYPE_INDUSTRY
		} else if(type.startsWith("keyword")) {
			return Constants.DISPLAY_TYPE_SEARCH
		} else if(type == "swedish-retail-and-wholesale-council-skill") {
			return Constants.DISPLAY_TYPE_SWE_SKILL
		} else if(type == "employment-duration" ||
				  type == "work-place-environment" ||
				  type == "wage-type" ||
				  type == "worktime-extent" ||
				  type == "occupation-experience-year" ||
				  type == "employment-variety" ||
				  type == "employment-type" ||
				  type == "self-employment-type") {
			return Constants.DISPLAY_TYPE_WORK_DESC
		} else if(type == "esco-occupation" ||
				  type == "esco-skill") {
			return Constants.DISPLAY_TYPE_ESCO_OCCUPATION
		} else if(type == "forecast-occupation") {
			return Constants.DISPLAY_TYPE_FORECAST_OCCUPATION
		} else if(type == "barometer-occupation") {
			return Constants.DISPLAY_TYPE_BAROMETER_OCCUPATION
		}
		return Constants.DISPLAY_TYPE_OTHER
	}



	conceptQuery(name, query, data) {
		var version = Constants.getArg("v")
		version = version != null ? ", version: \"" + version + "\"" : ""
		var result = (name ? name + ": " : "") + "concepts(" + query + version + ") {"
		if(data) {
			result += data
		}
		result += "}"
		return result
	}



	setupSsykStructure(structure, deepSortKey, shallowSortKey) {
		if(structure != null) {
			setupTreeItems(structure.data.concepts, deepSortKey)
			sortByKey(structure.data.concepts, shallowSortKey, true)
			this.setupSsykCode(structure.data.concepts)
			return structure.data.concepts
		} else {
			// TODO: error popup?
			return []
		}
	}

	async getSsykStructureMini() {
		var query = 
			generateQuery([this.conceptQuery(null, "type: \"ssyk-level-1\"",
				GraphQL.GRAPHQL_SSYK_LIST_TYPE_ITEM +
				"children: narrower(type: \"ssyk-level-2\") {" +
					GraphQL.GRAPHQL_SSYK_LIST_TYPE_ITEM +
					"children: narrower(type: \"ssyk-level-3\") {" +
						GraphQL.GRAPHQL_SSYK_LIST_TYPE_ITEM +
						"children: narrower(type: \"ssyk-level-4\") {" + GraphQL.GRAPHQL_SSYK_LIST_TYPE_ITEM + "}" +
					"}" +
				"}"
			)]) + GraphQL.GRAPHQL_SSYK_LIST_TYPE_FRAGMENT
		var structure = await Rest.awaitGraphQl(query)
		return this.setupSsykStructure(structure, "ssyk_code", "ssyk_code")
	}

	async getSsykStructure() {
		var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_SSYK_STRUCTURE)
		return this.setupSsykStructure(structure, "ssyk_code", "ssyk_code")
	}
	
	async getIscoStructure() {
		var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_ISCO_STRUCTURE)
        if(structure != null) {
			sortByKey(structure.data.concepts, "isco_code", true)
			for(var i=0; i<structure.data.concepts.length; ++i) {
				var item = structure.data.concepts[i]
				item.isco_code = {
					code: item.isco_code,
					label: item.label,
				}
			}
			return structure.data.concepts
		} else {
			// TODO: error popup?
			return []
		}
	}

	async getSsykGroups() {
		var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_SSYK_GROUPS)
		return this.setupSsykStructure(structure, "label", "ssyk_code")
	}

	async getOccupations() {
		var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_OCCUPATIONS)
		if(structure != null) {
			sortByKey(structure.data.concepts, "label", true)
			return structure.data.concepts
		} else {
			// TODO: error popup?
			return []
		}
	}

	async getFields() {
		var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_FIELDS)
		return this.setupSsykStructure(structure, "ssyk_code", "label")
	}

	async getSkillCollections() {
		var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_SKILL_COLLECTIONS)
		var roots = structure.data.skill_collections.map((x) => x)
		setupTreeItems(roots, "label")
		sortByKey(roots, "label", true)
		return roots
		
	}

	async getGenericSkills() {
		var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_GENERIC_SKILLS)
		var roots = structure.data.generic_skills.map((x) => x)
		setupTreeItems(roots, "label")
		sortByKey(roots, "label", true)
		return roots
		
	}

	async getSweSkills() {
		var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_SWE_SKILLS)
		if(structure != null) {
			setupTreeItems(structure.data.concepts, "label")
			sortByKey(structure.data.concepts, "label", true)
			var concepts = structure.data.concepts
			for(var i=0; i<concepts.length; ++i) {
				concepts[i].relation_list = []
				concepts[i].relation_list.push({
					name: this.t("taxonomy_item_keyword_substitues"),
					list: concepts[i].related,
				})
			}
			return concepts
		} else {
			// TODO: error popup?
			return []
		}
	}

	async getIndustry() {
		var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_INDUSTRY)
		return processStructure(structure, "sni_level_code_2007")
	}

	async getKeywords() {
		var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_KEYWORDS)
		if(structure != null) {
			var addToList = (item, list) => {
				if(list.length == 0 || list[list.length - 1] != item) {
					list.push(item)
				}
			}
			var occupations = []
			var education = []
			var employmentType = []
			var other = []
			var items = processStructure(structure)
			for(var i=0; i<items[0].children.length; ++i) {
				var item = items[0].children[i]
				item.relation_list = []
				if(item.related.length) {
					sortByKey(item.related, "ssyk_code", true)
					this.setupSsykCode(item.related)
					// split related into correct type lists
					var typeLists = []
					for(var j=0; j<item.related.length; ++j) {
						var type = item.related[j].type
						var container = typeLists.find((x) => {
							return x.type == type
						})
						if(container == null) {
							container = {
								type: type,
								items: [],
							}
							typeLists.push(container)
						}
						container.items.push(item.related[j])
						// add keyword to separate lists depending on relations
						if(type.startsWith("occupation-name") || type.startsWith("ssyk-")) {
							addToList(item, occupations)
						} else if(type.startsWith("sun-education")) {
							addToList(item, education)
						} else if(type.startsWith("employment-type")) {
							addToList(item, employmentType)
						} else {
							addToList(item, other)
						}
					}
					for(var j=0; j<typeLists.length; ++j) {
						item.relation_list.push({
							name: this.t("db_" + typeLists[j].items[0].type),
							list: typeLists[j].items,
						})
					}
				}
			}
			// finalize roots
			var id = 0
			var setupRoot = (roots, list, name) => {
				if(list.length > 0) {
					sortByKey(list, "label", true)
					roots.push({
						id: id++,
						isExpanded: false,
						label: name,
						children: list
					})
				}
			}
			items = []
			var namePrefix = this.t("db_keyword") + " - "
			setupRoot(items, occupations, namePrefix + this.t("occupations"))
			setupRoot(items, education, namePrefix + this.t("education"))
			setupRoot(items, employmentType, namePrefix + this.t("employment_types"))
			setupRoot(items, other, namePrefix + this.t("other"))
			sortByKey(items, "label", true)
			return items
		} else {
			// TODO: error popup?
			return []
		}
	}

	async getJobTitles() {
		var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_JOB_TITLES)
		if(structure != null) {
			var addToList = (item, list) => {
				if(list.length == 0 || list[list.length - 1] != item) {
					list.push(item)
				}
			}
			var occupations = []
			var education = []
			var employmentType = []
			var other = []
			var items = processStructure(structure)
			for(var i=0; i<items[0].children.length; ++i) {
				var item = items[0].children[i]
				item.relation_list = []
				if(item.related.length) {
					sortByKey(item.related, "ssyk_code", true)
					this.setupSsykCode(item.related)
					// split related into correct type lists
					var typeLists = []
					for(var j=0; j<item.related.length; ++j) {
						var type = item.related[j].type
						var container = typeLists.find((x) => {
							return x.type == type
						})
						if(container == null) {
							container = {
								type: type,
								items: [],
							}
							typeLists.push(container)
						}
						container.items.push(item.related[j])
						// add keyword to separate lists depending on relations
						if(type.startsWith("occupation-name") || type.startsWith("ssyk-")) {
							addToList(item, occupations)
						} else if(type.startsWith("sun-education")) {
							addToList(item, education)
						} else if(type.startsWith("employment-type")) {
							addToList(item, employmentType)
						} else {
							addToList(item, other)
						}
					}
					for(var j=0; j<typeLists.length; ++j) {
						item.relation_list.push({
							name: this.t("db_" + typeLists[j].items[0].type),
							list: typeLists[j].items,
						})
					}
				}
			}
			// finalize roots
			var id = 0
			var setupRoot = (roots, list, name) => {
				if(list.length > 0) {
					sortByKey(list, "label", true)
					roots.push({
						id: id++,
						isExpanded: false,
						label: name,
						children: list
					})
				}
			}
			items = []
			var namePrefix = this.t("db_job-title") + " - "
			setupRoot(items, occupations, namePrefix + this.t("occupations"))
			setupRoot(items, education, namePrefix + this.t("education"))
			setupRoot(items, employmentType, namePrefix + this.t("employment_types"))
			setupRoot(items, other, namePrefix + this.t("other"))
			sortByKey(items, "label", true)
			return items
		} else {
			// TODO: error popup?
			return []
		}
	}

	async getLanguage() {
		var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_LANGUAGE)
		return processStructure(structure)
	}

	async getEducation() {
		var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_EDUCATION)
		return processStructure(structure, "code")
	}

	async getGeography() {
		var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_GEOGRAPHY)
		return processStructure(structure)
	}

	async getOccupationDesc() {
		var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_OCCUPATION_DESC)
		var element = structure.data["employment_variety"][0]
		structure.data["occupation_type"] = [{
			label: "db_employment-type",
			children: element.employment_type,
		}, {
			label: "db_self-employment-type",
			children: element.self_employment_type,
		}]
		delete structure.data["employment_variety"]
		return processStructure(structure)
	}

	async getForecast() {
		var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_FORECAST_OCCUPATIONS)
		var roots = []
		var id = 0
		for(var i=0; i<structure.data.forecast_occupation.length; ++i) {
			var occupation = structure.data.forecast_occupation[i]
			roots.push(occupation)
			/*roots.push({
				id: id++,
				label: occupation.label,
				children: occupation.children,
			});*/	
		}
		setupTreeItems(roots, "label")
		sortByKey(roots, "label", true)
		return roots
	}

	async getBarometerOccupations() {
		var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_BAROMETER_OCCUPATIONS)
		var roots = []
		var id = 0
		for(var i=0; i<structure.data.barometer_occupation.length; ++i) {
			var occupation = structure.data.barometer_occupation[i]
			roots.push(occupation)
		}
		setupTreeItems(roots, "label")
		sortByKey(roots, "label", true)
		return roots
	}

	async getOthers() {
		var structure = await Rest.awaitGraphQl(GraphQL.GRAPHQL_OTHER)
		return processStructure(structure)
	}

	async getConceptBase(id) {
		if(id == null) {
			return null
		}
		var query = generateQuery([this.conceptQuery(null, "id: \"" + id + "\"", GraphQL.GRAPHQL_CONCEPT_BASE)])
		var structure = await Rest.awaitGraphQl(query)
		if(structure != null) {
			var data = structure.data.concepts[0]
			if(data.substitutes) {
				this.setupSubstitues(data)
				sortByKey(data.substitutes, "label", true)
			}
			if(data.keywords) {
				sortByKey(data.keywords, "label", true)
			}
			if(data.exact_match.length > 0 ||
			   data.broad_match.length > 0 ||
			   data.narrow_match.length > 0 ||
			   data.close_match.length > 0) {
				var children = []
				var index = 1
				var setupChildren = (items, matchType) => {
					for(var j=0; j<items.length; ++j) {
						var item = items[j]
						var result = children.find((x) => {
							return x.type == item.type
						})
						if(result == null) {
							result = {
								id: matchType + index++,
								isExpanded: false,
								type: item.type,
								label: "db_" + item.type,
								children: []
							}
							children.push(result)
						}
						var container = result.children.find((x) => {
							return x.type == matchType
						})
						if(container == null) {
							container = {
								id: matchType + index++,
								isExpanded: false,
								type: matchType,
								label: this.t(matchType + "_concept") + " " + this.t("db_" + item.type).toLowerCase(),
								children: []
							}
							result.children.push(container)
						}
						container.children.push(item)
					}
				}

				setupChildren(data.exact_match, "exact_match")
				setupChildren(data.broad_match, "broad_match")
				setupChildren(data.narrow_match, "narrow_match")
				setupChildren(data.close_match, "close_match")
				data.mapping_relation_list = children
			}
			return data
		} else {
			// TODO: error popup?
			return null
		}
	}

    async setupSsykItem(item) {
		var query = generateQuery([this.conceptQuery(null, "id: \"" + item.id + "\"", GraphQL.GRAPHQL_CONCEPT_SSYK_ITEM)])
		var structure = await Rest.awaitGraphQl(query)
		if(structure != null) {
			var data = structure.data.concepts[0]
			// setup skill tree
			if(data.skills) {
				var headlines = []
				for(var i=0; i<data.skills.length; ++i) {
					var skill = data.skills[i]
					var headline = skill.headline[0]
					var current = headlines.find((x) => {
						return x.id == headline.id
					})
					if(current == null) {
						current = {
							id: headline.id,
							label: headline.label,
							type: "skill-headline",
							isExpanded: false,
							children: [],
						}
						headlines.push(current)
					}
					current.children.push({
						id: skill.id,
						label: skill.label,
						type: "skill",
					})
					sortByKey(current.children, "label", true)
				}
				sortByKey(headlines, "label", true)
				data.skills = headlines
			}
			// setup field
			if(data.field) {
				data.field = data.field[0]
			}
			// finalize item
			if(item.ssyk_code == null) {
				item.ssyk_code = {
					code: data.ssyk_code,
					label: item.label,
				}
			}
			item.definition = data.definition
			item.field = data.field
			item.isco_codes = data.isco_codes
			item.relation_list = [{
				name: "taxonomy_item_skills",
				list: data.skills,
			}]
			item.isLoaded = true
		} else {
			// TODO: error popup?
		}
	}

    async setupIscoItem(item) {
		var query = generateQuery([this.conceptQuery(null, "id: \"" + item.id + "\"", GraphQL.GRAPHQL_CONCEPT_ISCO_ITEM)])
		var structure = await Rest.awaitGraphQl(query)
		if(structure != null) {
			var data = structure.data.concepts[0]
			// finalize item
			if(item.isco_code == null) {
				item.isco_code = {
					code: data.isco_code,
					label: item.label,
				}
			}
			item.ssyk_codes = data.ssyk_codes
			if(data.ssyk_codes && data.ssyk_codes.length > 0) {
				item.ssyk_code = data.ssyk_codes[0]
			}
			item.definition = data.definition
			item.isco_codes = [item.isco_code]
		} else {
			// TODO: error popup?
		}
	}

	async setupSkillItem(item) {
		var query = generateQuery([this.conceptQuery(null, "id: \"" + item.id + "\"", GraphQL.GRAPHQL_CONCEPT_SKILL_ITEM)])
		var structure = await Rest.awaitGraphQl(query)
		if(structure != null) {
			var data = structure.data.concepts[0]
			item.definition = data.definition
			if(item.relation_list == null) {
				item.relation_list = []
			}
			if(data.occupations.length) {
				sortByKey(data.occupations, "ssyk_code", true)
				this.setupSsykCode(data.occupations)
				item.relation_list.push({
					name: "taxonomy_item_skill_relations",
					list: data.occupations,
				})
			}
			if(data.skill_collections.length) {
				sortByKey(data.skill_collections, "label", true)
				item.relation_list.push({
					name: "taxonomy_item_skill_collections",
					list: data.skill_collections,
				})
			}
			if(data.exact_match.length > 0 ||
			   data.broad_match.length > 0 ||
			   data.narrow_match.length > 0 ||
			   data.close_match.length > 0) {
				var children = []
				var index = 1
				var setupChildren = (items, matchType) => {
					for(var j=0; j<items.length; ++j) {
						var item = items[j]
						var result = children.find((x) => {
							return x.type == item.type
						})
						if(result == null) {
							result = {
								id: matchType + index++,
								isExpanded: false,
								type: item.type,
								label: "db_" + item.type,
								children: []
							}
							children.push(result)
						}
						var container = result.children.find((x) => {
							return x.type == matchType
						})
						if(container == null) {
							container = {
								id: matchType + index++,
								isExpanded: false,
								type: matchType,
								label: this.t(matchType + "_concept") + " " + this.t("db_" + item.type).toLowerCase(),
								children: []
							}
							result.children.push(container)
						}
						container.children.push(item)
					}
				}

				setupChildren(data.exact_match, "exact_match")
				setupChildren(data.broad_match, "broad_match")
				setupChildren(data.narrow_match, "narrow_match")
				setupChildren(data.close_match, "close_match")
				item.mapping_relation_list = children
			}
		} else {
			// TODO: error popup?
		}
	}
	
	async getSsykParent(child) {
		var query = generateQuery([this.conceptQuery(null, "id: \"" + child.id + "\"", GraphQL.GRAPHQL_CONCEPT_SSYK_PARENT_ITEM)])
		var structure = await Rest.awaitGraphQl(query)
		if(structure != null) {
			var data = structure.data.concepts[0]
			// setup parent
			if(data.parent && data.parent.length > 0) {
				data.parent = data.parent[0]
				if(data.parent.ssyk_code) {
					data.parent.ssyk_code = {
						code: data.parent.ssyk_code,
						label: data.parent.label,
					}
				}
				child.parent = data.parent
			}
		} else {
			// TODO: error popup?
		}
	}

	async setupItem(item) {
		if(item.isLoaded) {
			// item is already loaded
			return
		}
		item.isLoaded = true
        if(item.type.startsWith("ssyk")) {
			await this.setupSsykItem(item)
        } else if(item.type.startsWith("isco")) {
			await this.setupIscoItem(item)
        } else if(item.type.startsWith("skill")) {
			await this.setupSkillItem(item)
        } else {
			if(item.parent == null && item.type == "occupation-name") {
				await this.getSsykParent(item)
			}
            // TODO: fetch item data in a more specific way?
			var concept = await this.getConceptBase(item.id)
			if(concept == null) {
				return
			}
			item.definition = concept.definition
			item.label = concept.label
			item.sortOrder = concept.sort_order
			if(item.relation_list == null) {
				item.relation_list = []
			}
			if(item.mapping_relation_list == null) {
				item.mapping_relation_list = concept.mapping_relation_list
			}/* else {
				item.mapping_relation_list.push(...concept.mapping_relation_list)
			}*/
			if(concept.substitutes && concept.substitutes.length) {
				item.relation_list.push({
					name: "taxonomy_item_substitutes",
					list: concept.substitutes,
				})
			}
			if(concept.keywords && concept.keywords.length) {
				item.relation_list.push({
					name: this.t("taxonomy_item_keywords"),
					list: concept.keywords,
				})
			}
			if(concept.job_titles && concept.job_titles.length) {
				item.relation_list.push({
					name: this.t("taxonomy_item_job_titles"),
					list: concept.job_titles,
				})
			}
			var parent = item.parent
            if(parent && parent.type && parent.type.startsWith("ssyk")) {
				// TODO: setup parent for all types?
				await this.setupItem(parent)
				item.field = parent.field
				item.ssyk_code = parent.ssyk_code
				if(item.type == "occupation-name") {
					item.isco_codes = concept.isco_codes
				} else {
					item.isco_codes = parent.isco_codes
				}
				// TODO: dont merge all lists?
				item.relation_list = parent.relation_list.concat(item.relation_list)
			}
        }
	}
	
}

export default Util