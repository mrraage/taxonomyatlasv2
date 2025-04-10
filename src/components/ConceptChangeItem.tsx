import React from "react"
import { useTranslation } from "react-i18next"

function itemDisplayAction(t, item) : string {
    const changes = item["concept-attribute-changes"]
    if(changes && changes.length == 1) {
        if(changes[0].attribute == "deprecated") {
            return t("concept_reactivated")
        } else {
            return t(changes[0].attribute) + " " + t(item["event-type"]).toLowerCase()
        }
    } else {
        return t("concept") +" " + t(item["event-type"]).toLowerCase()
    }
}

function itemDisplayFrom(item) : string {
    const changes = item["concept-attribute-changes"]
    if(changes && changes.length == 1) {
        return changes[0]["old-value"]
    } else {
        return ""
    }
}

function itemDisplayTo(item) : string {
    const changes = item["concept-attribute-changes"]
    if(changes && changes.length == 1) {
        return changes[0]["new-value"]
    } else {
        return ""
    }
}

export default function ConceptChangeItem({ item }) {
    const {t} = useTranslation()
    const displayType = t("db_" + item["latest-version-of-concept"].type)
    const displayAction = itemDisplayAction(t, item)
    const displayLabel = item["latest-version-of-concept"].preferredLabel
    const displayFrom = itemDisplayFrom(item)
    const displayTo = itemDisplayTo(item)
    const displayRelationType = ""
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