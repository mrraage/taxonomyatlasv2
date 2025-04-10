import React from "react"
import Header from "../components/header.tsx"
import Loader from "../components/loader.tsx"
import Constants from "../context/constants.ts"
import EventDispatcher from "../context/event_dispatcher.tsx"
import Rest from "../context/rest.ts"
import {sortByKey} from "../context/util.ts"
import "./app.css"
import "./version.css"
import { useTranslation } from "react-i18next"

class Version extends React.Component {
    SORT_TYPE: number
    SORT_ACTION: number
    SORT_NAME: number
    SORT_FROM: number
    SORT_TO: number
    SORT_RELATION_TYPE: number
    SORT_DATE: number
    ITEM_TYPE_CONCEPT: number
    ITEM_TYPE_RELATION: number 
    t: any

	constructor(props) {
        super(props)
        this.t = this.props.t.t
        // constants
        this.SORT_TYPE = 0
        this.SORT_ACTION = 1
        this.SORT_NAME = 2
        this.SORT_FROM = 3
        this.SORT_TO = 4
        this.SORT_RELATION_TYPE = 5
        this.SORT_DATE = 6
        this.ITEM_TYPE_CONCEPT = 0
        this.ITEM_TYPE_RELATION = 1
		// state
        this.state = {
            isLoading: false,
            isShowingInfo: false,
            filter: "",
            version: 0,
            versions: [],
            items: [],
            displayItems: [],
            sortType: this.SORT_RELATION_TYPE,
            sortDirection: true,
            selected: null,
		}
	}
	
	componentDidMount() {
        EventDispatcher.add(this.forceUpdate.bind(this), Constants.EVENT_LANGUAGE_CHANGED)
        Rest.getVersions((data) => {
            this.setState({versions: data})
            this.onVersionChanged({
                target: {
                    value: data[data.length - 1].version,
                }
            })
        }, console.log)
    }

    sortData(data) {
        var key = null
        switch(this.state.sortType) {
            case this.SORT_TYPE:
                key = "displayType"
                break
            case this.SORT_ACTION:
                key = "displayAction"
                break
            case this.SORT_NAME:
                key = "displayLabel"
                break
            case this.SORT_FROM:
                key = "displayFrom"
                break
            case this.SORT_TO:
                key = "displayTo"
                break
            case this.SORT_RELATION_TYPE:
                key = "displayRelationType"
                break
            case this.SORT_DATE:
                key = "displayDate"
                break
        }
        return sortByKey(data, key, this.state.sortDirection)
    }

    filterData(data, filter) {
        var items = data
        if(filter.length > 0) {
            items = []
            for(var i=0; i<data.length; ++i) {
                var source = data[i]
                var latest = source.data["latest-version-of-concept"]
                var id = latest ? latest.id.toLowerCase() : ""
                var type = source.displayType.toLowerCase()
                var action = source.displayAction.toLowerCase()
                var label = source.displayLabel.toLowerCase()
                var from = source.displayFrom.toLowerCase()
                var to = source.displayTo.toLowerCase()
                var relation = source.displayRelationType.toLowerCase()
                if(type.indexOf(filter) != -1 || 
                    action.indexOf(filter) != -1 ||
                    label.indexOf(filter) != -1 ||
                    from.indexOf(filter) != -1 ||
                    to.indexOf(filter) != -1 ||
                    relation.indexOf(filter) != -1 ||
                    id.indexOf(filter) != -1 ||
                    source.displayDate.indexOf(filter) != -1) {
                    items.push(source)
                }
            }
        }
        return items
    }

    setupConceptItem(data) {
        var eventType = data["event-type"]
        var action = this.t(eventType)
        var label = ""
        var type = ""
        var from = ""
        var to = ""
        var changes = data["concept-attribute-changes"]
        if(changes && changes.length == 1) {
            if(changes[0].attribute == "deprecated") {
                action = this.t("concept_reactivated")
            } else {
                action = this.t(changes[0].attribute) + " " + this.t(eventType).toLowerCase()
            }
            from = "" + changes[0]["old-value"]
            to = "" + changes[0]["new-value"]
        } else {
            action = this.t("concept") + " " + this.t(eventType).toLowerCase()
        }
        var concept = data["latest-version-of-concept"]
        label = concept.preferredLabel
        type = this.t("db_" + concept.type)
        if(from == null) {
            from = ""
        }
        if(to == null) {
            to = ""
        }
        return {
            type: this.ITEM_TYPE_CONCEPT,
            data: data,
            displayType: type,
            displayAction: action,
            displayLabel: label,
            displayFrom: from,
            displayTo: to,
            displayRelationType: "",
            displayDate: "",
        }
    }

