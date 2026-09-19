import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  Navigation,
  ExternalLink,
  Search,
  X,
  AlertCircle,
  Loader2,
  Share2,
} from 'lucide-react';
import { LocationData, PlaceItem } from '../types';

interface LocationDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareToChat: (location: LocationData) => void;
}

export const LocationDiscoveryModal: React.FC<LocationDiscoveryModalProps> = ({
  isOpen,
  onClose,
  onShareToChat,
}) => {
  const [permissionState, setPermissionState] = useState<'idle' | 'prompting' | 'granted' | 'denied'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [searchCategory, setSearchCategory] = useState<string>('restaurant');
  const [isSearchingNearby, setIsSearchingNearby] = useState(false);

  if (!isOpen) return null;

  const categories = [
    { id: 'restaurant', label: 'چێشتخانە و خواردنگە', icon: '🍽️' },
    { id: 'hospital', label: 'نەخۆشخانە و تەندروستی', icon: '🏥' },
    { id: 'pharmacy', label: 'دەرمانخانە', icon: '💊' },
    { id: 'supermarket', label: 'مارکێت و بازاڕ', icon: '🛒' },
    { id: 'fuel', label: 'بەنزینخانە', icon: '⛽' },
    { id: 'park', label: 'باخچە و پارک', icon: '🌳' },
  ];

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('ئامێرەکەت یان وێبگەڕەکەت پشتگیری دەستنیشانکردنی شوێن (Geolocation) ناکات.');
      setPermissionState('denied');
      return;
    }

    setPermissionState('prompting');
    setIsLoading(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setPermissionState('granted');
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        try {
          // Fetch reverse geocode from backend
          const res = await fetch(`/api/location/reverse?lat=${lat}&lng=${lng}`);
          const data = await res.json();

          const loc: LocationData = {
            lat,
            lng,
            accuracy,
            address: data.formattedKurdish || data.displayName || 'شوێنی دیاریکراو',
            city: data.city,
            country: data.country,
          };

          setCurrentLocation(loc);
          // Automatically fetch default nearby places
          fetchNearbyPlaces(lat, lng, searchCategory, loc);
        } catch {
          const loc: LocationData = {
            lat,
            lng,
            accuracy,
            address: `پێوانەی ڕاستەقینە: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          };
          setCurrentLocation(loc);
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setIsLoading(false);
        setPermissionState('denied');
        if (err.code === 1) {
          setErrorMsg('ڕێگەپێدانی شوێن (Location Permission) ڕەتکرایەوە لەلایەن تۆوە. باسۆکا بەبێ ڕێگەپێدان هیچ زانیارییەک دروست ناکات.');
        } else {
          setErrorMsg(`هەڵە لە وەرگرتنی شوێن: ${err.message}`);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchNearbyPlaces = async (
    lat: number,
    lng: number,
    cat: string,
    currentLoc?: LocationData
  ) => {
    setIsSearchingNearby(true);
    try {
      const res = await fetch(`/api/location/nearby?lat=${lat}&lng=${lng}&query=${encodeURIComponent(cat)}`);
      const data = await res.json();
      const places: PlaceItem[] = data.places || [];

      const target = currentLoc || currentLocation;
      if (target) {
        const updated = {
          ...target,
          nearbyPlaces: places,
        };
        setCurrentLocation(updated);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsSearchingNearby(false);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setSearchCategory(cat);
    if (currentLocation) {
      fetchNearbyPlaces(currentLocation.lat, currentLocation.lng, cat);
    }
  };

  const handleShare = () => {
    if (currentLocation) {
      onShareToChat(currentLocation);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">دۆزینەوەی شوێن و نەخشە (Location Discovery)</h3>
              <p className="text-xs text-slate-400">دەستنیشانکردنی پێوانەی ڕاستەقینە، ناونیشان و شوێنە نزیکەکان</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {permissionState === 'idle' && (
            <div className="p-6 text-center space-y-4 rounded-xl border border-slate-800 bg-slate-950/40">
              <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <MapPin className="w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-slate-200">داواکردنی ڕێگەپێدانی شوێن</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  بۆ دۆزینەوەی شوێنە نزیکەکان (وەک نەخۆشخانە، دەرمانخانە، خواردنگەکان)، دووری بە کیلۆمەتر و بینینی نەخشە، پێویستە ڕێگە بە وێبگەڕەکەت بدەیت. باسۆکا هەرگیز شوێنی ساختە بەکارناهێنێت.
                </p>
              </div>
              <button
                onClick={handleRequestLocation}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 mx-auto transition-all shadow-md active:scale-95"
              >
                <Navigation className="w-4 h-4" />
                <span>پشکنین و دیاریکردنی شوێنی من</span>
              </button>
            </div>
          )}

          {isLoading && (
            <div className="p-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-cyan-400" />
              <p className="text-xs text-slate-300">وەرگرتنی پێوانەی جوگرافی و ناونیشانی ناوچەکە لە نەخشە...</p>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold">ئاگاداری لەسەر ڕێگەپێدان:</div>
                <div>{errorMsg}</div>
              </div>
            </div>
          )}

          {currentLocation && (
            <div className="space-y-4 animate-fade-in">
              {/* Location Card */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>شوێنی ئێستای تۆ:</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono" dir="ltr">
                    {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-100">
                  {currentLocation.address}
                </div>
                {currentLocation.accuracy && (
                  <div className="text-[11px] text-slate-400">
                    وردبینی پێوانەکە: تا نزیکەی ±{Math.round(currentLocation.accuracy)} مەتر
                  </div>
                )}
              </div>

              {/* Interactive OpenStreetMap Embed */}
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[16/9] relative">
                <iframe
                  title="نەخشەی شوێنی بەکارهێنەر"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentLocation.lng - 0.01}%2C${currentLocation.lat - 0.01}%2C${currentLocation.lng + 0.01}%2C${currentLocation.lat + 0.01}&amp;layer=mapnik&amp;marker=${currentLocation.lat}%2C${currentLocation.lng}`}
                  className="w-full h-full"
                />
                <div className="absolute bottom-2 left-2 z-10">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${currentLocation.lat},${currentLocation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded bg-slate-900/90 text-cyan-300 text-[11px] border border-slate-700/80 hover:bg-slate-800 flex items-center gap-1 shadow"
                  >
                    <span>کردنەوە لە Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Nearby Categories */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-cyan-400" />
                    گەڕان بەدوای شوێنە نزیکەکاندا:
                  </span>
                  {isSearchingNearby && <span className="text-[11px] text-cyan-400 animate-pulse">دەگەڕێت...</span>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleCategoryChange(c.id)}
                      className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 border transition-all text-right ${
                        searchCategory === c.id
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{c.icon}</span>
                      <span className="truncate">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nearby Places List */}
              {currentLocation.nearbyPlaces && currentLocation.nearbyPlaces.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-400">
                    شوێنە نزیکەکان (ڕیزکراو بەپێی کەمترین دووری):
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {currentLocation.nearbyPlaces.map((place) => (
                      <div
                        key={place.id}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-semibold text-slate-200 truncate">{place.name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{place.address}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/60 text-cyan-300 font-mono text-[10px]">
                            {place.distanceKm} km
                          </span>
                          <a
                            href={place.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="ڕێنمایی و ڕێڕەو"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                !isSearchingNearby && (
                  <div className="text-center py-4 text-xs text-slate-500">
                    هیچ شوێنێک لەم کاتیگۆرییەدا لە دەوروبەری ئەم شوێنە نەدۆزرایەوە.
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            داخستن
          </button>
          {currentLocation && (
            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>ناردنی زانیاری شوێن بۆ چات</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
