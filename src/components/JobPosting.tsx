/// <reference types="vite/client" />

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Constants from '../context/constants';
import './JobPosting.css';
import Rest from "../context/rest";
import AutocompleteSearch from "./autocomplete_search";
import { ChangeEvent } from 'react';
// Removed: import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import { IoIosSend } from "react-icons/io";

interface SearchResultItem {
  id: string;
  preferredLabel: string;
  type: string;
  [key: string]: any;
}

const DEBOUNCE_DELAY = 500; // milliseconds

const JobPosting = () => {
  const { t } = useTranslation();
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  // Remove old jobLocation state: const [jobLocation, setJobLocation] = useState('');
  const [selectedJobLocation, setSelectedJobLocation] = useState<SearchResultItem | null>(null); // State for selected location object
  const [description, setDescription] = useState('');
  const [occupation, setOccupation] = useState<SearchResultItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for debounce timer for autocomplete

  // Removed direct Gemini AI initialization from frontend
  const handleSearch = useCallback((query: string, version: string, onSuccess: (data: any) => void, onError: () => void) => {
    if (!query.trim()) {
      // Clear results if query is empty
      setSearchResults([]);
      setIsSearching(false);
      onSuccess([]);
      return;
    }

    setIsSearching(true);

    Rest.getAutocompleteConcepts(
      query,
      null,
      (results: SearchResultItem[]) => {
        const sortedResults = results.sort((a, b) => a.preferredLabel.localeCompare(b.preferredLabel));
        setSearchResults(sortedResults);
        setIsSearching(false);
        onSuccess(sortedResults);
      },
      (error) => {
        console.error("Search failed:", error);
        setSearchResults([]);
        setIsSearching(false);
        onError();
      }
    );
  }, []);

  const handleSearchInputChange = (query: string) => {
    setSearchQuery(query);
  };

  // Update handleOccupationSelect to only set the occupation state
  const handleOccupationSelect = useCallback((item: SearchResultItem) => {
    setOccupation(item);
    // AutocompleteSearch now handles clearing its internal query/results
  }, []);

  // Add handler to clear the selected occupation
  const handleClearOccupation = useCallback(() => {
    setOccupation(null);
  }, []);

  // Add handlers for job location selection and clearing
  const handleJobLocationSelect = useCallback((item: SearchResultItem) => {
    setSelectedJobLocation(item);
  }, []);

  const handleClearJobLocation = useCallback(() => {
    setSelectedJobLocation(null);
  }, []);

  // Add search handler for job location (similar to SignUpForm)
  const handleJobLocationSearch = useCallback((query: string, version: string, onSuccess: (data: any) => void, onError: () => void) => {
    Rest.getAutocompleteConcepts(
      query,
      null, // Assuming no specific version needed here
      (results: SearchResultItem[]) => {
        // Filter for municipality type, adjust if needed
        const locationResults = results.filter(result => result.type === 'municipality');
        onSuccess(locationResults);
      },
      (error) => {
        console.error("Error fetching locations:", error);
        onError();
      }
    );
  }, []);

  const handleGenerateDescription = async () => {
    if (!occupation) {
      setDescription("Please select an occupation.");
      return;
    }

    try {
      const response = await fetch('/api/generate-content', { // Use relative URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Write a job description in Swedish for a ${occupation?.preferredLabel} position`
        }),
      });

      const data = await response.json();
      setDescription(data.content);
    } catch (err: any) {
      console.error("Error generating response:", err);
      setDescription("Failed to generate response");
    }
  };

  return (
    <div className="job-posting-container">
      <h2 className="job-posting-title">{t('job_posting')}</h2>
      <div className="job-posting-form">
        <AutocompleteSearch
          placeholder={t('occupation')}
          customSearch={(query, version, onSuccess, onError) => {
            // Debounce logic can remain if needed for custom search triggering
            // handleSearchInputChange(query); // No longer needed to control input value externally
            if (debounceTimeoutRef.current) {
              clearTimeout(debounceTimeoutRef.current);
            }
            debounceTimeoutRef.current = setTimeout(() => {
              handleSearch(query, version, onSuccess, onError); // Assuming handleSearch provides suggestions via onSuccess
            }, DEBOUNCE_DELAY);
          }}
          callback={handleOccupationSelect}
          selectedItem={occupation} // Pass selected occupation state
          onClearSelection={handleClearOccupation} // Pass clear handler
          // Remove value prop, AutocompleteSearch manages its own input query now
          // value={searchQuery}
        />
      </div>
      <div className="job-posting-form">
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="jobTitle"
          type="text"
          placeholder={t('job_title')}
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
        />
      </div>
      <div className="job-posting-form">
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="company"
          type="text"
          placeholder={t('company')}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      {/* Replace input with AutocompleteSearch for Job Location */}
      <div className="job-posting-form">
        {/* Optionally keep the label or integrate into placeholder */}
        {/* <label htmlFor="jobLocation" className="job-posting-label">{t('job_location')}:</label> */}
        <AutocompleteSearch
          placeholder={t('job_location')}
          customSearch={handleJobLocationSearch}
          callback={handleJobLocationSelect}
          selectedItem={selectedJobLocation}
          onClearSelection={handleClearJobLocation}
        />
      </div>
      <div>
        <h3 className="job-posting-description-title">{t('job_description')}:</h3>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="job-posting-textarea" />
        <button onClick={handleGenerateDescription} className="job-posting-button">{t('generate_description')}</button>
      </div>
    </div>
  );
};

export default JobPosting;
