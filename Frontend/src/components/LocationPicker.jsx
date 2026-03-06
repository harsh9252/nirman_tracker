import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { FiX, FiCheck, FiMapPin, FiSearch } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon not showing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({ isOpen, onClose, onConfirm, initialLat, initialLng }) => {
    const [position, setPosition] = useState(null);
    const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default to India center
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialLat && initialLng) {
                const lat = parseFloat(initialLat);
                const lng = parseFloat(initialLng);
                setPosition([lat, lng]);
                setMapCenter([lat, lng]);
            } else {
                // Try to get current location if no initial position
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            const { latitude, longitude } = pos.coords;
                            setPosition([latitude, longitude]);
                            setMapCenter([latitude, longitude]);
                        },
                        (err) => {
                            console.error("Error getting location", err);
                        }
                    );
                }
            }
        }
    }, [isOpen, initialLat, initialLng]);

    // Component to handle map clicks
    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                setPosition([e.latlng.lat, e.latlng.lng]);
            },
        });
        return null;
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSearchError("");

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newLat = parseFloat(lat);
                const newLng = parseFloat(lon);

                setPosition([newLat, newLng]);
                setMapCenter([newLat, newLng]);
                setSearchQuery(""); // Optional: clear search after success
            } else {
                setSearchError("Location not found");
            }
        } catch (error) {
            console.error("Search error:", error);
            setSearchError("Error searching for location");
        } finally {
            setIsSearching(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1200] p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FiMapPin /> Pick Location
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-6 py-3 bg-gray-50 border-b">
                    <form onSubmit={handleSearch} className="flex gap-2 relative">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for a location (e.g., 'New Delhi', 'Mumbai')"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                        >
                            {isSearching ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                    {searchError && <p className="text-red-500 text-sm mt-1">{searchError}</p>}
                </div>

                {/* Map Area */}
                <div className="flex-1 relative">
                    {/* Key is important to re-render map when center changes significantly */}
                    <MapContainer
                        key={`${mapCenter[0]}-${mapCenter[1]}`}
                        center={mapCenter}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapClickHandler />
                        {position && <Marker position={position} />}
                    </MapContainer>

                    {/* Instructions Overlay */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full shadow-md text-sm font-medium z-[1000] pointer-events-none">
                        Click anywhere on the map to set location
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between rounded-b-xl">
                    <div className="text-sm text-gray-600">
                        {position ? (
                            <span>
                                Selected: <span className="font-mono font-bold">{position[0].toFixed(6)}, {position[1].toFixed(6)}</span>
                            </span>
                        ) : (
                            <span>No location selected</span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (position) {
                                    onConfirm(position[0], position[1]);
                                    onClose();
                                }
                            }}
                            disabled={!position}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white shadow-md transition-all ${position
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <FiCheck /> Confirm Location
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
