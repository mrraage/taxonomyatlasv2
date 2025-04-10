import React, { useState, useCallback } from 'react';
import Rest from "../context/rest";
import AutocompleteSearch from "./autocomplete_search";

// Define type for location item (assuming it matches AutocompleteItem)
interface LocationItem {
  id: string;
  preferredLabel: string;
  type: string;
  [key: string]: any;
}

const SignUpForm: React.FC = () => {
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  // Remove location string state: const [location, setLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null); // State for the selected location object
  const [locationQuery, setLocationQuery] = useState(''); // Keep query state if needed for input control
  const [referensnumber, setReferensnumber] = useState('');
  const [nameError, setNameError] = useState('');
  const [lastnameError, setLastnameError] = useState('');
  const [referensnumberError, setReferensnumberError] = useState('');

  const handleLocationSearch = useCallback((query: string, version: string, onSuccess: (data: any) => void, onError: () => void) => {
    Rest.getAutocompleteConcepts(
      query,
      null,
      (results: any[]) => {
        const locationResults = results.filter(result => result.type === 'municipality');
        onSuccess(locationResults);
      },
      (error) => {
        console.error("Error fetching locations:", error);
        onError();
      }
    );
  }, []);

  const handleLocationSelect = useCallback((item: LocationItem) => {
    setSelectedLocation(item); // Set the selected location object
    // setLocationQuery(''); // AutocompleteSearch clears its internal query now
  }, []);

  // Rename handleRemoveLocation to handleClearLocation for consistency
  const handleClearLocation = useCallback(() => {
    setSelectedLocation(null); // Clear the selected location object
    // setLocationQuery(''); // Query is already cleared or managed by AutocompleteSearch
  }, []);

  const validateName = (value: string) => {
    if (!value) {
      setNameError('Name is required');
    } else {
      setNameError('');
    }
  };

  const validateLastname = (value: string) => {
    if (!value) {
      setLastnameError('Lastname is required');
    } else {
      setLastnameError('');
    }
  };

  const validateReferensnumber = (value: string) => {
    if (!/^\d+$/.test(value)) {
      setReferensnumberError('Referensnumber must be a number');
    } else {
      setReferensnumberError('');
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Name
        </label>
        <input
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${nameError ? 'border-red-500' : ''}`}
          id="name"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={(e) => validateName(e.target.value)}
        />
        {nameError && <p className="text-red-500 text-xs italic">{nameError}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
          Location
        </label>
        <AutocompleteSearch
          placeholder="Search for a municipality..."
          customSearch={handleLocationSearch}
          callback={handleLocationSelect}
          // Pass the selected location object and clear handler
          selectedItem={selectedLocation}
          onClearSelection={handleClearLocation}
          // Remove value prop if it was just displaying the string
          // value={location}
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="referensnumber">
          Referensnumber
        </label>
        <input
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${referensnumberError ? 'border-red-500' : ''}`}
          id="referensnumber"
          type="number"
          placeholder="Referensnumber"
          value={referensnumber}
          onChange={(e) => setReferensnumber(e.target.value)}
          onBlur={(e) => validateReferensnumber(e.target.value)}
        />
        {referensnumberError && <p className="text-red-500 text-xs italic">{referensnumberError}</p>}
      </div>
      <div className="flex items-center justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default SignUpForm;