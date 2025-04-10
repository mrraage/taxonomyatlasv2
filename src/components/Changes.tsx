import React, { useState } from "react"
import ChangeItem from "./ChangeItem"
import { useTranslation } from "react-i18next"

// renderHeaders() {
//   var renderArrow = (type) => {
//       if(type == this.state.sortType) {
//           return (
//               <i className={this.state.sortDirection ? "down" : "up"}/>
//           )
//       }
//   }
//   var renderItem = (text, type) => {
//       return (
//           <div 
//               className="version_list_item_header"
//               onPointerUp={this.onListHeaderClicked.bind(this, type)}>
//               <div>{this.t(text)}</div>
//               {renderArrow(type)}
//           </div>
//       )
//   }
//   return (
//       <div className="version_headers font">
//           <div className="version_list_item version_list_header_container">
//               {renderItem("type", SortType.TYPE)}
//               {renderItem("action", SortType.ACTION)}
//               {renderItem("name", SortType.NAME)}
//               {renderItem("from", SortType.FROM)}
//               {renderItem("to", SortType.TO)}
//               {renderItem("relation_type", SortType.RELATION_TYPE)}
//           </div>
//       </div>
//   )
// }

// renderItems() {
//   return (
//       <div className="version_items font">
//           {this.renderLoader()}
//           {this.state.displayItems.slice(0,5).map((item) => <ChangeItem item={item} selected={this.state.selected == item} />)}
//       </div>
//   )
// }

// renderChanges() {
//   return (
//       <div className="changes_container">
//           <div className="font">
//               {this.t("changes")}
//           </div>
//           {this.renderHeaders()}
//   {this.renderItems()}
//           <div className="version_list_divider"/>
//       </div>
//   )
// }


export default function Changes({ changes }) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState()
  const [sortBy, setSortBy] = useState("type")
  const [sortDirection, setSortDirection] = useState(true)

  const renderWithSort = (headerName) => {
    return (
      <a onPointerUp={() => {setSortBy(headerName); setSortDirection(!sortDirection)}}>
        {t(headerName)} {sortBy === headerName ?  <i className={sortDirection ? "down" : "up"}></i> : <></> }
      </a>
    )
    }

  return (
    <div className="changes_container">
      <div className="font-black">
        {t("changes")}
      </div>
      <table>
        <thead>
          <tr>
            <th>{renderWithSort("type")}</th>
            <th>{renderWithSort("action")}</th>
            <th>{renderWithSort("name")}</th>
            <th>{renderWithSort("from")}</th>
            <th>{renderWithSort("to")}</th>
            <th>{renderWithSort("relation_type")}</th>
          </tr>
        </thead>
        <tbody>
          {changes.slice(0,5).map((change, index) =>
          <tr key={index} className={selected === change.id ? "version_list_item_selected" : ""} onPointerUp={() => setSelected(change.id)}>
            <ChangeItem item={change} />
          </tr>
          )}
        </tbody>
        </table>
    </div>
  )
}