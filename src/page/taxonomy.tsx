import React from "react"
import Header from "../components/header.tsx"
import Loader from "../components/loader.tsx" // Add Loader import
import Constants from "../context/constants.ts"
import Content from "../taxonomy/content.tsx"
import Start from "../taxonomy/start.tsx"
import GotoDialog from "../taxonomy/goto_dialog.tsx"
import Util from "../taxonomy/util.tsx"
import EventDispatcher from "../context/event_dispatcher.tsx"
import Rest from "../context/rest.ts"
import Context from "../context/context.tsx"
import { useTranslation } from "react-i18next"
import "./app.css"
import "./taxonomy.css"
import TreeViewPanel from "../taxonomy/tree_view_panel"
import { DisplayType } from "../constants/display_types"
import { useParams, Params } from "react-router"

// Define Props interface
interface TaxonomyProps {
  t: { t: (key: string) => string }; // Assuming t function structure from usage
  params: Readonly<Params<string>>; // From useParams hook
}

// Define State interface
interface TaxonomyState {
  items: any[];
  selected: any | null;
  filter: string;
  isLoading: boolean;
  isFetchingItem: boolean;
  dialog: React.ReactNode | null;
  popupText: string | null;
  popupSpinner: boolean;
  showType: number | string; // Based on usage with DisplayType constants
  relatedSkills: any[];
}

class Taxonomy extends React.Component<TaxonomyProps, TaxonomyState> {
	preSelectType: { key: string, value: any } | null
	fetchType: any
	t: any
	util: any

	constructor(props) {
		super(props)
		this.t = this.props.t.t
		this.util = new Util(this.t)
		// state
		this.state = {
			items: [],
			selected: null,
			filter: "",
			isLoading: true,
			isFetchingItem: false,
			dialog: null,
			popupText: null,
			popupSpinner: true,
			showType: -1,
			relatedSkills: [],
		} as TaxonomyState; // Assert type for initial state
		this.preSelectType = null
		Context.escoLoadCompleteCallback = (items, isOccupations) => {
			if ((this.fetchType == DisplayType.ESCO_OCCUPATION && isOccupations) ||
				(this.fetchType == DisplayType.ESCO_SKILL && !isOccupations)) {
				this.setState({
					showType: this.fetchType,
					items: items,
					isLoading: false,
				})
			}
		}
		Context.skillLoadCompleteCallback = (items) => {
			if (this.fetchType == DisplayType.SKILLS) {
				this.setState({
					showType: DisplayType.SKILLS,
					items: items,
					isLoading: false,
				})
			}
		}
		setTimeout(() => { Context.init(); }, 2500)
	}

	componentDidMount() {
		EventDispatcher.add(this.forceUpdate.bind(this), Constants.EVENT_LANGUAGE_CHANGED)
		EventDispatcher.add(this.onShowPopup.bind(this), Constants.EVENT_SHOW_POPUP_INDICATOR)
		EventDispatcher.add(this.onHidePopup.bind(this), Constants.EVENT_HIDE_POPUP_INDICATOR)
		EventDispatcher.add(this.onAutocompleteItemClicked.bind(this), Constants.EVENT_AUTOCOMPLETE_ITEM)
		// check if url points to a targeted concept
		const hashConcept = this.props.params.concept
		if (hashConcept && hashConcept.length > 3) {
			var version = Constants.getArg("v")
			Rest.getConcept(hashConcept, version, (data) => {
				if (data.length > 0) {
					var isField = data[0].type == "occupation-field"
					var type = this.util.getDisplayTypeForConcept(data[0].type)
					this.onDisplayTypeChanged(type, {
						key: "id",
						value: data[0].id,
					}, data[0].type)
					EventDispatcher.fire(Constants.EVENT_TAXONOMY_SET_SEARCH_TYPE, {
						type: type,
						radio: isField ? Constants.DISPLAY_WORK_TYPE_FIELDS : Constants.DISPLAY_WORK_TYPE_GROUP
					})
				}
			}, console.log)
		} else {
			this.showGroups()
		}
	}

	setPrefetchedTreeViewData(type, isLoading, items) {
		if (this.state.showType != type) {
			this.fetchType = type
			if (isLoading) {
				this.setState({ isLoading: true })
			} else {
				this.setState({
					showType: type,
					items: items,
					isLoading: false,
				})
			}
		}
	}