    setupRelationItme(data) {
        var relation = data.relation
        var from = this.t("db_" + relation.source.type)
        var to = this.t("db_" + relation.target.type)
        return {
            type: this.ITEM_TYPE_RELATION,
            data: data,
            displayType: this.t("db_" + relation.source.type),
            displayAction: this.t("relation") + " " + this.t(data["event-type"]).toLowerCase(),
            displayLabel: relation.source.preferredLabel,
            displayFrom: from,
            displayTo: to,
            displayRelationType: relation["relation-type"],
            displayDate: "",
        }
    }

    onVersionChanged(e) {
        this.setState({
            isLoading: true,
            version: e.target.value,
        })
        var value = parseInt(e.target.value)
        Rest.getConceptChanges(value - 1, value, (conceptData) => {
            var items = []
            // process data
            for(var i=0; i<conceptData.length; ++i) {
                items.push(this.setupConceptItem(conceptData[i]))
            }
            // relations
            Rest.getRelationChanges(value - 1, value, (relationData) => {
                for(var i=0; i<relationData.length; ++i) {
                    items.push(this.setupRelationItme(relationData[i]))
                }
                this.setState({
                    items: items,
                    displayItems: items,
                    isLoading: false
                })
            })
        })
    }

    onFilterChanged(e) {
        this.setState({
            filter: e.target.value,
            displayItems: this.filterData(this.state.items, e.target.value.toLowerCase()),
        })
    }

    onListHeaderClicked(sortType) {
        this.setState({
            sortType: sortType,
            sortDirection: sortType == this.state.sortType ? !this.state.sortDirection : true
        }, () => {
            var sorted = this.sortData(this.state.items)
            this.setState({
                items: sorted,
                displayItems: this.filterData(sorted, this.state.filter.toLowerCase()),
            })
        })
    }

    onItemClicked(item) {
        this.setState({selected: item})
    }

    onShowClicked() {
        this.setState({isShowingInfo: this.state.selected != null})
    }

    onCloseClicked() {
        this.setState({
            isShowingInfo: false,
            selected: null,
        })
    }

    renderButton(text, callback) {
        return (
            <div 
                className="button font"
                onPointerUp={callback}>
                {this.t(text)}
            </div>
        )
    }

    renderInfoDialog() {
        if(this.state.isShowingInfo && this.state.selected) {
            var item = this.state.selected
            var items = []
            // add items
            if(item.type == this.ITEM_TYPE_CONCEPT) {
                var data = item.data
                var concept = data["latest-version-of-concept"]
                items.push({name: this.t("action_type") + ":", value: item.displayAction})
                if(concept) {
                    items.push({name: this.t("name") + ":", value: concept.preferredLabel})
                    items.push({name: this.t("definition") + ":", value: concept.definition})
                    items.push({name: this.t("id") + ":", value: concept.id})
                    items.push({name: this.t("type") + ":", value: this.t("db_" + concept.type)})
                }
                var changes = data["concept-attribute-changes"]
                if(changes) {
                    if(changes.length == 1) {
                        // single attribute change
                        var from = changes[0]["old-value"] != null ? "" + changes[0]["old-value"] : ""
                        var to = changes[0]["new-value"] != null ? "" + changes[0]["new-value"] : ""
                        items.push({name: this.t("from") + ":", value: from})
                        items.push({name: this.t("to") + ":", value: to})
                    } else {
                        // multiple attribute changes
                        for(var i=0; i<changes.length; ++i) {
                            if(changes[i].attribute != "description") {
                                var name = this.t(changes[i].attribute).toLowerCase()
                                var from = changes[i]["old-value"] != null ? "" + changes[i]["old-value"] : ""
                                var to = changes[i]["new-value"] != null ? "" + changes[i]["new-value"] : ""
                                items.push({name: this.t("from") + " " + name + ":", value: from})
                                items.push({name: this.t("to") + " " + name + ":", value: to})
                            }
                        }
                    }
                }
            } else {
                var data = item.data.relation
                items.push({name: this.t("action_type") + ":", value: item.displayAction})
                items.push({name: this.t("relation_type") + ":", value: data["relation-type"]})
                items.push({name: this.t("from") + ":", value: data.source.preferredLabel})
                items.push({name: this.t("to") + ":", value: data.target.preferredLabel})
                items.push({name: this.t("from_id") + ":", value: data.source.id})
                items.push({name: this.t("to_id") + ":", value: data.target.id})
                items.push({name: this.t("from_type") + ":", value: this.t("db_" + data.source.type)})
                items.push({name: this.t("to_type") + ":", value: this.t("db_" + data.target.type)})
            }
            // format items
            items = items.map((element, index) => {
                return (
                    <div 
                        key={index}
                        className="dialog_info_row">
                        <div className="dialog_info_title">{element.name}</div>
                        <div>{element.value}</div>
                    </div>
                )
            })
            return (
                <div className="dialog_base">
                    <div className="dialog_window">
                        <div className="dialog_window_content font">
                            <div>{this.t("version_info_title")}</div>
                            <div className="dialog_info_content">
                                {items}
                            </div>
                        </div>
                        {this.renderButton("close", this.onCloseClicked.bind(this))}
                    </div>
                </div>
            )
        }
    }

