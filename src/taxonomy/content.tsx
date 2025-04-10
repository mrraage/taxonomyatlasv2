import React from "react"
import TreeView from "../components/treeview.js"
import {sortByKey} from "../context/util.ts"
import Constants from "../context/constants.ts"
import EventDispatcher from "../context/event_dispatcher.tsx"
import Loader from "../components/loader.js"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router"

class Content extends React.Component {
	t: any 

	constructor(props) {
        super(props)
				this.t = this.props.t.t
		// state
        this.state = {
			item: props.item,
			isFetchingItem: props.isFetchingItem,
			isInfoExpanded: false,
			isShowingRelated: false,
		}
		this.boundMouseDown = this.onMouseDown.bind(this)
	}
	
	componentDidMount() {
        document.addEventListener("mousedown", this.boundMouseDown, false)
	}

	componentWillUnmount() {
		document.removeEventListener("mousedown", this.boundMouseDown)
	}

	UNSAFE_componentWillReceiveProps(props) {
        this.setState({
			item: props.item,
			isFetchingItem: props.isFetchingItem,
			isInfoExpanded: props.item != this.state.item ? false : this.state.isInfoExpanded,
		})
	}

	isOccupationName() {
		var item = this.state.item
		var parent = item.parent
		return item.type == "occupation-name" && parent && parent.type && parent.type.startsWith("ssyk")
	}
	
    onMouseDown(e) {
		if(e.offsetX < e.target.clientWidth) {
			if(this.state.isShowingRelated) {
				this.setState({
					isShowingRelated: false
				})
			}
		}
	}
	
	onSsykPressed(code) {
		this.props.ssykCallback(code)
	}
	
	onIscoPressed(code) {
		this.props.iscoCallback(code)
	}
	
	onFieldPressed(id) {
		this.props.fieldCallback(id)
	}

	onItemClicked(item) {
		if(item.children == null) {
			this.props.otherCallback(item)
		}
		if(item.isExpanded != null) {
			item.isExpanded = !item.isExpanded
		}
	}

	onShowInfoRelatedClicked() {
		this.setState({isShowingRelated: true})
	}

	onToggleInfoPressed() {
		this.setState({isInfoExpanded: !this.state.isInfoExpanded})
	}

	renderHeader() {
		var item = this.state.item
		var label = item.label
		var parent = item.parent
		if(this.isOccupationName()) {
			var parentLabel = parent.ssyk_code.code + " - " + parent.label
			label = (
				<span>
					<b>{label}</b> {this.t("belongs_to_occupation").toLowerCase()} <b>{parentLabel}</b>
				</span>
			)
		} else {
			label = ( <b>{label}</b> )
		}
		return (
			<div className="content_header rounded font">
				<h1 className="header_name">
					{label}
				</h1>
			</div>
		)
	}

	renderCode(code, title, key, callback) {
		return (
			<div 
				className="info_code rounded" 
				key={key}
				title={title}
				onPointerUp={callback}>
				{code}
			</div>
		)
	}
	
	getAsString(list) {
        var s = ""
        if(list.length > 0) {
            s = list[0]
            for(var i=1; i<list.length; ++i) {
                s += ", " + list[i]
            }
        }
        return s
	}

	copyToClipboard(data) {
		var onSuccess = () => {
			EventDispatcher.fire(Constants.EVENT_SHOW_POPUP_INDICATOR, {
				text: this.t("clipboard_update_success"),
				showSpinner: true,
			})
			setTimeout(() => {
				EventDispatcher.fire(Constants.EVENT_HIDE_POPUP_INDICATOR)
			}, 3500)
		}
		var onFailure = () => {
			EventDispatcher.fire(Constants.EVENT_SHOW_POPUP_INDICATOR, {
				text: this.t("clipboard_update_failure"),
				showSpinner: true,
			})
			setTimeout(() => {
				EventDispatcher.fire(Constants.EVENT_HIDE_POPUP_INDICATOR)
			}, 3500)
		}
		var fallbackCopyTextToClipboard = (text) => {
			var textArea = document.createElement("textarea")
			textArea.value = text
			textArea.style.top = "0"
			textArea.style.left = "0"
			textArea.style.position = "fixed"
			document.body.appendChild(textArea)
			textArea.focus()
			textArea.select()
			try {
				var successful = document.execCommand("copy")
				if(successful) {
					onSuccess()
				} else {
					onFailure()
				}
			} catch (err) {
				onFailure()
			}
			document.body.removeChild(textArea)
		}
		if (!navigator.clipboard) {
            fallbackCopyTextToClipboard(data)
        } else {
            navigator.clipboard.writeText(data).then(onSuccess, onFailure)
        }
	}

