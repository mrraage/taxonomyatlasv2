import React from "react"
import { useTranslation } from "react-i18next"

// setupRelationItem(data) {
//     var relation = data.relation
//     var from = this.t("db_" + relation.source.type)
//     var to = this.t("db_" + relation.target.type)
//     return {
//         type: ItemType.RELATION,
//         data: data,
//         displayType: this.t("db_" + relation.source.type),
//         displayAction: this.t("relation") + " " + this.t(data["event-type"]).toLowerCase(),
//         displayLabel: relation.source.preferredLabel,
//         displayFrom: from,
//         displayTo: to,
//         displayRelationType: relation["relation-type"],
//         displayDate: "",
//     }
// }
// <div 
//     key={index}
//     className={"version_list_item " + (isSelected ? "version_list_item_selected" : "")}
//     onPointerUp={this.onItemClicked.bind(this, item)}>
//     {renderItem(item.displayType)}
//     {renderItem(item.displayAction)}
//     {renderItem(item.displayLabel)}
//     {renderItem(item.displayFrom)}
//     {renderItem(item.displayTo)}
//     {renderItem(item.displayRelationType)}
// </div>
// const renderItem = (value) => {
//     return ( <div title={value}>{value}</div> )

export default function RelationChangeItem({ item }) {
    const {t} = useTranslation()
    console.log(`RelationChangeItem`)
    console.dir(item)

    const displayType = t("db_" + item["latest-version-of-concept"].type)
    const displayAction = t("relation") + " " + t(item.data["event-type"]).toLowerCase()
    const displayLabel = item.relation.source.preferredLabel
    const displayFrom = t("db_" + item.relation.source.type)
    const displayTo = t("db_" + item.relation.target.type)
    const displayRelationType = item.relation["relation-type"]

    return (
      <>
        <td title={displayType}>{displayType}</td>
        <td title={displayAction}>{displayAction}</td>
        <td title={displayLabel}>{displayLabel}</td>
        <td title={displayFrom}>{displayFrom}</td>
        <td title={displayTo}>{displayTo}</td>
        <td title={displayRelationType}>{displayRelationType}</td>
      </>
    )
}