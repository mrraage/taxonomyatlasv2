import React, { useState, useCallback, useEffect, memo } from "react"
import { useTranslation } from "react-i18next"

// Define proper types for the component's props
interface TreeViewItemProps {
  item: {
    id: string
    label: string
    type?: string
    children?: any[]
    isExpanded?: boolean
    isVisible?: boolean
    ssyk_code?: { code: string }
    isco_code?: { code: string }
    code?: string
    setSelected?: (isSelected: boolean) => void
    setHighlighted?: (isHighlighted: boolean) => void
    setExpanded?: (isExpanded: boolean) => void
  }
  depth: number
  callback?: (item: any) => void
  highlight?: boolean
}

const TreeViewItem: React.FC<TreeViewItemProps> = ({ 
  item, 
  depth, 
  callback, 
  highlight = true 
}) => {
  const { t } = useTranslation()
  // Replace state with useState hooks
  const [isExpanded, setIsExpanded] = useState<boolean>(!!item.isExpanded)
  const [isSelected, setIsSelected] = useState<boolean>(false)
  const [isHighlighted, setIsHighlighted] = useState<boolean>(false)
  
  // Setup item methods
  useEffect(() => {
    // Attach methods to the item for external access
    item.setSelected = setIsSelected
    item.setHighlighted = setIsHighlighted
    item.setExpanded = setIsExpanded
    
    // Clean up
    return () => {
      // Optional: remove methods when component unmounts
      if (item) {
        item.setSelected = undefined
        item.setHighlighted = undefined
        item.setExpanded = undefined
      }
    }
  }, [item])
  
  // Handle item click
  const onItemClicked = useCallback(() => {
    if (callback) {
      callback(item)
    }
  }, [callback, item])
  
  // Render children elements
  const renderChildren = useCallback(() => {
    if (item.children && item.children.length && isExpanded) {
      const items = item.children
        .filter(element => element.isVisible === undefined || element.isVisible)
        .map((element, index) => (
          <TreeViewItem
            key={index}
            item={element}
            depth={depth + 1}
            callback={callback}
            highlight={highlight}
          />
        ))
      
      if (items.length > 0) {
        return (
          <ul className="tree_item_children">
            {items}
          </ul>
        )
      }
    }
    return null
  }, [item.children, isExpanded, depth, callback, highlight])
  
  // Render icon based on item state
  const renderIcon = useCallback(() => {
    if (item.children && item.children.length) {
      return <i className={isExpanded ? "down" : "right"} />
    } else {
      return <i className="empty" />
    }
  }, [item.children, isExpanded])
  
  // Render text display
  const renderText = useCallback(() => {
    if (item.ssyk_code && item.type && item.type.startsWith("ssyk")) {
      return <div>{item.ssyk_code.code} - {t(item.label)}</div>
    } else if (item.isco_code && item.type && item.type.startsWith("isco")) {
      return <div>{item.isco_code.code} - {t(item.label)}</div>
    } else if (item.code) {
      return <div>{item.code} - {t(item.label)}</div>
    } else if (!item.children || item.children.length === 0) {
      return <div>- {t(item.label)}</div>
    } else {
      return <div>{t(item.label)}</div>
    }
  }, [item])
  
  // Compute CSS class
  let css = isHighlighted ? "tree_item_selected" : ""
  if (isSelected) {
    css += " tree_item_selected_root"
  }
  if (highlight === false) {
    css = ""
  }
  
  return (
    <li className="tree_item_base">
      <div
        id={item.id}
        className={`tree_item rounded tree_item_${depth} font ${css}`}
        onPointerUp={onItemClicked}
      >
        {renderIcon()}
        {renderText()}
      </div>
      {renderChildren()}
    </li>
  )
}

// Use memo to prevent unnecessary re-renders
export default memo(TreeViewItem)