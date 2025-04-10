import React from "react"
import Header from "../components/header.tsx"
import Rest from "../context/rest.ts"
import Constants from "../context/constants.ts"
import Util from "../taxonomy/util.tsx"
import TreeView from "../components/treeview.tsx"
import EventDispatcher from "../context/event_dispatcher.tsx"
import { DataSet, Network } from "vis-network/standalone/esm/vis-network"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router"

class Explore extends React.Component {
    t: any
    util: Util
    state: { nodes: any[]; edges: any[]; selected: any; items: any[]; isLoading: boolean }
    options: { configure: { enabled: boolean; showButton: boolean }; interaction: { hover: boolean }; manipulation: { enabled: boolean }; layout: { hierarchical: boolean }; edges: { color: string; smooth: { forceDirection: string } }; nodes: { shape: string; size: number; margin: number; font: { size: number; color: string; strokeWidth: number; strokeColor: string }; widthConstraint: { maximum: number } }; groups: { notFetched: { color: { background: string } } }; physics: { forceAtlas2Based: { avoidOverlap: number }; solver: string; maxVelocity: number; minVelocity: number; timestep: number } }
    boundElementSelected: any
    edges: any
    nodes: any
    network: Network
    preSelectId: any

    constructor(props) {
        super(props)
        this.t = this.props.t.t
        this.util = new Util(this.t)
        this.state = {
            nodes: [],
            edges: [],
            selected: null,
            items: [],
            isLoading: false,
        }
        // variables
        this.options = {
            configure: {
                enabled: false,
                showButton: false,
            },
            interaction: {
                hover: true
            },
            manipulation: {
                enabled: false
            },
            layout: {
                hierarchical: false
            },
            edges: {
                color: "#666",
                smooth: {
                    "forceDirection": "none"
                }
            },
            nodes: {
                shape: "dot",
                size: 16,
                margin: 5,
                font: {
                    size: 16,
                    color: "#000",
                    strokeWidth: 1,
                    strokeColor: "#fff",
                },
                widthConstraint: {
                    maximum: 200
                }
            },
            groups: {
                notFetched: {
                    color: {
                        background: "#fff"
                    }
                }
            },
            physics: {
                forceAtlas2Based: {
                    avoidOverlap: 0.41
                },
                solver: "forceAtlas2Based",
                maxVelocity: 146,
                minVelocity: 0.75,
                timestep: 0.42
            }
        }
        // callbacks
        this.boundElementSelected = this.onElementSelected.bind(this)
    }

    componentDidMount() {
        EventDispatcher.add(this.forceUpdate.bind(this), Constants.EVENT_LANGUAGE_CHANGED)
        this.edges = new DataSet(this.state.edges)
        this.nodes = new DataSet(this.state.nodes)
        var container = document.getElementById("vis_network_id")
        if (container == null) {
            return
        }
        this.network = new Network(container, { edges: this.edges, nodes: this.nodes }, this.options)
        this.setTreeViewData()
    }

    async setTreeViewData() {
        this.setState({ isLoading: true })
        var data = await this.util.getSsykStructureMini()
        this.setState({
            items: data,
            isLoading: false,
        }, () => {
            if (this.state.items.length > 0) {
                this.onItemClicked(this.state.items[0])
                this.state.items[0].isExpanded = false
                this.preSelectId = this.state.items[0].id
            }
        })
    }

    async getConcept(id, onComplete) {
        var versionName = Constants.getArg("v")
        var version = versionName != null ? ", version: \"" + versionName + "\"" : ""
        var query =
            "query Atlas {" +
            "concepts(id: \"" + id + "\"" + version + ") {" +
            "type id preferredLabel:preferred_label " +
            "narrower {" +
            "type id preferredLabel:preferred_label " +
            "}" +
            "broader {" +
            "type id preferredLabel:preferred_label " +
            "}" +
            "}" +
            "}"
        var structure = await Rest.awaitGraphQl(query)
        if (structure != null) {
            onComplete(structure.data.concepts)
        }
    }

    onItemClicked(item) {
        this.preSelectId = null
        if (item != this.state.selected) {
            this.getConcept(item.id, (data) => {
                this.onItemSelected(data[0])
            })
        }
        if (item.isExpanded != null) {
            item.isExpanded = !item.isExpanded
            this.forceUpdate()
        }
    }

    onElementSelected(event) {
        var x = event.pointer.canvas.x
        var y = event.pointer.canvas.y
        if (event.event.tapCount == 1) {
            if (event.nodes.length > 0) {
                this.updateRelations(this.findNodeById(event.nodes[0]), x, y)
            }
        } else if (event.event.tapCount == 2) {
            if (event.nodes.length > 0) {
                var nodeId = event.nodes[0]
                for (var i = 0; i < this.state.edges.length; ++i) {
                    var edge = this.state.edges[i]
                    if (edge.from === nodeId) {
                        this.updateRelations(this.findNodeById(edge.to), x, y)
                    } else if (edge.to === nodeId) {
                        this.updateRelations(this.findNodeById(edge.from), x, y)
                    }
                }
            }
        }
    }