	renderInfo() {
		var item = this.state.item
		var parent = item.parent
		var name = item.label
		var key = 0
		var codes = []
		var infoLine = (text, value) => {
			return (
				<div className="info_codes" key={key++}>
					<div>{text}:</div>
					<div className="info_value">{value}</div>
				</div>
			)
		}
		var keyProperties = [
			{ key: "iso_639_3_alpha_2_2007", text: this.t("iso_639_3_alpha_2_2007") },
			{ key: "iso_639_3_alpha_3_2007", text: this.t("iso_639_3_alpha_3_2007") },
			{ key: "nuts_level_3_code_2013", text: this.t("nuts_level_3_code_2013") },
			{ key: "nuts_level_3_code_2021", text: this.t("nuts_level_3_code_2021") },
			{ key: "national_nuts_level_3_code_2019", text: this.t("national_nuts_level_3_code_2019") },
			{ key: "lau_2_code_2015", text: this.t("lau_2_code_2015") },
			{ key: "sun_education_field_code_2020", text: this.t("sun_education_field_code_2020") },
			{ key: "sun_education_level_code_2020", text: this.t("sun_education_level_code_2020") },
			{ key: "sni_level_code_2007", text: this.t("sni_level_code_2007") },
		]
		// name
		if(this.isOccupationName()) {
			name = (
				<span>
					{this.t("about")} {this.t("db_" + item.type).toLowerCase()} <b>{item.label}</b>
				</span>
			)
		} else {
			name = ( <b>{name}</b> )
		}
		// info
		codes.push(infoLine(this.t("concept_type"), this.t("db_" + item.type)))
		codes.push(infoLine("Concept-ID", item.id))
		if(item.alternativeLabels != null && item.alternativeLabels.length > 0) {
			codes.push(infoLine(this.t("alternativeLabels"), this.getAsString(item.alternativeLabels)))
		}
		for(var i=0; i<keyProperties.length; ++i) {
			if(item[keyProperties[i].key]) {
				codes.push(infoLine(keyProperties[i].text, item[keyProperties[i].key]))
			}
		}
		// clickable goto links
		if(item.ssyk_codes) {
			var ssykCodes = item.ssyk_codes.map((code, index) => {
				return this.renderCode(code.code, code.label, index, this.onSsykPressed.bind(this, code))
			})
			codes.push(
				<div className="info_codes" key={key++}>
					<div>{this.t("ssyk_code")}:</div>
					{ssykCodes}
				</div>
			)
		} else if(item.ssyk_code) {
			codes.push(
				<div className="info_codes" key={key++}>
					<div>{this.t("ssyk_code")}:</div>
					{this.renderCode(item.ssyk_code.code, item.ssyk_code.label, 0, this.onSsykPressed.bind(this, item.ssyk_code))}
				</div>
			)
		}
		if(item.isco_codes && item.isco_codes.length > 0) {
			codes.push(
				<div className="info_codes" key={key++}>
					<div>{this.t("isco_code")}:</div>
					<div>
						{item.isco_codes.map((element, index) => {
							return this.renderCode(element.code, element.label, index, this.onIscoPressed.bind(this, element))
						})}
					</div>
				</div>
			)
		}
		if(item.field) {
			codes.push(
				<div className="info_codes" key={key++}>
					<div>{this.t("occupation_field")}:</div>
					{this.renderCode(item.field.label, null, 0, this.onFieldPressed.bind(this, item.field))}
				</div>
			)
		}
		if(item.uri) {
			codes.push(
				<div className="info_codes" key={key++}>
					<div>URI:</div>
					<div
						className="uri" 
						title={item.uri}
						onPointerUp={this.copyToClipboard.bind(this, item.uri)}>
						{item.uri}
					</div>
				</div>
			)
		}
		if(item.esco_uri) {
			codes.push(
				<div className="info_codes" key={key++}>
					<div>ESCO URI:</div>
					<div
						className="uri" 
						title={item.esco_uri}
						onPointerUp={this.copyToClipboard.bind(this, item.esco_uri)}>
						{item.esco_uri}
					</div>
				</div>
			)
		}
		return (
			<div className="content_info rounded">
				<div className="content_info_header">
					<h1>{name}</h1>
					<div 
						className="content_info_toggle"
						onPointerUp={this.onToggleInfoPressed.bind(this)}>
						<div>{this.t("more_info")}</div>
                        <i className={this.state.isInfoExpanded ? "up" : "down"}/>
					</div>
				</div>
				{this.state.isInfoExpanded == true &&
					<div className="content_info_extended">
						{codes}
					</div>
				}
			</div>
		)
	}