	async setTreeViewData(type, method) {
		if (this.state.showType != type) {
			this.fetchType = type
			this.setState({ isLoading: true })
			var data = await method()
			if (this.fetchType == type) {
				this.setState({
					showType: type,
					items: data,
					isLoading: false,
				})
			}
		}
	}

	async showStructure() {
		await this.setTreeViewData(DisplayType.STRUCTURE, () => { return this.util.getSsykStructure(); })
	}

	async showGroups() {
		await this.setTreeViewData(DisplayType.GROUPS, () => { return this.util.getSsykGroups(); })
	}

	async showOccupations() {
		await this.setTreeViewData(DisplayType.OCCUPATIONS, () => { return this.util.getOccupations(); })
	}

	async showFields() {
		await this.setTreeViewData(DisplayType.FIELDS, () => { return this.util.getFields(); })
	}

	async showIsco() {
		await this.setTreeViewData(DisplayType.ISCO, () => { return this.util.getIscoStructure(); })
	}

	async showSkills() {
		//await this.setTreeViewData(DisplayType.SKILLS, () => { return this.util.getSkills(); })
		this.setPrefetchedTreeViewData(DisplayType.SKILLS, Context.isLoadingSkills, Context.skillItems)
	}

	async showSkillCollections() {
		await this.setTreeViewData(DisplayType.SKILL_COLLECTIONS, () => { return this.util.getSkillCollections(); })
	}

	async showGenericSkills() {
		await this.setTreeViewData(DisplayType.SKILL_COLLECTIONS, () => { return this.util.getGenericSkills(); })
	}
	async showSweSkills() {
		await this.setTreeViewData(DisplayType.SWE_SKILLS, () => { return this.util.getSweSkills(); })
	}

	async showOccupationDesc() {
		await this.setTreeViewData(DisplayType.WORK_DESC, () => { return this.util.getOccupationDesc(); })
	}

	async showGeography() {
		await this.setTreeViewData(DisplayType.GEOGRAPHY, () => { return this.util.getGeography(); })
	}

	async showIndustry() {
		await this.setTreeViewData(DisplayType.INDUSTRY, () => { return this.util.getIndustry(); })
	}

	async showKeyword() {
		await this.setTreeViewData(DisplayType.SEARCH, () => { return this.util.getKeywords(); })
	}

	async showJobTitles() {
		await this.setTreeViewData(DisplayType.JOB_TITLE, () => { return this.util.getJobTitles(); })
	}

	async showLanguage() {
		await this.setTreeViewData(DisplayType.LANGUAGE, () => { return this.util.getLanguage(); })
	}

	async showEducation() {
		await this.setTreeViewData(DisplayType.EDUCATION, () => { return this.util.getEducation(); })
	}

	async showOther() {
		await this.setTreeViewData(DisplayType.OTHER, () => { return this.util.getOthers(); })
	}

	async showEscoOccupation() {
		//await this.setTreeViewData(DisplayType.ESCO_OCCUPATION, () => { return this.util.getEscoOccupation(); })
		this.setPrefetchedTreeViewData(DisplayType.ESCO_OCCUPATION, Context.isLoadingEscoOccupation, Context.escoOccupationItems)
	}
	async showEscoSkill() {
		//await this.setTreeViewData(DisplayType.ESCO_SKILL, () => { return this.util.getEscoSkill(); })
		this.setPrefetchedTreeViewData(DisplayType.ESCO_SKILL, Context.isLoadingEscoSkills, Context.escoSkillItems)
	}

	async showForecast() {
		await this.setTreeViewData(DisplayType.FORECAST, () => { return this.util.getForecast(); })
	}

	async showBarometerOccupation() {
		await this.setTreeViewData(DisplayType.BAROMETER_OCCUPATION, () => { return this.util.getBarometerOccupations(); })
	}