    findNodeById(id) {
        return this.state.nodes.find((n) => {
            return n.id === id
        })
    }

    getGroupFor(type) {
        switch (type) {
            case "continent":
                return 1
            case "country":
                return 2
            case "driving-licence":
                return 3
            case "driving-licence-combination":
                return 4
            case "employment-duration":
                return 5
            case "employment-type":
                return 6
            case "isco-level-1":
            case "isco-level-4":
                return 7
            case "keyword":
                return 8
            case "language":
                return 9
            case "language-level":
                return 10
            case "municipality":
                return 11
            case "occupation-collection":
                return 12
            case "occupation-field":
                return 13
            case "occupation-name":
                return 14
            case "region":
                return 15
            case "skill":
            case "skill-headline":
                return 16
            case "sni-level-1":
            case "sni-level-2":
                return 17
            case "ssyk-level-1":
                return 23
            case "ssyk-level-2":
                return 24
            case "ssyk-level-3":
                return 25
            case "ssyk-level-4":
                return 18
            case "sun-education-field-1":
            case "sun-education-field-2":
            case "sun-education-field-3":
            case "sun-education-field-4":
                return 19
            case "sun-education-level-1":
            case "sun-education-level-2":
            case "sun-education-level-3":
                return 20
            case "wage-type":
                return 21
            case "worktime-extent":
                return 22
            default:
                return 0
        }
    }

    getRelations(id, relations, x, y) {
        var nodes = []
        var edges = []
        for (var i = 0; i < relations.length; ++i) {
            var p = relations[i]
            p.title = this.t("db_" + p.type) + "<br \>" + p.preferredLabel
            p.group = "notFetched"
            p.x = x
            p.y = y
            if (!this.findNodeById(p.id)) {
                nodes.push(p)
                edges.push({
                    from: id,
                    to: p.id,
                })
            }
        }
        this.nodes.add(nodes)
        this.edges.add(edges)
        this.state.nodes.push(...nodes)
        this.state.edges.push(...edges)
        this.setState({ data: this.state.data })
    }

    updateRelations(item, x, y) {
        if (!item) {
            return
        }
        if (item.fetchedRelations) {
            return
        }
        if (item.broader == null || item.narrower == null) {
            this.getConcept(item.id, (data) => {
                item.broader = data[0].broader
                item.narrower = data[0].narrower
                this.updateRelations(item, x, y)
            })
        } else {
            item.fetchedRelations = true
            item.label = item.preferredLabel ? item.preferredLabel : item.label
            item.title = this.t("db_" + item.type)
            item.group = this.getGroupFor(item.type)
            item.x = undefined
            item.y = undefined
            this.nodes.update([item])
            if (item.broader.length > 0) {
                this.getRelations(item.id, item.broader, x, y)
            }
            if (item.narrower.length > 0) {
                this.getRelations(item.id, item.narrower, x, y)
            }
        }
    }

    onItemSelected(item) {
        var cpy = JSON.parse(JSON.stringify(item))
        //var cpy = item
        var nodes = []
        var edges = []
        cpy.title = this.t("db_" + cpy.type)
        cpy.group = this.getGroupFor(cpy.type)
        nodes.push(cpy)
        this.edges.clear()
        this.edges.add(edges)
        this.nodes.clear()
        this.nodes.add(nodes)
        this.setState({
            nodes: nodes,
            edges: edges,
            selected: item,
        }, () => {
            this.updateRelations(cpy, 0, 0)
        })
    }

    onPreSelect(item) {
        return this.preSelectId == item.id
    }

    render() {
        if (this.network) {
            this.network.off("select", this.boundElementSelected)
            this.network.on("select", this.boundElementSelected)
        }
        return (
            <div className="flex flex-col h-full">
                <Header />
                <div className="flex flex-row h-full">
                    <TreeView
                        preSelectCallback={this.onPreSelect.bind(this)}
                        isLoading={this.state.isLoading}
                        roots={this.state.items}
                        onClick={this.onItemClicked.bind(this)} />
                    <div className="flex flex-col w-full">
                        <div className="">
                            <div className="pb-2">{this.t("node_indepth_description")}</div>
                            <div>{this.t("node_tip_1")}</div>
                            <div>{this.t("node_tip_2")}</div>
                            <div>{this.t("node_tip_3")}</div>
                        </div>
                        <div id="vis_network_id" className="h-full m-2 bg-neutral-100" />
                    </div>
                </div>
            </div>
        )
    }
}

export default (props) => {
    const { t } = useTranslation()
    return (
        <Explore {...props} params={useParams()} t={useTranslation()} />
    )
}