    renderHeaders() {
        var renderArrow = (type) => {
            if(type == this.state.sortType) {
                return (
                    <i className={this.state.sortDirection ? "down" : "up"}/>
                )
            }
        }
        var renderItem = (text, type) => {
            return (
                <div 
                    className="version_list_item_header"
                    onPointerUp={this.onListHeaderClicked.bind(this, type)}>
                    <div>{this.t(text)}</div>
                    {renderArrow(type)}
                </div>
            )
        }
        return (
            <div className="version_headers font">
                <div className="version_list_item version_list_header_container">
                    {renderItem("type", this.SORT_TYPE)}
                    {renderItem("action", this.SORT_ACTION)}
                    {renderItem("name", this.SORT_NAME)}
                    {renderItem("from", this.SORT_FROM)}
                    {renderItem("to", this.SORT_TO)}
                    {renderItem("relation_type", this.SORT_RELATION_TYPE)}
                </div>
            </div>
        )
    }

    renderItems() {
        var renderItem = (value) => {
            return ( <div title={value}>{value}</div> )
        }
        var items = this.state.displayItems.map((item, index) => {
            var isSelected = this.state.selected == item
            return (
                <div 
                    key={index}
                    className={"version_list_item " + (isSelected ? "version_list_item_selected" : "")}
                    onPointerUp={this.onItemClicked.bind(this, item)}>
                    {renderItem(item.displayType)}
                    {renderItem(item.displayAction)}
                    {renderItem(item.displayLabel)}
                    {renderItem(item.displayFrom)}
                    {renderItem(item.displayTo)}
                    {renderItem(item.displayRelationType)}
                </div>
            )
        })
        return (
            <div className="version_items font">
                {this.renderLoader()}
                {items}
            </div>
        )
    }

    renderChanges() {
        return (
            <div className="changes_container">
                <div className="font">
                    {this.t("changes")}
                </div>
                {this.renderHeaders()}
				{this.renderItems()}
                <div className="version_list_divider"/>
            </div>
        )
    }

    renderLoader() {
        if(this.state.isLoading) {
            return ( <Loader/> )
        }
    }

    renderSelector() {
        var versions = this.state.versions.map((item, index) => {
            return (
                <option key={index} value={item.version}>
                    {this.t("version")} {item.version}: {new Date(item.timestamp).toLocaleString()}
                </option>
            )
        })
        return (
            <div className="version_selector">
                <select
                    value={this.state.version}
                    onChange={this.onVersionChanged.bind(this)}>
                    {versions}
                </select>
                <input 
                    placeholder={this.t("filter") + "..."}
                    value={this.state.filter}
                    onChange={this.onFilterChanged.bind(this)}/>
            </div>
        )
    }

    render() {
        return (
            <div className="versions_page">
                <Header/>
				<div className="page_content">
                    {this.renderSelector()}
                    {this.renderChanges()}
                    <div className="button_container">
                        {this.renderButton("show_info", this.onShowClicked.bind(this))}
                    </div>
                    {this.renderInfoDialog()}
				</div>
            </div>
        )
    }
	
}

export default (props) => {
    return (<Version {...props} t={useTranslation()} />)
}