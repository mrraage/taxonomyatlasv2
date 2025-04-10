import React from "react"
import { ItemType } from "./ItemType"
import ConceptChangeItem from "./ConceptChangeItem"
import RelationChangeItem from "./RelationChangeItem"

export default function ChangeItem({ item }) {
    // console.log(`ChangeItem: ${selected}`)
    return (
        <>
        {item.type === ItemType.CONCEPT ? <ConceptChangeItem item={item} /> : <RelationChangeItem item={item} />}
        </>
    )
}