import React, { useState, useEffect, useCallback, useRef } from "react";
import SignUpForm from "../components/SignUpForm";
import Loader from "../components/loader";
import AutocompleteSearch from "../components/autocomplete_search";
import Constants from "../context/constants";
import Rest from "../context/rest";
import { useTranslation } from "react-i18next";
import EventDispatcher from "../context/event_dispatcher";

// Define types for state and search results
interface SearchResultItem { // Used for occupations and skills
  id: string;
  preferredLabel: string;
  type: string;
  [key: string]: any;
}

// Define type for location item (can reuse SearchResultItem or be specific)
interface LocationItem {
  id: string;
  preferredLabel: string;
  type: string; // Should be 'municipality'
  [key: string]: any;
}

interface StartState {
  version: string | null;
  language: string | null;
  validUrl: string | null;
  userName: string;
  searchQuery: string;
  searchResults: SearchResultItem[]; // Results for the initial autocomplete
  isSearching: boolean; // Loading state for autocomplete
  chipFilter: string; // Filter for the *autocomplete* results chips (if shown)
  selectedOccupation: SearchResultItem | null; // Holds the full details of the selected occupation
  relatedSkills: SearchResultItem[]; // Holds skills related to the selected occupation
  isFetchingDetails: boolean; // Loading state for fetching occupation details
  // Step 2 fields
  name: string;
  location: LocationItem | null; // Changed from string to object or null
  referenceNumber: string;
}

// Define a more specific type for concepts fetched via getConcept
interface ConceptDetail extends SearchResultItem {
  relation_list?: Array<{ name: string; list: SearchResultItem[] }>;
  // Add other potential fields from getConcept if known
}

// Placeholder data for prompt cards
const promptSuggestions = [
  { id: 1, text: "Write a to-do list for a personal project or task", icon: "👤" },
  { id: 2, text: "Generate an email ro reply to a job offer", icon: "✉️" },
  { id: 3, text: "Summarise this article or text for me in one paragraph", icon: "📄" },
  { id: 4, text: "How does AI work in a technical capacity", icon: "⚙️" },
];

const DEBOUNCE_DELAY = 500; // milliseconds

// Highlight matching text function from autocomplete_search.tsx
const highlightMatch = (text: string, query: string): React.ReactNode => {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const indices: number[] = [];
  let startIdx = 0;

  while ((startIdx = lowerText.indexOf(lowerQuery, startIdx)) > -1) {
    indices.push(startIdx);
    startIdx += lowerQuery.length;
  }

  let lastIndex = 0;
  const segments: React.ReactNode[] = [];

  indices.forEach((idx) => {
    if (idx > lastIndex) {
      segments.push(text.substring(lastIndex, idx));
    }
    segments.push(
      <strong key={idx} className="text-blue-600">
        {text.substring(idx, idx + query.length)}
      </strong>
    );
    lastIndex = idx + query.length;
  });

  if (lastIndex < text.length) {
    segments.push(text.substring(lastIndex));
  }

  return segments;
};

