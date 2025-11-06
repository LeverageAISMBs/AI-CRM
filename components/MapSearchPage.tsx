import React, { useState, useEffect } from 'react';
import { generateGroundedResponse } from '../services/geminiService';
import { MapResult } from '../types';
import { IconMap, IconLink } from './Icons';

// --- IMPORTANT ---
// To use the Google Maps Embed API, you need an API key.
// 1. Go to the Google Cloud Console: https://console.cloud.google.com/
// 2. Create a project and enable the "Maps Embed API".
// 3. Create an API key under "Credentials".
// 4. IMPORTANT: Restrict the key to your domain and the Maps Embed API for security.
// 5. Replace the placeholder string below with your actual key.
const MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"; // <<-- REPLACE THIS

type UserLocation = {
  latitude: number;
  longitude: number;
};

const MapSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start true for geolocation
  const [error, setError] = useState<string | null>(null);
  
  const [textResponse, setTextResponse] = useState<string>('');
  const [mapResults, setMapResults] = useState<MapResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<MapResult | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setError(null);
          setIsLoading(false);
        },
        (err) => {
          setError(`Geolocation error: ${err.message}. Please enable location services.`);
          setIsLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setIsLoading(false);
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    if (!userLocation) {
        setError("Cannot perform search without your location. Please enable location services.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setTextResponse('');
    setMapResults([]);
    setSelectedResult(null);

    try {
      const { textResponse, mapResults } = await generateGroundedResponse(searchQuery, userLocation);
      setTextResponse(textResponse);
      setMapResults(mapResults);
      if (mapResults.length > 0) {
        setSelectedResult(mapResults[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getMapUrl = () => {
      if (MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY") {
          return ''; // Don't attempt to load map without a key
      }
      if (selectedResult) {
          return `https://www.google.com/maps/embed/v1/search?key=${MAPS_API_KEY}&q=${encodeURIComponent(selectedResult.title)}`;
      }
      if (userLocation) {
          return `https://www.google.com/maps/embed/v1/view?key=${MAPS_API_KEY}&center=${userLocation.latitude},${userLocation.longitude}&zoom=14`;
      }
      return `https://www.google.com/maps/embed/v1/view?key=${MAPS_API_KEY}&center=37.7749,-122.4194&zoom=12`; // Default
  }

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex-shrink-0 p-4 border-b border-gray-700/50 flex items-center space-x-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
          placeholder="e.g., 'Good Italian restaurants nearby'"
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isLoading && !userLocation}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:bg-gray-500"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
        {/* Left Panel: Results */}
        <div className="md:col-span-1 flex flex-col bg-gray-800/60 overflow-y-auto">
            {error && (
                <div className="p-4 m-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">{error}</div>
            )}
            
            {!isLoading && !textResponse && !mapResults.length && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <IconMap className="w-16 h-16 text-gray-600 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-400">Find Places with AI</h2>
                    <p className="text-gray-500">Use natural language to search for locations around you.</p>
                </div>
            )}

            {textResponse && (
                <div className="p-4 border-b border-gray-700/50 bg-gray-900/30">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{textResponse}</p>
                </div>
            )}
            
            <div className="flex-1">
                {mapResults.map(result => (
                    <div
                        key={result.id}
                        onClick={() => setSelectedResult(result)}
                        className={`p-4 cursor-pointer border-l-4 transition-colors ${selectedResult?.id === result.id ? 'bg-indigo-600/20 border-indigo-500' : 'border-transparent hover:bg-gray-700/50'}`}
                    >
                        <h3 className="font-semibold text-white">{result.title}</h3>
                        <a href={result.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline flex items-center mt-1">
                           <IconLink className="w-3 h-3 mr-1"/> View on Google Maps
                        </a>
                    </div>
                ))}
            </div>
        </div>

        {/* Right Panel: Map */}
        <div className="md:col-span-2 bg-gray-700 flex items-center justify-center">
             {MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY" ? (
                <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold text-yellow-400">Map Configuration Needed</h3>
                    <p className="mt-2 text-gray-300">Please add your Google Maps API key to <br/><code className="bg-gray-900 text-yellow-300 px-2 py-1 rounded">components/MapSearchPage.tsx</code><br/> to enable the map view.</p>
                </div>
             ) : (
                <iframe
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    src={getMapUrl()}>
                </iframe>
             )}
        </div>
      </main>
    </div>
  );
};

export default MapSearchPage;