	renderDefinition() {
		var item = this.state.item
		var parent = item.parent
		if(this.isOccupationName()) {
			var skills = item.relation_list ? item.relation_list : []
			skills = skills.find((x) => {
				return x.name == "taxonomy_item_skills"
			})
			return (
				<div className="content_definition">
					<h3 className="content_margin_top">{this.t("occupation_definition")}</h3>
					<div className="content_definition_text">{parent.definition}</div>
					{skills != null &&
						<div className="relation_collection">
							<h3 className="rounded">
								{this.t(skills.name)}
							</h3>
							<TreeView 
								roots={sortByKey(skills.list, "label", true)}
								highlight={false}
								onClick={this.onItemClicked.bind(this)}/>
						</div>
					}
				</div>
			)
		} else {
			var relations = item.relation_list ? item.relation_list : []
			relations = relations.map((element, i) => {
				if(element.name == "taxonomy_item_skills" || element.name == "taxonomy_item_skill_relations" || element.name == "taxonomy_item_skill_collections") {
					return (
						<div 
							key={i}
							className="relation_collection">
							<h3 className="rounded">
								{this.t(element.name)}
							</h3>
							<TreeView 
								roots={sortByKey(element.list, "label", true)}
								highlight={false}
								onClick={this.onItemClicked.bind(this)}/>
						</div>
					)
				}
			})
			return (
				<div className="content_definition">
					<h3 className="content_margin_top">{this.t("definition")}</h3>
					<div className="content_definition_text">{item.definition}</div>
					{relations}
				</div>
			)
		}
	}

	renderItem() {
		if(this.isOccupationName()) {
			return (
				<div className="content_item font">
					{this.renderDefinition()}
					{this.renderInfo()}
				</div>
			)
		} else {
			return (
				<div className="content_item font">
					{this.renderInfo()}
					{this.renderDefinition()}
				</div>
			)
		}
	}

	renderRelations() {
		var item = this.state.item
		var substitutes = null
		var relations = []
		var mappingRelations = []
		if(item.relation_list) {
			for(var i=0; i<item.relation_list.length; ++i) {
				var data = item.relation_list[i]
				if(data.name == "taxonomy_item_substitutes") {
					substitutes = sortByKey(data.list, "label", true)
				} else if(data.name != "taxonomy_item_skills" && data.name != "taxonomy_item_skill_relations" && data.name != "taxonomy_item_skill_collections") {
					if(data.list.length > 0) {
						relations.push({
							id: i,
							type: data.list[0].type,
							label: data.name,
							children: sortByKey(data.list, "label", true),
							isExpanded: false,
						})
					}
				}
			}	
		}
		if(item.mapping_relation_list) {
			var sortChildren = (element) => {
				if(element.children) {
					sortByKey(element.children, "label", true)
					element.children.forEach(sortChildren)
				}
			}
			mappingRelations = sortByKey(item.mapping_relation_list, "label", true)
			mappingRelations.forEach(sortChildren)
		}
		return (
			<div className="content_relations font">
				{substitutes != null &&
					<div className="relation_collection">
						<div className="relation_headline">
							<h3 className="rounded">
								{this.t("taxonomy_item_substitutes")}
							</h3>
							<div 
								className="relation_info"
								onPointerUp={this.onShowInfoRelatedClicked.bind(this)}>
								<div>?</div>
								{this.state.isShowingRelated &&
									<div className="relation_info_content">
										<b>{this.t("taxonomy_item_substitutes")}:</b>
										<div>{this.t("relation_info_related")}</div>
									</div>
								}
							</div>
						</div>
						<TreeView 
							roots={substitutes}
							highlight={false}
							onClick={this.onItemClicked.bind(this)}/>
					</div>
				}
				{relations.length > 0 &&
					<div className="relation_collection">
						<h3 className="rounded">
							{this.t("more_relations")}
						</h3>
						<TreeView 
							roots={relations}
							highlight={false}
							onClick={this.onItemClicked.bind(this)}/>
					</div>
				}
				{mappingRelations.length > 0 &&
					<div className="relation_collection">
						<h3 className="rounded">
							{this.t("mapping_relations")}
						</h3>
						<TreeView 
							roots={mappingRelations}
							highlight={false}
							onClick={this.onItemClicked.bind(this)}/>
					</div>
				}
			</div>
		)
	}

    render() {
		if(this.state.isFetchingItem) {
            return (
                <div className="content_stuff">
					<Loader/>
				</div>
            )
		} else if(this.state.item) {
            return (
                <div className="content_stuff">
					{this.isOccupationName() &&
						this.renderHeader()
					}
                    {this.renderItem()}
                    {this.renderRelations()}
                </div>
            )
        } else {
            return (
                <div className="content_stuff"/>
            )
        }
    }
	
}

export default (props) => {
	return (
	<Content {...props} params={useParams()} t={useTranslation()} />
)}