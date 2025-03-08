
import React, { useEffect, useRef, useState } from "react";
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Icon, Style } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Overlay from 'ol/Overlay';
import 'ol/ol.css';
import { Home, Phone, HeartPulse, Utensils, MapPin, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Types for resource locations
interface ResourceLocation {
  id: number;
  name: string;
  category: "shelter" | "healthcare" | "food" | "crisis";
  address: string;
  phone: string;
  lat: number;
  lng: number;
}

// Sample data for demonstration purposes - expanded with more locations per category
const resourceLocations: ResourceLocation[] = [
  {
    id: 1,
    name: "Downtown Emergency Shelter",
    category: "shelter",
    address: "123 Main St, Anytown, USA",
    phone: "(555) 123-4567",
    lat: 38.9072,
    lng: -77.0369
  },
  {
    id: 2,
    name: "Westside Community Clinic",
    category: "healthcare",
    address: "456 Health Ave, Anytown, USA",
    phone: "(555) 234-5678",
    lat: 38.9142,
    lng: -77.0400
  },
  {
    id: 3,
    name: "Eastside Food Pantry",
    category: "food",
    address: "789 Food Blvd, Anytown, USA",
    phone: "(555) 345-6789",
    lat: 38.9002,
    lng: -77.0339
  },
  {
    id: 4,
    name: "Crisis Support Center",
    category: "crisis",
    address: "321 Help St, Anytown, USA",
    phone: "(555) 456-7890",
    lat: 38.9112,
    lng: -77.0300
  },
  {
    id: 5,
    name: "North Side Shelter",
    category: "shelter",
    address: "555 North Ave, Anytown, USA",
    phone: "(555) 567-8901",
    lat: 38.9200,
    lng: -77.0350
  },
  {
    id: 6,
    name: "Family Health Center",
    category: "healthcare",
    address: "777 Medical Dr, Anytown, USA",
    phone: "(555) 678-9012",
    lat: 38.9050,
    lng: -77.0450
  },
  {
    id: 7,
    name: "Community Food Bank",
    category: "food",
    address: "888 Hunger St, Anytown, USA",
    phone: "(555) 789-0123",
    lat: 38.9100,
    lng: -77.0250
  },
  {
    id: 8,
    name: "Mental Health Crisis Line",
    category: "crisis",
    address: "999 Support Lane, Anytown, USA",
    phone: "(555) 890-1234",
    lat: 38.9150,
    lng: -77.0420
  }
];

// Map component configuration
interface InteractiveMapProps {
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  fullScreen?: boolean;
  onViewFullMap?: () => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  initialLat = 38.9072,
  initialLng = -77.0369,
  initialZoom = 12,
  fullScreen = false,
  onViewFullMap
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const popupOverlayRef = useRef<Overlay | null>(null);
  const [selectedResource, setSelectedResource] = useState<ResourceLocation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [visibleResources, setVisibleResources] = useState<ResourceLocation[]>(resourceLocations);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to get marker color based on category
  const getMarkerColor = (category: string): string => {
    switch (category) {
      case "shelter":
        return "#3b82f6"; // blue
      case "healthcare":
        return "#ef4444"; // red
      case "food":
        return "#22c55e"; // green
      case "crisis":
        return "#f59e0b"; // amber
      default:
        return "#6b7280"; // gray
    }
  };

  // Function to get icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "shelter":
        return <Home className="h-5 w-5" />;
      case "healthcare":
        return <HeartPulse className="h-5 w-5" />;
      case "food":
        return <Utensils className="h-5 w-5" />;
      case "crisis":
        return <Phone className="h-5 w-5" />;
      default:
        return <MapPin className="h-5 w-5" />;
    }
  };

  // Create a canvas icon for a marker
  const createMarkerIcon = (category: string): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 24;
    const context = canvas.getContext('2d');
    if (context) {
      context.beginPath();
      context.arc(12, 12, 10, 0, 2 * Math.PI);
      context.fillStyle = getMarkerColor(category);
      context.fill();
      context.strokeStyle = 'white';
      context.lineWidth = 2;
      context.stroke();
    }
    return canvas;
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      console.error('Map container ref is not available');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Initializing OpenLayers map...', mapRef.current.clientWidth, mapRef.current.clientHeight);
      
      // Clear any existing map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
      
      // Create vector source and layer for markers
      const vectorSource = new VectorSource();
      const vectorLayer = new VectorLayer({
        source: vectorSource
      });
      
      // Create popup overlay
      if (popupRef.current) {
        popupOverlayRef.current = new Overlay({
          element: popupRef.current,
          autoPan: true
        });
      }
      
      // Create map
      const map = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM()
          }),
          vectorLayer
        ],
        view: new View({
          center: fromLonLat([initialLng, initialLat]),
          zoom: initialZoom
        }),
        controls: []
      });
      
      // Add popup overlay to map
      if (popupOverlayRef.current) {
        map.addOverlay(popupOverlayRef.current);
      }
      
      // Add markers with proper properties
      resourceLocations.forEach(location => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([location.lng, location.lat]))
        });
        
        // Set properties as a separate attribute to avoid TypeScript errors
        feature.set('properties', location);
        
        const style = new Style({
          image: new Icon({
            img: createMarkerIcon(location.category),
            scale: 1
          })
        });
        
        feature.setStyle(style);
        vectorSource.addFeature(feature);
      });
      
      // Add click interaction
      map.on('click', (event) => {
        const feature = map.forEachFeatureAtPixel(event.pixel, feature => feature);
        
        if (feature) {
          const properties = feature.get('properties') as ResourceLocation;
          setSelectedResource(properties);
          
          if (popupOverlayRef.current) {
            const geometry = feature.getGeometry();
            if (geometry && geometry.getType() === 'Point') {
              const coordinates = (geometry as Point).getCoordinates();
              popupOverlayRef.current.setPosition(coordinates);
            }
          }
        } else {
          setSelectedResource(null);
          
          if (popupOverlayRef.current) {
            popupOverlayRef.current.setPosition(undefined);
          }
        }
      });
      
      // Store map instance
      mapInstanceRef.current = map;
      
      // Make sure map renders properly
      map.updateSize();
      
      // Add a delay before setting loaded state to ensure rendering completes
      setTimeout(() => {
        console.log('OpenLayers map initialized successfully');
        map.updateSize(); // Force map to update its size once more
        setMapLoaded(true);
        setIsLoading(false);
      }, 500);
      
      // Filter markers by category if needed
      if (selectedCategory) {
        filterByCategory(selectedCategory);
      }
      
      // Clean up
      return () => {
        console.log('Cleaning up map');
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setTarget(undefined);
          mapInstanceRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing OpenLayers map:', error);
      setError(`Map initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [initialLat, initialLng, initialZoom]);

  // Force map to update its size when container dimensions change
  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      const updateMapSize = () => {
        if (mapInstanceRef.current) {
          console.log('Updating map size');
          mapInstanceRef.current.updateSize();
        }
      };
      
      // Update immediately and after a short delay
      updateMapSize();
      
      const timer1 = setTimeout(updateMapSize, 100);
      const timer2 = setTimeout(updateMapSize, 500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [mapLoaded, fullScreen]);

  // Listen for window resize events
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        console.log('Window resized, updating map size');
        mapInstanceRef.current.updateSize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Filter features by category
  const filterByCategory = (category: string | null) => {
    setSelectedCategory(category);
    
    let filtered: ResourceLocation[] = [];
    
    if (!mapInstanceRef.current) return;
    
    const vectorLayer = mapInstanceRef.current.getLayers().getArray().find(
      layer => layer instanceof VectorLayer
    ) as VectorLayer<VectorSource>;
    
    if (!vectorLayer) return;
    
    const source = vectorLayer.getSource();
    if (!source) return;
    
    const features = source.getFeatures();
    
    features.forEach(feature => {
      const properties = feature.get('properties') as ResourceLocation;
      
      if (!category || properties.category === category) {
        feature.setStyle(new Style({
          image: new Icon({
            img: createMarkerIcon(properties.category),
            scale: 1
          })
        }));
        filtered.push(properties);
      } else {
        feature.setStyle(new Style({})); // Hide feature
      }
    });
    
    setVisibleResources(filtered);
    
    // Fit map to visible features
    if (filtered.length > 0 && mapInstanceRef.current) {
      const visibleFeatures = features.filter(feature => {
        const properties = feature.get('properties') as ResourceLocation;
        return !category || properties.category === category;
      });
      
      if (visibleFeatures.length > 0) {
        const extent = visibleFeatures.reduce((ext, feature) => {
          const geometry = feature.getGeometry();
          if (geometry) {
            return ext ? [
              Math.min(ext[0], geometry.getExtent()[0]),
              Math.min(ext[1], geometry.getExtent()[1]),
              Math.max(ext[2], geometry.getExtent()[2]),
              Math.max(ext[3], geometry.getExtent()[3])
            ] : geometry.getExtent();
          }
          return ext;
        }, undefined as number[] | undefined);
        
        if (extent) {
          mapInstanceRef.current.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            maxZoom: 14
          });
        }
      }
    }
  };

  // Update filtering when category changes
  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      filterByCategory(selectedCategory);
    }
  }, [selectedCategory, mapLoaded]);

  // Show error state if map failed to load
  if (error) {
    return (
      <div className="w-full p-6 bg-red-50 rounded-lg shadow-inner flex flex-col items-center justify-center" style={{ height: fullScreen ? '600px' : '400px' }}>
        <div className="text-center">
          <div className="bg-red-100 p-3 rounded-full mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-red-600 font-medium mb-2">Failed to load map</p>
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full p-6 bg-gray-50 rounded-lg shadow-inner flex flex-col items-center justify-center" style={{ height: fullScreen ? '600px' : '400px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Loading map resources...</p>
          <p className="text-sm text-gray-500">Initializing map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Category filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Button 
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => filterByCategory(null)}
          className="flex items-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          All Resources ({resourceLocations.length})
        </Button>
        <Button 
          variant={selectedCategory === "shelter" ? "default" : "outline"}
          size="sm"
          onClick={() => filterByCategory("shelter")}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Shelters ({resourceLocations.filter(r => r.category === "shelter").length})
        </Button>
        <Button 
          variant={selectedCategory === "healthcare" ? "default" : "outline"}
          size="sm"
          onClick={() => filterByCategory("healthcare")}
          className="flex items-center gap-2"
        >
          <HeartPulse className="h-4 w-4" />
          Healthcare ({resourceLocations.filter(r => r.category === "healthcare").length})
        </Button>
        <Button 
          variant={selectedCategory === "food" ? "default" : "outline"}
          size="sm" 
          onClick={() => filterByCategory("food")}
          className="flex items-center gap-2"
        >
          <Utensils className="h-4 w-4" />
          Food ({resourceLocations.filter(r => r.category === "food").length})
        </Button>
        <Button 
          variant={selectedCategory === "crisis" ? "default" : "outline"}
          size="sm"
          onClick={() => filterByCategory("crisis")}
          className="flex items-center gap-2"
        >
          <Phone className="h-4 w-4" />
          Crisis Centers ({resourceLocations.filter(r => r.category === "crisis").length})
        </Button>
      </div>
      
      {/* Map container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full rounded-lg overflow-hidden bg-gray-100"
          style={{ height: fullScreen ? '600px' : '400px' }}
        >
          {/* This is an empty container where OpenLayers will render the map */}
        </div>
        
        {/* Hidden popup element for OpenLayers overlay */}
        <div 
          ref={popupRef} 
          className="absolute"
          style={{ display: 'none' }}
        ></div>
        
        {/* Resource information card */}
        {selectedResource && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-xs bg-white p-4 rounded-lg shadow-lg">
            <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedResource(null)}
            >
              &times;
            </button>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-full" style={{backgroundColor: getMarkerColor(selectedResource.category)}}>
                {getCategoryIcon(selectedResource.category)}
              </div>
              <h3 className="text-lg font-bold">{selectedResource.name}</h3>
            </div>
            <div className="space-y-2 mt-4">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-1" />
                <span>{selectedResource.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`tel:${selectedResource.phone}`} className="text-blue-600 hover:underline">
                  {selectedResource.phone}
                </a>
              </p>
            </div>
            <div className="mt-4">
              <Button variant="default" size="sm" className="w-full">
                Get Directions
              </Button>
            </div>
          </div>
        )}
        
        {/* No resources message */}
        {mapLoaded && selectedCategory && visibleResources.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="text-center p-6">
              <p className="text-gray-700 font-medium">No {selectedCategory} resources found in this area.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => filterByCategory(null)}
                className="mt-4"
              >
                Show All Resources
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Show View Full Map button only when not in full screen mode */}
      {!fullScreen && onViewFullMap && (
        <div className="mt-4 text-center">
          <Button onClick={onViewFullMap}>
            View Full Map
          </Button>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