	async fetchItem(item) {
		this.setState({ isFetchingItem: true })
		await this.util.setupItem(item)
		// Extract related skills
		let relatedSkills = [];
		if (item.relation_list) {
			const skillRelationKeys = [
				"taxonomy_item_skills",
				"taxonomy_item_skill_relations",
				"taxonomy_item_skill_collections"
			];
			item.relation_list.forEach(relation => {
				if (skillRelationKeys.includes(relation.name) && relation.list) {
					relatedSkills = relatedSkills.concat(relation.list);
				}
			});
			// Sort and remove duplicates if necessary (optional, depending on data structure)
			// relatedSkills = [...new Map(relatedSkills.map(skill => [skill.id, skill])).values()];
			// sortByKey(relatedSkills, "label", true);
		}

		this.setState({
			selected: item,
			isFetchingItem: false,
			relatedSkills: relatedSkills, // Update state with extracted skills
		}, () => {
			Constants.replaceArg("concept", item.id)
		})
	}

	onDisplayTypeChanged(type, preSelectType, conceptType) {
		this.preSelectType = preSelectType
		if (type == Constants.DISPLAY_TYPE_WORK_SSYK) {
			if (conceptType != null && conceptType == "occupation-field") {
				this.showFields()
			} else {
				this.showGroups()
			}
		} else if (type == Constants.DISPLAY_TYPE_WORK_ISCO) {
			this.showIsco()
		} else if (type == Constants.DISPLAY_TYPE_SKILL) {
			this.showSkills()
		} else if (type == Constants.DISPLAY_TYPE_SKILL_COLLECTION) {
			this.showSkillCollections()
		} else if (type == Constants.DISPLAY_TYPE_SWE_SKILL) {
			this.showSweSkills()
		} else if (type == Constants.DISPLAY_TYPE_WORK_DESC) {
			this.showOccupationDesc()
		} else if (type == Constants.DISPLAY_TYPE_GEOGRAPHY) {
			this.showGeography()
		} else if (type == Constants.DISPLAY_TYPE_INDUSTRY) {
			this.showIndustry()
		} else if (type == Constants.DISPLAY_TYPE_SEARCH) {
			this.showKeyword()
		} else if (type == Constants.DISPLAY_TYPE_LANGUAGE) {
			this.showLanguage()
		} else if (type == Constants.DISPLAY_TYPE_EDUCATION) {
			this.showEducation()
		} else if (type == Constants.DISPLAY_TYPE_ESCO_OCCUPATION) {
			this.showEscoOccupation()
		} else if (type == Constants.DISPLAY_TYPE_ESCO_SKILL) {
			this.showEscoSkill()
		} else if (type == Constants.DISPLAY_TYPE_FORECAST_OCCUPATION) {
			this.showForecast()
		} else if (type == Constants.DISPLAY_TYPE_BAROMETER_OCCUPATION) {
			this.showBarometerOccupation()
		} else if (type == Constants.DISPLAY_TYPE_OTHER) {
			this.showOther()
		} else if (type == Constants.DISPLAY_TYPE_JOB_TITLE) {
			this.showJobTitles()
		} else if (type == Constants.DISPLAY_TYPE_GENERIC_SKILL) {
			this.showGenericSkills()
		}
	}

	onDisplayWorkTypeChanged(type) {
		this.preSelectType = null
		if (type == Constants.DISPLAY_WORK_TYPE_STRUCTURE) {
			this.showStructure()
		} else if (type == Constants.DISPLAY_WORK_TYPE_GROUP) {
			this.showGroups()
		} else if (type == Constants.DISPLAY_WORK_TYPE_OCCUPATIONS) {
			this.showOccupations()
		} else if (type == Constants.DISPLAY_WORK_TYPE_FIELDS) {
			this.showFields()
		}
		this.setState({ filter: "" })
	}

	onFilterChanged(filter) {
		this.preSelectType = null
		this.setState({ filter: filter })
	}

	onItemClicked(item) {
		this.preSelectType = null
		if (item != this.state.selected && item.type) {
			this.fetchItem(item)
			/*if(item.children != null && item.children.length > 0) {
				setTimeout(() => {
					for(var i=0; i<item.children.length && i<20; ++i) {
						this.util.setupItem(item.children[i])
					}
				}, 250)
			}*/
		}
		if (item.isExpanded != null) {
			item.isExpanded = !item.isExpanded
		}
	}

	onAutocompleteItemClicked(item) {
		// TODO: populate special fields
		item.label = item.preferredLabel
		this.onOtherPressed(item, true)
	}

	showGotoDialog(text, callback, skipDialog) {
		var yesCallback = () => {
			callback()
			this.setState({
				dialog: null,
				filter: "",
			})
		}
		if (skipDialog) {
			yesCallback()
		} else {
			var dialog =
				<GotoDialog
					text={text}
					yesCallback={yesCallback}
					noCallback={() => this.setState({ dialog: null })} />
			this.setState({ dialog: dialog })
		}
	}

