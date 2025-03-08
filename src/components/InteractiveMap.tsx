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
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface ResourceLocation {
  id: number;
  name: string;
  category: "shelter" | "healthcare" | "food" | "crisis";
  address: string;
  phone: string;
  lat: number;
  lng: number;
}

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
  console.log("Rendering InteractiveMap component");
  
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
  const [mapInitAttempts, setMapInitAttempts] = useState<number>(0);
  const [isContainerReady, setIsContainerReady] = useState<boolean>(false);
  const containerCheckInterval = useRef<number | null>(null);

  const getMarkerColor = (category: string): string => {
    switch (category) {
      case "shelter":
        return "#3b82f6";
      case "healthcare":
        return "#ef4444";
      case "food":
        return "#22c55e";
      case "crisis":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

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

  const createMarkerIcon = (category: string): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    if (context) {
      context.beginPath();
      context.arc(16, 16, 12, 0, 2 * Math.PI);
      context.fillStyle = getMarkerColor(category);
      context.fill();
      context.strokeStyle = 'white';
      context.lineWidth = 3;
      context.stroke();
      
      context.beginPath();
      context.arc(16, 16, 4, 0, 2 * Math.PI);
      context.fillStyle = 'white';
      context.fill();
    }
    return canvas;
  };

  const filterByCategory = (category: string | null) => {
    console.log(`Filtering by category: ${category || 'all'}`);
    setSelectedCategory(category);
    
    if (category === null) {
      setVisibleResources(resourceLocations);
    } else {
      setVisibleResources(resourceLocations.filter(resource => resource.category === category));
    }
    
    if (mapLoaded && mapInstanceRef.current) {
      const vectorLayer = mapInstanceRef.current.getLayers().getArray().find(
        layer => layer instanceof VectorLayer
      ) as VectorLayer<VectorSource> | undefined;
      
      if (vectorLayer && vectorLayer.getSource()) {
        const features = vectorLayer.getSource()?.getFeatures() || [];
        
        features.forEach(feature => {
          const properties = feature.get('properties') as ResourceLocation;
          
          if (category === null || properties.category === category) {
            feature.setStyle(new Style({
              image: new Icon({
                img: createMarkerIcon(properties.category),
                scale: 1
              })
            }));
          } else {
            feature.setStyle(new Style({}));
          }
        });
      }
    }
  };

  useEffect(() => {
    console.log("Checking if container is ready");
    
    const checkContainer = () => {
      if (mapRef.current) {
        const width = mapRef.current.offsetWidth;
        const height = mapRef.current.offsetHeight;
        
        console.log('Map container dimensions:', width, 'x', height);
        
        if (width > 0 && height > 0) {
          console.log('Container is sized and ready');
          setIsContainerReady(true);
          return true;
        }
      }
      return false;
    };

    if (checkContainer()) {
      if (containerCheckInterval.current) {
        clearInterval(containerCheckInterval.current);
        containerCheckInterval.current = null;
      }
      return;
    }
    
    containerCheckInterval.current = window.setInterval(() => {
      if (checkContainer()) {
        if (containerCheckInterval.current) {
          clearInterval(containerCheckInterval.current);
          containerCheckInterval.current = null;
        }
      }
    }, 250);
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          console.log('Container now has dimensions:', 
            entry.contentRect.width, 'x', entry.contentRect.height);
          setIsContainerReady(true);
          
          if (containerCheckInterval.current) {
            clearInterval(containerCheckInterval.current);
            containerCheckInterval.current = null;
          }
        }
      }
    });
    
    if (mapRef.current) {
      observer.observe(mapRef.current);
    }
    
    return () => {
      if (containerCheckInterval.current) {
        clearInterval(containerCheckInterval.current);
        containerCheckInterval.current = null;
      }
      observer.disconnect();
    };
  }, []);

  const initializeMap = () => {
    console.log('Initializing map, container ready:', isContainerReady);
    
    if (!mapRef.current || !isContainerReady) {
      console.error('Map container ref is not available or not sized');
      if (mapInitAttempts > 5) {
        setError('Unable to initialize map: container not available or not sized');
        setIsLoading(false);
      } else {
        setTimeout(() => {
          setMapInitAttempts(prev => prev + 1);
          initializeMap();
        }, 500);
      }
      return;
    }

    try {
      console.log('Initializing OpenLayers map...');
      console.log('Container dimensions:', mapRef.current.offsetWidth, 'x', mapRef.current.offsetHeight);
      setIsLoading(true);
      setError(null);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }

      const vectorSource = new VectorSource();
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        zIndex: 10
      });

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

      if (popupRef.current) {
        popupOverlayRef.current = new Overlay({
          element: popupRef.current,
          autoPan: true,
          positioning: 'bottom-center',
          offset: [0, -15]
        });
        map.addOverlay(popupOverlayRef.current);
      }

      resourceLocations.forEach(location => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([location.lng, location.lat])),
          properties: location
        });

        const markerCanvas = createMarkerIcon(location.category);
        
        const style = new Style({
          image: new Icon({
            img: markerCanvas,
            scale: 1
          })
        });

        feature.setStyle(style);
        vectorSource.addFeature(feature);
      });

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

      mapInstanceRef.current = map;

      map.updateSize();

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.updateSize();
          setMapLoaded(true);
          setIsLoading(false);
          
          if (selectedCategory) {
            filterByCategory(selectedCategory);
          }
          console.log('Map initialization complete and successful');
        }
      }, 500);

    } catch (error) {
      console.error('Error initializing OpenLayers map:', error);
      setError(`Map initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isContainerReady) {
      console.log('Container is ready, initializing map');
      initializeMap();
    }
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, [isContainerReady, initialLat, initialLng, initialZoom]);

  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      filterByCategory(selectedCategory);
    }
  }, [selectedCategory, mapLoaded]);

  if (error) {
    return (
      <div className="w-full p-6 bg-red-50 rounded-lg shadow-inner flex flex-col items-center justify-center" style={{ height: fullScreen ? '600px' : '400px' }}>
        <div className="text-center">
          <div className="bg-red-100 p-3 rounded-full mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-red-600 font-medium mb-2">Failed to load map</p>
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <Button onClick={() => {
            setMapInitAttempts(0);
            setError(null);
            setIsContainerReady(false);
            setTimeout(() => {
              if (mapRef.current && mapRef.current.offsetWidth > 0 && mapRef.current.offsetHeight > 0) {
                setIsContainerReady(true);
              }
            }, 500);
          }}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
      <div className="mb-4 flex flex-wrap gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => filterByCategory(null)}
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                All Resources ({resourceLocations.length})
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Show all resource types
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={selectedCategory === "shelter" ? "default" : "outline"}
                size="sm"
                onClick={() => filterByCategory("shelter")}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Shelters ({resourceLocations.filter(r => r.category === "shelter").length})
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Emergency and transitional shelters
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={selectedCategory === "healthcare" ? "default" : "outline"}
                size="sm"
                onClick={() => filterByCategory("healthcare")}
                className="flex items-center gap-2"
              >
                <HeartPulse className="h-4 w-4" />
                Healthcare ({resourceLocations.filter(r => r.category === "healthcare").length})
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Medical and mental health services
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={selectedCategory === "food" ? "default" : "outline"}
                size="sm" 
                onClick={() => filterByCategory("food")}
                className="flex items-center gap-2"
              >
                <Utensils className="h-4 w-4" />
                Food ({resourceLocations.filter(r => r.category === "food").length})
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Food pantries and meal programs
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={selectedCategory === "crisis" ? "default" : "outline"}
                size="sm"
                onClick={() => filterByCategory("crisis")}
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Crisis Centers ({resourceLocations.filter(r => r.category === "crisis").length})
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Emergency support and crisis intervention
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full rounded-lg overflow-hidden bg-gray-100 shadow-inner"
          style={{ 
            height: fullScreen ? '600px' : '400px',
            border: '1px solid #ddd'
          }}
        ></div>
        
        <div 
          ref={popupRef} 
          className="absolute bg-white rounded-lg shadow-lg p-4 transform -translate-x-1/2 z-50"
          style={{ 
            maxWidth: '250px',
            bottom: '12px',
            pointerEvents: 'auto',
            display: selectedResource ? 'block' : 'none'
          }}
        >
          {selectedResource && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-full" style={{ backgroundColor: getMarkerColor(selectedResource.category) }}>
                  {getCategoryIcon(selectedResource.category)}
                </div>
                <h3 className="font-bold text-sm">{selectedResource.name}</h3>
              </div>
              <p className="text-xs text-gray-600 mb-2">{selectedResource.address}</p>
              <div className="flex items-center gap-1 text-xs text-blue-600 mb-3">
                <Phone className="h-3 w-3" />
                <span>{selectedResource.phone}</span>
              </div>
              <Button size="sm" className="w-full">Get Directions</Button>
            </>
          )}
        </div>
        
        {!fullScreen && onViewFullMap && (
          <div className="absolute bottom-3 right-3">
            <Button 
              variant="secondary" 
              size="sm" 
              className="shadow-md bg-white/90 hover:bg-white text-gray-800"
              onClick={onViewFullMap}
            >
              View Full Map
            </Button>
          </div>
        )}
      </div>
      
      {fullScreen && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <h3 className="font-bold mb-2">Map Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { category: "shelter", label: "Shelters" },
              { category: "healthcare", label: "Healthcare" },
              { category: "food", label: "Food Resources" },
              { category: "crisis", label: "Crisis Centers" }
            ].map((item) => (
              <div key={item.category} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getMarkerColor(item.category) }}></div>
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {fullScreen && (
        <div className="mt-4">
          <h3 className="font-bold mb-3">
            {selectedCategory 
              ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Resources (${visibleResources.length})` 
              : `All Resources (${visibleResources.length})`
            }
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {visibleResources.map((resource) => (
              <div 
                key={resource.id} 
                className="p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-shadow"
                onClick={() => {
                  setSelectedResource(resource);
                  if (mapInstanceRef.current) {
                    const vectorLayer = mapInstanceRef.current.getLayers().getArray().find(
                      layer => layer instanceof VectorLayer
                    ) as VectorLayer<VectorSource> | undefined;
                    
                    if (vectorLayer && vectorLayer.getSource()) {
                      const features = vectorLayer.getSource()?.getFeatures() || [];
                      const resourceFeature = features.find(feature => {
                        const properties = feature.get('properties') as ResourceLocation;
                        return properties.id === resource.id;
                      });
                      
                      if (resourceFeature) {
                        const geometry = resourceFeature.getGeometry();
                        if (geometry && geometry.getType() === 'Point') {
                          const coordinates = (geometry as Point).getCoordinates();
                          mapInstanceRef.current.getView().animate({
                            center: coordinates,
                            zoom: 15,
                            duration: 500
                          });
                          if (popupOverlayRef.current) {
                            popupOverlayRef.current.setPosition(coordinates);
                          }
                        }
                      }
                    }
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full mt-1" style={{ backgroundColor: getMarkerColor(resource.category) }}>
                    {getCategoryIcon(resource.category)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{resource.name}</h4>
                    <p className="text-sm text-gray-600">{resource.address}</p>
                    <div className="flex items-center gap-1 text-sm text-blue-600 mt-1">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{resource.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
