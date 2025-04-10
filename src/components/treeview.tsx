import React, { useState, useEffect, useCallback, useRef } from "react"
import Loader from "./loader"
import TreeViewItem from "./treeview_item"
import {sortByKey} from "../context/util"

interface TreeItem {
  id: string
  label: string
  parent?: TreeItem
  children?: TreeItem[]
  isTreeReady?: boolean
  isVisible?: boolean
  isExpanded?: boolean
  filterCheckName?: string
  sortOrder?: number
  scroll?: boolean
  ssyk_code?: { code: string }
  isco_code?: { code: string }
  code?: string
  setSelected?: (isSelected: boolean) => void
  setHighlighted?: (isHighlighted: boolean) => void
  setExpanded?: (isExpanded: boolean) => void
  [key: string]: any
}

interface TreeViewProps {
  roots?: TreeItem[]
  isLoading?: boolean
  filter?: string
  preSelectObject?: any
  preSelectCallback?: (item: TreeItem) => boolean
  onClick?: (item: TreeItem) => void
  highlight?: boolean
  css?: string
}

const TreeView: React.FC<TreeViewProps> = ({
  roots = [],
  isLoading = false,
  filter = "",
  preSelectObject = null,
  preSelectCallback,
  onClick,
  highlight = true,
  css,
}) => {
  const [treeState, setTreeState] = useState({
    isLoading: isLoading,
    hadFilter: false,
    hasFilter: false,
    roots: roots,
    preSelectObject: preSelectObject,
  })
  
  const selectedRef = useRef<TreeItem | null>(null)
  const prevFilterRef = useRef<string | null>(null)
  
  // Setup parent relations for tree items
  const setupParentRelations = useCallback((items: TreeItem[], parent?: TreeItem) => {
    // Sort items with sortOrder
    const sortable = items.filter(x => x.sortOrder != null)
    if (sortable.length > 0) {
      const remainder = items.filter(x => x.sortOrder == null)
      sortByKey(sortable, "sortOrder", true)
      
      // Restore array with sorted values
      items.length = 0
      items.push(...sortable, ...remainder)
    }
    
    // Set parent relations
    for (let i = 0; i < items.length; i++) {
      const node = items[i]
      if (!node.isTreeReady && (node.parent !== parent || parent == null)) {
        node.parent = parent
        node.isTreeReady = true
        if (node.children) {
          setupParentRelations(node.children, node)
        }
      }
    }
  }, [])
  
  // Pre-select an item based on callback
  const preSelectItem = useCallback((items: TreeItem[], callback?: (item: TreeItem) => boolean) => {
    if (!callback) return null
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (callback(item)) {
        return item
      }
      if (item.children) {
        const result = preSelectItem(item.children, callback)
        if (result) {
          return result
        }
      }
    }
    return null
  }, [])
  
  // Filter items based on a query
  const filterItems = useCallback((items: TreeItem[], query: string | null) => {
    let anyVisible = false
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      // Create normalized name for filtering if it doesn't exist
      if (item.filterCheckName == null) {
        item.filterCheckName = item.label.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        item.filterCheckName = item.filterCheckName.toLowerCase()
        
        // Add code to filter check if available
        if (item.ssyk_code || item.isco_code || item.code) {
          let code = ""
          if (item.ssyk_code) {
            code = item.ssyk_code.code
          } else if (item.isco_code) {
            code = item.isco_code.code
          } else {
            code = item.code
          }
          item.filterCheckName = code + " - " + item.filterCheckName
        }
      }
      
      // Check if item matches the query
      item.isVisible = !query || query === "" || item.filterCheckName.indexOf(query) !== -1
      
      // Check children
      if (item.children) {
        if (filterItems(item.children, query)) {
          item.isVisible = true
        }
      }
      
      if (item.isVisible) {
        anyVisible = true
      }
    }
    
    return anyVisible
  }, [])
  
  // Set highlighted state for an item and its ancestors
  const setHighlightedChain = useCallback((root: TreeItem | undefined, value: boolean) => {
    if (highlight) {
      let p = root
      while (p != null) {
        if (p.setHighlighted != null) {
          p.setHighlighted(value)
        }
        p = p.parent
      }
    }
  }, [highlight])
  
  // Handle item click
  const onItemClicked = useCallback((item: TreeItem) => {
    const selected = selectedRef.current
    
    if (selected) {
      setHighlightedChain(selected.parent, false)
      selected.setSelected?.(false)
    }
    
    selectedRef.current = item
    
    if (onClick) {
      onClick(item)
    } else if (item.isExpanded !== undefined) {
      item.isExpanded = !item.isExpanded
    }
    
    setHighlightedChain(item.parent, true)
    item.setSelected?.(true)
    item.setExpanded?.(item.isExpanded)
  }, [onClick, setHighlightedChain])
  
  // Try to select an item (retry if item is not ready)
  const onTrySelect = useCallback((item: TreeItem) => {
    if (item.setSelected) {
      onItemClicked(item)
    } else {
      setTimeout(() => onTrySelect(item), 50)
    }
  }, [onItemClicked])
  
  // Scroll to selected item
  const scrollToId = useCallback((id: string, count: number) => {
    const element = document.getElementById(id)
    const selected = selectedRef.current
    
    if (element != null && selected) {
      element.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "start"
      })
      selected.scroll = undefined
    } else if (count >= 0 && selected) {
      setTimeout(() => {
        scrollToId(id, count - 1)
      }, 1000)
    } else if (selected) {
      selected.scroll = undefined
    }
  }, [])
  
  // Check if roots have changed
  const isRootsChanged = useCallback((newRoots: TreeItem[]) => {
    if (newRoots.length !== treeState.roots.length) {
      return true
    }
    
    for (let i = 0; i < newRoots.length; i++) {
      if (newRoots[i].label !== treeState.roots[i].label) {
        return true
      }
    }
    
    return false
  }, [treeState.roots])
  
  // Initialize the tree on first render
  useEffect(() => {
    const normalizedFilter = filter ? filter.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : null
    setupParentRelations(roots)
    filterItems(roots, normalizedFilter ? normalizedFilter.toLowerCase() : null)
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Update tree when props change
  useEffect(() => {
    const hasFilterChanged = prevFilterRef.current !== filter
    const isLoadingChanged = treeState.isLoading !== isLoading
    const hasPreSelectChanged = treeState.preSelectObject !== preSelectObject
    
    if (!isRootsChanged(roots) && !isLoadingChanged && !hasFilterChanged && !hasPreSelectChanged) {
      return
    }
    
    // Handle roots change
    if (roots) {
      setupParentRelations(roots)
      
      // Handle filter change
      if (hasFilterChanged) {
        const normalizedFilter = filter ? filter.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : null
        filterItems(roots, normalizedFilter ? normalizedFilter.toLowerCase() : null)
        prevFilterRef.current = filter
      }
      
      setTreeState({
        isLoading: isLoading,
        hadFilter: treeState.hasFilter,
        hasFilter: filter != null && filter.length > 0,
        roots: roots,
        preSelectObject: preSelectObject
      })
      
      // Pre-select an item if loading is done
      if (!isLoading) {
        const selected = preSelectItem(roots, preSelectCallback)
        if (selected) {
          let parent = selected.parent
          let lastParent = null
          
          while (parent) {
            lastParent = parent
            if (parent.isExpanded !== undefined) {
              parent.isExpanded = true
            }
            parent = parent.parent
          }
          
          selected.scroll = true
          
          if (lastParent && lastParent.setExpanded) {
            lastParent.setExpanded(true)
          }
          
          onTrySelect(selected)
        }
      }
    } else {
      setTreeState({
        isLoading: false,
        hadFilter: treeState.hadFilter,
        hasFilter: false,
        roots: [],
        preSelectObject: null
      })
    }
  }, [roots, isLoading, filter, preSelectObject, treeState, setupParentRelations, filterItems, isRootsChanged, preSelectItem, preSelectCallback, onTrySelect])
  
  // Scroll to selected item after update
  useEffect(() => {
    const selected = selectedRef.current
    if (selected && selected.scroll) {
      scrollToId(selected.id, 30)
    }
  })
  
  return (
    <ul className={css ? `tree_view ${css}` : "tree_view"}>
      {treeState.isLoading ? (
        <Loader />
      ) : (
        treeState.roots
          .map((element, index) => {
            if (element.isVisible === undefined || element.isVisible) {
              return (
                <TreeViewItem
                  item={element}
                  key={element.label + element.id}
                  depth={0}
                  callback={onItemClicked}
                  highlight={highlight}
                />
              )
            }
            return null
          })
          .filter(Boolean)
      )}
    </ul>
  )
}

export default TreeView