	// the following 3 callbacks are called from the special tags in the info block
	onSsykPressed(ssyk) {
		this.showGotoDialog(this.t("db_ssyk-level-4") + ", " + ssyk.label, () => {
			this.switchAndSelect(Constants.DISPLAY_TYPE_WORK_SSYK, Constants.DISPLAY_WORK_TYPE_GROUP, "ssyk_code", ssyk.code, this.showStructure.bind(this))
		}, false) // Add missing skipDialog argument
	}

	onIscoPressed(isco) {
		this.showGotoDialog(this.t("db_isco-level-4") + ", " + isco.label, () => {
			this.switchAndSelect(Constants.DISPLAY_TYPE_WORK_ISCO, 1, "isco_code", isco.code, this.showIsco.bind(this))
		}, false) // Add missing skipDialog argument
	}

	onFieldPressed(field) {
		this.showGotoDialog(this.t("db_occupation-field") + ", " + field.label, () => {
			this.switchAndSelect(Constants.DISPLAY_TYPE_WORK_SSYK, Constants.DISPLAY_WORK_TYPE_GROUP, "id", field.id, this.showFields.bind(this))
		}, false) // Add missing skipDialog argument
	}

	onOtherPressed(item, skipDialog) {
		if (item.type == "skill" || item.type == "skill-headline") {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_SKILL, 1, "id", item.id, this.showSkills.bind(this))
			}, skipDialog)

		} else if (item.type == "skill-collection") {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_SKILL_COLLECTION, 1, "id", item.id, this.showSkillCollections.bind(this))
			}, skipDialog)
		} else if (item.type == "skill-group") {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_SKILL_COLLECTION, 1, "id", item.id, this.showGenericSkills.bind(this))
			}, skipDialog)
		} else if (item.type == "ssyk-level-4") {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_WORK_SSYK, 1, "id", item.id, this.showGroups.bind(this))
			}, skipDialog)
		} else if (item.type.startsWith("ssyk-level-")) {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_WORK_SSYK, Constants.DISPLAY_WORK_TYPE_STRUCTURE, "id", item.id, this.showStructure.bind(this))
			}, skipDialog)
		} else if (item.type == "isco-level-4") {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_WORK_ISCO, 1, "id", item.id, this.showIsco.bind(this))
			}, skipDialog)
		} else if (item.type.startsWith("occupation-")) {
			var isField = item.type != "occupation-name"
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_WORK_SSYK, isField ? Constants.DISPLAY_WORK_TYPE_FIELDS : Constants.DISPLAY_WORK_TYPE_GROUP, "id", item.id, isField ? this.showFields.bind(this) : this.showGroups.bind(this))
			}, skipDialog)
		} else if (item.type == "keyword") {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_SEARCH, 1, "id", item.id, this.showKeyword.bind(this))
			}, skipDialog)
		} else if (item.type == "job-title") {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_JOB_TITLE, 1, "id", item.id, this.showJobTitles.bind(this))
			}, skipDialog)
		} else if (item.type == "employment_duration" ||
			item.type == "employment_type" ||
			item.type == "wage_type" ||
			item.type == "worktime_extent" ||
			item.type == "occupation_experience_year") {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_WORK_DESC, 1, "id", item.id, this.showOccupationDesc.bind(this))
			}, skipDialog)
		} else if (item.type.startsWith("sni-")) {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_INDUSTRY, 1, "id", item.id, this.showIndustry.bind(this))
			}, skipDialog)
		} else if (item.type == "language" ||
			item.type == "language-level") {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_LANGUAGE, 1, "id", item.id, this.showLanguage.bind(this))
			}, skipDialog)
		} else if (item.type == "continent" ||
			item.type == "country" ||
			item.type == "region" ||
			item.type == "municipality") {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_GEOGRAPHY, 1, "id", item.id, this.showGeography.bind(this))
			}, skipDialog)
		} else if (item.type.startsWith("sun-education-")) {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_EDUCATION, 1, "id", item.id, this.showEducation.bind(this))
			}, skipDialog)
		} else if (item.type == "swedish-retail-and-wholesale-council-skill") {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_SWE_SKILL, 1, "id", item.id, this.showSweSkills.bind(this))
			}, skipDialog)
		} else if (item.type == "esco-occupation") {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_ESCO_OCCUPATION, 1, "id", item.id, this.showEscoOccupation.bind(this))
			}, skipDialog)
		} else if (item.type == "esco-skill") {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_ESCO_SKILL, 1, "id", item.id, this.showEscoSkill.bind(this))
			}, skipDialog)
		} else if (item.type == "forecast-occupation") {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_FORECAST_OCCUPATION, 1, "id", item.id, this.showForecast.bind(this))
			}, skipDialog)
		} else if (item.type == "barometer-occupation") {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_BAROMETER_OCCUPATION, 1, "id", item.id, this.showBarometerOccupation.bind(this))
			}, skipDialog)
		} else {
			this.showGotoDialog(this.t("db_" + item.type) + ", " + item.label, () => {
				this.switchAndSelect(Constants.DISPLAY_TYPE_OTHER, 1, "id", item.id, this.showOther.bind(this))
			}, skipDialog)
		}
	}

	onShowPopup(data: { text: string; showSpinner: boolean } | string) { // Add type annotation for data
		var indicator = document.getElementById("save_indicator")
		if (!indicator) return; // Add null check
		indicator.classList.add("save_enter_margin")
		if (data instanceof Object) {
			this.setState({
				popupText: data.text,
				popupSpinner: data.showSpinner,
			})
		} else {
			this.setState({
				popupText: data,
				popupSpinner: true,
			})
		}
	}

	onHidePopup() {
		var indicator = document.getElementById("save_indicator")
		if (!indicator) return; // Add null check
		indicator.classList.remove("save_enter_margin")
	}

	switchAndSelect(type, radio, key, value, showMethod) {
		EventDispatcher.fire(Constants.EVENT_TAXONOMY_SET_SEARCH_TYPE, {
			type: type,
			radio: radio, //isFields ? Constants.DISPLAY_WORK_TYPE_FIELDS : Constants.DISPLAY_WORK_TYPE_GROUP
		})
		this.preSelectType = {
			key: key,
			value: value,
		}
		this.setState({ isFetchingItem: true })
		showMethod()
	}

	onPreSelect(item) {
		if (this.preSelectType) {
			if (this.preSelectType.key == "ssyk_code") {
				return item.ssyk_code && item.ssyk_code.code == this.preSelectType.value
			} else if (this.preSelectType.key == "isco_code") {
				return item.isco_code && item.isco_code.code == this.preSelectType.value
			}
			return item[this.preSelectType.key] == this.preSelectType.value
		}
		return false
	}

	renderDialog() {
		if (this.state.dialog) {
			return this.state.dialog
		}
	}

	render() {
		return (
			<div className="taxonomy_page">
				{/* Header is now rendered by MainLayout */}
				{/* Removed TreeViewPanel and page_content wrapper */}
				{/* Render Start or Content directly within taxonomy_page */}
				<div className="w-full p-4"> {/* Add padding and ensure full width */}
					{
					this.state.selected == null ?
						(this.state.isLoading || this.state.isFetchingItem ? // Show loader if loading initial data or fetching item
							<div className="flex justify-center items-center h-64"><Loader /></div> :
							// Render Start component if nothing is selected and not loading
							<Start />
						) :
						// Render Content if an item is selected
						<Content
							ssykCallback={this.onSsykPressed.bind(this)}
							iscoCallback={this.onIscoPressed.bind(this)}
							fieldCallback={this.onFieldPressed.bind(this)}
							otherCallback={this.onOtherPressed.bind(this)}
							isFetchingItem={this.state.isFetchingItem}
							item={this.state.selected} />
					}
					{this.renderDialog()}
				</div>
				{/* Save indicator remains outside the main content flow */}
				<div className="save_indicator_content">
					<div
						id="save_indicator"
						className="save_indicator font">
						{this.state.popupSpinner ?? <div className="loader" />}
						<div>{this.state.popupText}</div>
					</div>
				</div>
			</div>
		)
	}
}

// Update the wrapper component to pass props correctly
export default (props: Omit<TaxonomyProps, 'params' | 't'>) => { // Omit props provided by hooks
	const params = useParams();
	const translation = useTranslation();
	return (
		<Taxonomy {...props} params={params} t={translation} />
)}