const Start: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState<number>(1); // Add state for current step
  const [state, setState] = useState<StartState>({
    version: null,
    language: i18n.language,
    validUrl: null,
    userName: "John", // Placeholder user name
    searchQuery: "",
    searchResults: [],
    isSearching: false,
    chipFilter: "", // Initialize chip filter state
    selectedOccupation: null,
    relatedSkills: [],
    isFetchingDetails: false,
    // Step 2 fields
    name: "",
    location: null, // Initialize location as null
    referenceNumber: "",
  });
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for debounce timer for autocomplete

  // --- Input Change Handler for Step 2 ---
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  // --- End Input Change Handler ---

  // --- Location Search Handlers (Adapted from SignUpForm) ---
  const handleLocationSearch = useCallback((query: string, version: string | null, onSuccess: (data: LocationItem[]) => void, onError: () => void) => {
    Rest.getAutocompleteConcepts(
      query,
      null, // Version not typically needed for municipality search? Check API if necessary.
      (results: any[]) => {
        const locationResults = results.filter(result => result.type === 'municipality') as LocationItem[];
        onSuccess(locationResults);
      },
      (error) => {
        console.error("Error fetching locations:", error);
        onError();
      }
    );
  }, []);

  const handleLocationSelect = useCallback((item: LocationItem) => {
    setState(prevState => ({ ...prevState, location: item })); // Set the selected location object in state
  }, []);

  const handleClearLocation = useCallback(() => {
    setState(prevState => ({ ...prevState, location: null })); // Clear the selected location object
  }, []);
  // --- End Location Search Handlers ---

  // --- Submit Handler ---
  const handleSubmit = () => {
    console.log("Form Submitted!");
    console.log("Selected Occupation:", state.selectedOccupation?.preferredLabel); // Log label
    console.log("Name:", state.name);
    console.log("Location:", state.location?.preferredLabel ?? "Not selected"); // Log label or fallback
    console.log("Reference Number:", state.referenceNumber);
    // TODO: Add actual submission logic here (e.g., API call)
    alert("Form submitted! Check the console for details."); // Simple feedback
  };
  // --- End Submit Handler ---

  const currentFetchIdRef = useRef<string | null>(null); // Ref to track the ID being fetched

  const REMOTE_URL = window.location.origin;

  const onLanguageChanged = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      language: i18n.language,
    }));
  }, [i18n.language]);

  const getCompleteUrl = (version: string): string => {
    return `${REMOTE_URL}/taxonomy_v${version}.html`;
  };

  const isVersionUrlValid = (version: string): boolean => {
    try {
      const http = new XMLHttpRequest();
      http.open("HEAD", getCompleteUrl(version), false);
      http.send();
      return http.status === 200;
    } catch (e) {
      return false;
    }
  };

  const updateUrl = useCallback(async () => {
    if (state.version === null) {
      setState((prevState) => ({ ...prevState, validUrl: null }));
    } else {
      const version = 2; // Hardcoded version, as in original
      const language = state.language === null ? "" : `_${state.language}`;

      let urlToSet: string | null = null; // Add explicit type annotation
      if (isVersionUrlValid(version + language)) {
        urlToSet = getCompleteUrl(version + language);
      } else if (isVersionUrlValid(version.toString())) {
        urlToSet = getCompleteUrl(version.toString());
      }
      setState((prevState) => ({ ...prevState, validUrl: urlToSet }));
    }
  }, [state.version, state.language, REMOTE_URL]); // Added REMOTE_URL dependency

  // --- Search Functionality ---
  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      // Clear results and filter if query is empty
      setState((prevState) => ({ ...prevState, searchResults: [], isSearching: false, chipFilter: "" }));
      return;
    }

    // Reset chip filter when a new search starts
    setState((prevState) => ({ ...prevState, isSearching: true, chipFilter: "" }));

    const startTime = performance.now();
    setState((prev) => ({ ...prev, isSearching: true, chipFilter: "" }));

    Rest.getAutocompleteConcepts(
      query,
      null,
      (results: SearchResultItem[]) => {
        const sortedResults = results.sort((a, b) => a.preferredLabel.localeCompare(b.preferredLabel));
        setState((prev) => ({
          ...prev,
          searchResults: sortedResults,
          isSearching: false,
        }));
        console.log(`Search took ${performance.now() - startTime}ms`);
      },
      (error) => {
        console.error("Search failed:", error);
        setState((prev) => ({
          ...prev,
          isSearching: false,
          searchResults: [],
        }));
      }
    );
  }, []); // No dependencies needed if it only uses the passed query

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const query = event.target.value;
    setState((prevState) => ({ ...prevState, searchQuery: query }));

    // Clear the previous debounce timer
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set a new timer to trigger search after delay
    debounceTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, DEBOUNCE_DELAY);
  };

  const handleChipFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => ({ ...prevState, chipFilter: event.target.value }));
  };

  const handleChipClick = (item: SearchResultItem) => {
    // Navigate to the concept page using hash routing
    window.location.hash = `#/concept/${item.id}`;
    // Clear search results and query after navigation
    setState((prevState) => ({ ...prevState, searchResults: [], searchQuery: "", chipFilter: "" }));
    // Clear any pending debounce timer
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  };

  // --- End Search Functionality ---

  useEffect(() => {
    EventDispatcher.add(onLanguageChanged, Constants.EVENT_LANGUAGE_CHANGED);

    // Fetch versions
    Rest.getVersions(
      (data: any[]) => {
        if (data.length > 0) {
          let version = data[data.length - 1].version;
          const selectedVersion = Constants.getArg("v");

          if (selectedVersion !== null) {
            version = selectedVersion;
          }

          setState((prevState) => ({ ...prevState, version }));
        }
      },
      (error) => {
        // Add error callback
        console.error("Failed to fetch versions:", error);
      }
    );

    // Cleanup debounce timer on unmount
    return () => {
      EventDispatcher.remove(onLanguageChanged);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [onLanguageChanged]);

  useEffect(() => {
    updateUrl();
  }, [state.version, state.language, updateUrl]);

  // --- Fetch Occupation Details ---
  const fetchOccupationDetails = useCallback(async (occupation: SearchResultItem) => {
    // Accept the full occupation item
    const occupationId = occupation.id;
    // Prevent fetching if already fetching the same ID or no ID provided
    if (state.isFetchingDetails || !occupationId || currentFetchIdRef.current === occupationId) {
      console.log("Skipping fetch: already fetching, no ID, or same ID as current fetch.");
      return;
    }

    console.log(`Fetching details for occupation ID: ${occupationId}`);
    setState((prevState) => ({
      ...prevState,
      isFetchingDetails: true,
      selectedOccupation: occupation, // Set selected occupation immediately from the item passed in
      relatedSkills: [], // Clear previous skills
      searchResults: [], // Clear autocomplete results
      searchQuery: "", // Clear search query in the input
      chipFilter: "", // Clear autocomplete chip filter
    }));
    currentFetchIdRef.current = occupationId; // Track the ID being fetched

    // --- Start GraphQL Fetch Logic (Adapted from JobApplicationForm) ---
    try {
      // First, get the occupation details to check if it has SSYK information
      const occupationDetailsQuery = `concepts(id: "${occupationId}") {
          id
          preferred_label
          type
          broader {
              id
              preferred_label
              type
          }
      }`;

      console.log("GraphQL Occupation Details Query:", occupationDetailsQuery);

      // Assuming Rest.getGraphQL exists and works similarly to JobApplicationForm
      Rest.getGraphQL(
        occupationDetailsQuery,
        (occupationResponse) => {
          // Check if this response is still relevant
          if (currentFetchIdRef.current !== occupationId) {
            console.log(`Ignoring stale occupation details response for ID: ${occupationId}`);
            return;
          }
          console.log("GraphQL Occupation Details Response:", JSON.stringify(occupationResponse, null, 2));

          // Find SSYK level 4 in broader concepts if available
          let ssykLevel4Id: string | null = null;
          if (occupationResponse?.data?.concepts && occupationResponse.data.concepts.length > 0) {
            // Store the fetched details (even if partial)
            const fetchedOccupationDetails = occupationResponse.data.concepts[0];
            // Update the selected occupation state with potentially more details from GraphQL response
            setState((prevState) => ({
              ...prevState,
              selectedOccupation: { ...prevState.selectedOccupation, ...fetchedOccupationDetails },
            }));

            if (fetchedOccupationDetails.broader && Array.isArray(fetchedOccupationDetails.broader)) {
              // Check if broader exists and is an array
              const broaderConcepts = fetchedOccupationDetails.broader;
              const ssykConcept = broaderConcepts.find(
                (concept) => concept.type && concept.type.startsWith("ssyk-level-4")
              ); // Check type exists

              if (ssykConcept) {
                ssykLevel4Id = ssykConcept.id;
                console.log("Found SSYK level 4 ID:", ssykLevel4Id);
              } else {
                console.log("No SSYK level 4 found in broader concepts.");
              }
            } else {
              console.log("No 'broader' array found in occupation details response.");
            }
          } else {
            console.warn("No concepts found in occupation details response for ID:", occupationId);
            // Keep the initially selected occupation data passed into the function
          }

          // Build enhanced query to get skills from both occupation and SSYK level
          // Using preferred_label for consistency with SearchResultItem
          let skillsQuery = `
            occupationSkills: concepts(id: "${occupationId}") {
              id
              related(type: "skill") {
                id
                type
                preferredLabel: preferred_label
                alternativeLabels: alternative_labels
              }
            }`;

          // If we have SSYK level 4 ID, also fetch skills for that group
          if (ssykLevel4Id) {
            skillsQuery += `
              ssykGroupSkills: concepts(id: "${ssykLevel4Id}") {
                id
                related(type: "skill") {
                  id
                  type
                  preferredLabel: preferred_label
                  alternativeLabels: alternative_labels
                }
              }`;
          }

          console.log("GraphQL Skills Query:", skillsQuery);

          // Now fetch the skills
          Rest.getGraphQL(
            skillsQuery,
            (skillsResponse) => {
              // Check if this response is still relevant
              if (currentFetchIdRef.current !== occupationId) {
                console.log(`Ignoring stale skills response for ID: ${occupationId}`);
                return;
              }
              console.log("GraphQL Skills Response:", JSON.stringify(skillsResponse, null, 2));

              // Process skills from both queries
              let allSkills: SearchResultItem[] = [];

              // Process occupation-related skills
              if (
                skillsResponse?.data?.occupationSkills &&
                Array.isArray(skillsResponse.data.occupationSkills) && // Check if it's an array
                skillsResponse.data.occupationSkills.length > 0 &&
                skillsResponse.data.occupationSkills[0].related &&
                Array.isArray(skillsResponse.data.occupationSkills[0].related)
              ) {
                // Check related is array
                console.log(
                  `Found ${skillsResponse.data.occupationSkills[0].related.length} skills directly related to occupation.`
                );
                allSkills = [...skillsResponse.data.occupationSkills[0].related];
              } else {
                console.log("No skills array found directly related to occupation.");
              }

              // Process SSYK-related skills if available
              if (
                skillsResponse?.data?.ssykGroupSkills &&
                Array.isArray(skillsResponse.data.ssykGroupSkills) && // Check if it's an array
                skillsResponse.data.ssykGroupSkills.length > 0 &&
                skillsResponse.data.ssykGroupSkills[0].related &&
                Array.isArray(skillsResponse.data.ssykGroupSkills[0].related)
              ) {
                // Check related is array
                console.log(
                  `Found ${skillsResponse.data.ssykGroupSkills[0].related.length} skills related to SSYK group.`
                );
                // Add SSYK-related skills, avoiding duplicates
                skillsResponse.data.ssykGroupSkills[0].related.forEach((ssykSkill: SearchResultItem) => {
                  if (!allSkills.some((skill) => skill.id === ssykSkill.id)) {
                    allSkills.push(ssykSkill);
                  }
                });
              } else {
                console.log("No skills array found related to SSYK group (or SSYK group wasn't queried).");
              }

              console.log(`Total skills before deduplication: ${allSkills.length}`);

              // Remove duplicates based on ID and sort alphabetically by label
              const uniqueSkills = [...new Map(allSkills.map((skill) => [skill.id, skill])).values()] as SearchResultItem[];
              uniqueSkills.sort((a, b) => (a.preferredLabel || "").localeCompare(b.preferredLabel || ""));
              console.log("Final Extracted Skills (Unique & Sorted):", uniqueSkills);

              setState((prevState) => ({
                ...prevState,
                relatedSkills: uniqueSkills,
                isFetchingDetails: false, // Stop loading on success
              }));
              // Reset fetch tracking ref *only* after successful processing for this ID
              console.log(`Resetting fetch tracking (GraphQL success) for ID: ${occupationId}`);
              currentFetchIdRef.current = null;
            },
            (skillsError) => {
              // Error fetching skills
              if (currentFetchIdRef.current !== occupationId) {
                console.log(`Ignoring stale skills fetch error for ID: ${occupationId}`);
                return;
              }
              console.error("Error fetching related skills via GraphQL:", skillsError);
              setState((prevState) => ({ ...prevState, isFetchingDetails: false })); // Stop loading
              // Reset fetch tracking ref *only* after skills fetch error for this ID
              console.log(`Resetting fetch tracking (GraphQL skills error) for ID: ${occupationId}`);
              currentFetchIdRef.current = null;
            }
          ); // End Rest.getGraphQL for skills
        },
        (occupationError) => {
          // Error fetching occupation details
          if (currentFetchIdRef.current !== occupationId) {
            console.log(`Ignoring stale occupation details fetch error for ID: ${occupationId}`);
            return;
          }
          console.error("Error fetching occupation details via GraphQL:", occupationError);
          // Attempt fallback or just stop
          setState((prevState) => ({ ...prevState, isFetchingDetails: false })); // Stop loading
          // Reset fetch tracking ref *only* after occupation details fetch error for this ID
          console.log(`Resetting fetch tracking (GraphQL occupation error) for ID: ${occupationId}`);
          currentFetchIdRef.current = null;
          // NOTE: Could add the fallback logic from JobApplicationForm here if needed
        }
      ); // End Rest.getGraphQL for occupation details
    } catch (error) {
      // Catch synchronous errors or errors during setup
      if (currentFetchIdRef.current !== occupationId) {
        console.log(`Ignoring stale fetch catch block for ID: ${occupationId}`);
        return;
      }
      console.error("Error during fetchOccupationDetails execution:", error);
      setState((prevState) => ({
        ...prevState,
        isFetchingDetails: false, // Stop loading on exception
      }));
      // Reset fetch tracking ref *only* after catching the exception for this ID
      console.log(`Resetting fetch tracking (GraphQL exception) for ID: ${occupationId}`);
      currentFetchIdRef.current = null;
    }
    // --- End GraphQL Fetch Logic ---
  }, [state.isFetchingDetails]); // Dependency includes loading state to prevent concurrent fetches

  // --- Handle Skill Chip Click ---
  const handleSkillChipClick = (skill: SearchResultItem) => {
    console.log("Clicked skill chip:", skill);
    // Navigate to the skill's concept page
    window.location.hash = `#/concept/${skill.id}`;
    // Optionally clear the selected occupation after navigating away
    // setState(prevState => ({ ...prevState, selectedOccupation: null, relatedSkills: [] }));
  };
  // --- End Handle Skill Chip Click ---

  // --- Handle Clear Occupation Selection ---
  const handleClearOccupation = () => {
    setState(prevState => ({
      ...prevState,
      selectedOccupation: null,
      relatedSkills: [], // Also clear related skills
    }));
    // Reset fetch tracking if needed (though it should be null if not fetching)
    currentFetchIdRef.current = null;
  };
  // --- End Handle Clear Occupation Selection ---

  // Filtered results for display, ensuring label exists
  const filteredChipResults = state.searchResults.filter(
    (result) =>
      result.label &&
      typeof result.label === "string" && // Add check for label existence and type
      result.label.toLowerCase().includes(state.chipFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 font-sans">
      <div className="w-full mx-auto flex space-x-4">
        <div className="w-3/5">
          {/* --- Step 1: Occupation Search --- */}
          {currentStep === 1 && (
            <>
              {/* Search Bar Area */}
              <div className="relative mb-8">
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <AutocompleteSearch
                  placeholder="Search Occupations..."
                  selectedItem={state.selectedOccupation}
                  onClearSelection={handleClearOccupation}
                  callback={(item) => {
                    const occupationTypes = ["occupation", "occupation-name", "ssyk-level-1", "ssyk-level-2", "ssyk-level-3", "ssyk-level-4"];
                    if (occupationTypes.includes(item.type)) {
                      fetchOccupationDetails(item);
                    } else {
                      console.warn("Selected item was not an occupation:", item.type, item);
                      handleClearOccupation();
                      setState((prev) => ({ ...prev, searchResults: [], searchQuery: "", chipFilter: "" }));
                    }
                  }}
                  customSearch={(query, version, onSuccess, onError) => {
                    Rest.getAutocompleteConcepts(
                      query, Constants.getArg("v"),
                      (results) => {
                        const occupationTypes = ["occupation", "occupation-name", "ssyk-level-1", "ssyk-level-2", "ssyk-level-3", "ssyk-level-4"];
                        const filteredResults = results.filter((r) => occupationTypes.includes(r.type));
                        onSuccess(filteredResults);
                      },
                      onError
                    );
                  }}
                  showType={false}
                />
              </div>

              {/* Results Display Area */}
              {(state.isFetchingDetails || state.selectedOccupation) && (
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200">
                  {state.isFetchingDetails && (
                    <div className="p-3 text-center text-sm text-gray-500 flex items-center justify-center">
                      <Loader /> <span className="ml-2">Loading related skills...</span>
                    </div>
                  )}
                  {!state.isFetchingDetails && state.selectedOccupation && (
                    <>
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Selected Occupation</h3>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">{state.selectedOccupation?.preferredLabel}</span>
                          <button onClick={handleClearOccupation} className="text-xs text-red-600 hover:text-red-800 font-medium" title="Clear selection">Clear</button>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Related Skills</h4>
                        {state.relatedSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {state.relatedSkills.map((skill) => (
                              <span key={skill.id} className="inline-flex items-center bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSkillChipClick(skill)} title={skill.preferredLabel}>
                                {skill.preferredLabel}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No related skills found for this occupation.</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Placeholder when nothing is selected */}
              {!state.isFetchingDetails && !state.selectedOccupation && (
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200 text-center">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Searches</h3>
                  <p className="text-sm text-gray-400 italic">Search for an occupation to see related skills.</p>
                </div>
              )}

              {/* Navigation Button for Step 1 */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!state.selectedOccupation}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {/* --- Step 2: Additional Details --- */}
          {currentStep === 2 && (
            <>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200">
                <h2 className="text-lg font-semibold mb-6">Additional Information</h2>
                {/* Form fields */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name" // Matches state key
                      value={state.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your name"
                    />
                  </div>
                  {/* Location Autocomplete */}
                  <div>
                    <label htmlFor="location-search" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <AutocompleteSearch
                      // Use a unique ID if needed, though AutocompleteSearch might manage its own internal input ID
                      // id="location-search"
                      placeholder="Search for a municipality..."
                      customSearch={handleLocationSearch}
                      callback={handleLocationSelect}
                      selectedItem={state.location} // Pass the location object/null
                      onClearSelection={handleClearLocation}
                      showType={false} // Hide the 'municipality' type label in suggestions
                      // Add necessary CSS classes or ensure they are handled within AutocompleteSearch
                      // className="w-full ..." // Apply styling if needed externally
                    />
                  </div>
                  <div>
                    <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                    <input
                      type="text"
                      id="referenceNumber"
                      name="referenceNumber" // Matches state key
                      value={state.referenceNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter reference number"
                    />
                  </div>
                </div>

                {/* Navigation Buttons for Step 2 */}
                <div className="mt-6 flex justify-between">
                   <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleSubmit} // Attach submit handler
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* --- Right Column (Persistent Selected Occupation Display) --- */}
        <div className="w-2/5">
          {state.selectedOccupation && (
             <div className="sticky top-10 bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Selected Occupation</h3>
                <p className="text-sm text-gray-600">{state.selectedOccupation.preferredLabel}</p>
                {/* Optionally display related skills here too */}
                {state.relatedSkills.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                     <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Related Skills</h4>
                     <div className="flex flex-wrap gap-1">
                       {state.relatedSkills.slice(0, 10).map((skill) => ( // Show first 10 skills
                         <span key={skill.id} className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                           {skill.preferredLabel}
                         </span>
                       ))}
                       {state.relatedSkills.length > 10 && (
                          <span className="text-xs text-gray-500 italic ml-1">...and {state.relatedSkills.length - 10} more</span>
                       )}
                     </div>
                  </div>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Start;
