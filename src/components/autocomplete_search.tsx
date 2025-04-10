import React, { useState, useRef, } from "react"
import Loader from "./loader"
import Rest from "../context/rest"
import {sortByKey} from "../context/util"
import GraphQL from "../context/graphql"
import { useTranslation } from "react-i18next"

interface AutocompleteItem {
  id: string; // Add the missing ID field
  type: string;
  preferredLabel: string;
  [key: string]: any;
}

interface TextSegment {
  bold: boolean;
  text: string;
}

interface AutocompleteSearchProps {
  placeholder?: string;
  customSearch?: (query: string, version: string, onSuccess: (data: any) => void, onError: () => void) => void;
  customSuggestions?: (items: AutocompleteItem[]) => AutocompleteItem[];
  callback?: (item: AutocompleteItem, searchInfo: { query: string; duration: number }) => void;
  keepQuery?: boolean; // This prop might become less relevant now
  highlightQuery?: boolean;
  showType?: boolean;
  onRenderItem?: (element: AutocompleteItem) => React.ReactNode;
  value?: string; // This prop seems unused, consider removing if confirmed
  selectedItem?: AutocompleteItem | null; // Prop to control the displayed chip
  onClearSelection?: () => void; // Prop to handle chip clearing
}

const AutocompleteSearch: React.FC<AutocompleteSearchProps> = ({
  placeholder,
  customSearch,
  customSuggestions,
  callback,
  keepQuery = false,
  highlightQuery = true,
  showType = true,
  onRenderItem,
  value, // Keep prop destructuring
  selectedItem, // Destructure new prop
  onClearSelection, // Destructure new prop
}) => {
  const {t} = useTranslation()
  const [query, setQuery] = useState<string>("");
  // Remove internal selectedItem state: const [selectedItem, setSelectedItem] = useState<AutocompleteItem | null>(null);
  const [autocomplete, setAutocomplete] = useState<AutocompleteItem[]>([]);
  const [isLoadingQuery, setIsLoadingQuery] = useState<boolean>(false);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  
  const queryRef = useRef<string>("");
  const performanceStartRef = useRef<number>(0);
  const queryDurationRef = useRef<number>(0);
  
  const getIndicesOf = (source: string, searchQuery: string): number[] => {
    // Check for null, undefined, or empty query
    if (!searchQuery || searchQuery.length === 0) {
      return [];
    }
    let startIndex = 0;
    const indices: number[] = [];
    // Safety limit to prevent potential infinite loops or excessive iterations
    const MAX_INDICES = 10000; // Limit the number of matches found
    let index = source.indexOf(searchQuery, startIndex);
    while (index > -1) {
      indices.push(index);
      // Check if we are exceeding a reasonable limit
      if (indices.length >= MAX_INDICES) {
        console.warn(`getIndicesOf: Exceeded maximum indices limit (${MAX_INDICES}) for query "${searchQuery}". Truncating results.`);
        break; // Exit loop early
      }
      startIndex = index + searchQuery.length;
      // Sanity check to ensure startIndex is actually advancing
      if (startIndex <= index) {
         console.error(`getIndicesOf: startIndex did not advance. index=${index}, searchQuery.length=${searchQuery.length}. Aborting loop.`);
         break; // Prevent potential infinite loop
      }
      index = source.indexOf(searchQuery, startIndex);
    }
    return indices;
  };

  const getSuggestions = (): AutocompleteItem[] => {
    if (customSuggestions) {
      return customSuggestions(autocomplete);
    }
    return autocomplete.filter((item) => {
      if (item.type === "occupation-collection" || item.type === "unemployment-type") {
        return false;
      }
      return true;
    });
  };

  const search = (searchQuery: string): void => {
    queryRef.current = searchQuery;
    
    if (searchQuery.length > 0) {
      Rest.abort();
      setQuery(searchQuery);
      setAutocomplete([]);
      setIsLoadingQuery(true);
      
      performanceStartRef.current = performance.now();
      const searchFunction = customSearch || Rest.getAutocompleteConcepts.bind(Rest);
      
      searchFunction(
        searchQuery,
        GraphQL.getArg("v"),
        (data: AutocompleteItem[]) => {
          queryDurationRef.current = performance.now() - performanceStartRef.current;
          setAutocomplete(sortByKey(data, "preferredLabel", true));
          setIsLoadingQuery(false);
        },
        () => {
          queryDurationRef.current = -1;
          setIsLoadingQuery(false);
        }
      );
    } else {
      Rest.abort();
      setQuery(searchQuery);
      setAutocomplete([]);
      setIsLoadingQuery(false);
    }
  };

  const onQueryChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    search(e.target.value);
  };

  const onSuggestionClicked = (item: AutocompleteItem): void => {
    // Don't set internal state here
    // setIsLoadingContent(true); // Maybe parent handles loading state now?
    // setSelectedItem(item); // Parent controls this via props
    setQuery(""); // Clear the input query after selection
    setAutocomplete([]);
    
    if (callback) {
      callback(item, {
        query: queryRef.current,
        duration: queryDurationRef.current,
      });
    }
  };

  const onGainedInputFocus = (): void => {
    // Don't re-search if an item is already selected
    if (!selectedItem && query && query.length > 0) {
      search(query);
    }
  };

  const onLostInputFocus = (): void => {
    if (isLoadingQuery) {
      Rest.abort();
    }
    
    setTimeout(() => {
      setAutocomplete([]);
      setIsLoadingQuery(false);
    }, 300);
  };

  // Function to call the parent's clear handler
  const handleClearSelection = (): void => {
    if (onClearSelection) {
      onClearSelection();
    }
  };

  const renderItem = (text: string, type: string): React.JSX.Element => {
    const indices = getIndicesOf(text.toLowerCase(), query.toLowerCase());
    let index = 0;
    const result: TextSegment[] = [];
    
    for (let i = 0; i < indices.length; ++i) {
      result.push({
        bold: false,
        text: text.substring(index, indices[i]),
      });
      result.push({
        bold: highlightQuery,
        text: text.substring(indices[i], indices[i] + query.length),
      });
      index = indices[i] + query.length;
    }
    
    if (index < text.length) {
      result.push({
        bold: false,
        text: text.substring(index, text.length),
      });
    }
    
    const filteredResult = result.filter((v) => v.text.length > 0);
    
    if (showType) {
      filteredResult.push({
        bold: false,
        text: " (" + type + ")",
      });
    }
    
    return (
      <span>
        {filteredResult.map((item, i) => {
          if (item.bold) {
            return <b key={i}>{item.text}</b>;
          } else {
            return <React.Fragment key={i}>{item.text}</React.Fragment>;
          }
        })}
      </span>
    );
  };

  const renderSuggestions = (): React.JSX.Element | null => {
    const items = getSuggestions();
    
    if (items.length) {
      return (
        <ul className="autocomplete">
          {items.map((element, index) => {
            if (onRenderItem) {
              return (
                <li 
                  key={index}
                  onMouseUp={() => onSuggestionClicked(element)}>
                  {onRenderItem(element)}
                </li>
              );
            }
            
            if (element.type === "occupation-collection") {
              return (
                <li 
                  key={index}
                  className="autocomplete_unavailable">
                  {renderItem(element.preferredLabel, t("db_" + element.type))}
                </li>
              );
            } else {
              return (
                <li 
                  key={index}
                  onMouseUp={() => onSuggestionClicked(element)}>
                  {renderItem(element.preferredLabel, t("db_" + element.type))}
                </li>
              );
            }
          })}
        </ul>
      );
    } else if (isLoadingQuery) {
      return (
        <div className="autocomplete">
          <Loader />
        </div>
      );
    } else if (query.length > 0) {
      return (
        <div className="autocomplete">
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="autocomplete_input_field relative">
      {selectedItem ? (
        // Display Chip when an item is selected
        <div className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full border border-blue-200">
          <span>{selectedItem.preferredLabel}</span>
          <button
            type="button"
            onClick={handleClearSelection}
            className="ml-2 -mr-1 flex-shrink-0 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-500 hover:bg-blue-200 hover:text-blue-600 focus:outline-none focus:bg-blue-300 focus:text-blue-700"
            aria-label="Clear selection"
          >
            <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
              <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
            </svg>
          </button>
        </div>
      ) : (
        // Display Input field when no item is selected
        <>
          {/* Search Icon */}
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" // Ensure icon is above input
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            placeholder={placeholder}
            value={query}
            onFocus={onGainedInputFocus}
            onBlur={onLostInputFocus}
            onChange={onQueryChanged}
          />
          {renderSuggestions()}
        </>
      )}
    </div>
  );
};

export default AutocompleteSearch