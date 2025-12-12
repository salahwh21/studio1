import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

export interface Region {
  id: string;
  name: string;
  cityId?: string;
}

export type Area = Region;

export interface City {
  id: string;
  name: string;
  regions?: Region[];
  areas?: Region[]; // Alias
}

interface AreasState {
  cities: City[];
  regions: Region[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;

  // Actions
  setCities: (cities: City[]) => void;
  fetchAreas: () => Promise<void>;
  getCityByRegion: (regionName: string) => string;
  getRegionsByCity: (cityName: string) => string[];
  getAllCities: () => string[];
  getAllRegions: () => string[];
  addCity: (name: string, id?: string) => Promise<void>;
  updateCity: (id: string, data: Partial<City>) => Promise<void>;
  deleteCity: (id: string) => Promise<void>;
  addRegion: (name: string, cityId: string) => Promise<void>;
  deleteRegion: (id: string) => Promise<void>;

  // Aliases and Compatibility
  addArea: (cityId: string, name: string, id?: string) => Promise<void>;
  updateArea: (cityId: string, areaId: string, data: Partial<Area>) => Promise<void>;
  deleteArea: (cityId: string, areaId: string) => Promise<void>;
  restoreDefaults: () => Promise<void>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useAreasStore = create<AreasState>()(
  persist(
    (set, get) => ({
      cities: [],
      regions: [],
      isLoading: false,
      error: null,
      lastFetch: null,

      setCities: (cities) => set({ cities }),

      fetchAreas: async () => {
        const { lastFetch } = get();
        const now = Date.now();

        if (lastFetch && now - lastFetch < CACHE_DURATION) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const data = await api.getAreas();

          const cities: City[] = data.map((city: any) => ({
            id: city.id,
            name: city.name,
            regions: city.regions || city.areas || [],
            areas: city.regions || city.areas || []
          }));

          const regions: Region[] = cities.flatMap(city =>
            (city.regions || []).map(region => ({
              ...region,
              cityId: city.id
            }))
          );

          set({
            cities,
            regions,
            isLoading: false,
            lastFetch: now
          });
        } catch (error: any) {
          console.error('❌ Failed to fetch areas from API:', error.message);
          set({
            cities: [],
            regions: [],
            isLoading: false,
            error: 'Failed to load areas. Please ensure backend is running.',
            lastFetch: null
          });
        }
      },

      getCityByRegion: (regionName: string) => {
        const { regions, cities } = get();
        const region = regions.find(r => r.name === regionName);
        if (!region || !region.cityId) return '';

        const city = cities.find(c => c.id === region.cityId);
        return city?.name || '';
      },

      getRegionsByCity: (cityName: string) => {
        const { cities } = get();
        const city = cities.find(c => c.name === cityName);
        return city?.regions?.map(r => r.name) || [];
      },

      getAllCities: () => {
        const { cities } = get();
        return cities.map(c => c.name);
      },

      getAllRegions: () => {
        const { regions } = get();
        return regions.map(r => r.name);
      },

      addCity: async (name: string, id?: string) => {
        try {
          const newCity = await api.createCity(name);
          // If ID is provided manually, use it if not already in newCity
          const cityWithId = id ? { ...newCity, id } : newCity;

          set(state => ({
            cities: [...state.cities, { ...cityWithId, regions: [], areas: [] }]
          }));
        } catch (error) {
          console.error('Failed to add city:', error);
          throw error;
        }
      },

      updateCity: async (id: string, data: Partial<City>) => {
        set(state => ({
          cities: state.cities.map(c => c.id === id ? { ...c, ...data } : c)
        }));
      },

      addRegion: async (name: string, cityId: string) => {
        try {
          const newRegion = await api.createRegion(name, cityId);
          set(state => ({
            regions: [...state.regions, newRegion],
            cities: state.cities.map(city =>
              city.id === cityId
                ? { ...city, regions: [...(city.regions || []), newRegion], areas: [...(city.areas || []), newRegion] }
                : city
            )
          }));
        } catch (error) {
          console.error('Failed to add region:', error);
          throw error;
        }
      },

      deleteCity: async (id: string) => {
        try {
          await api.deleteCity(id);
          set(state => ({
            cities: state.cities.filter(c => c.id !== id),
            regions: state.regions.filter(r => r.cityId !== id)
          }));
        } catch (error) {
          console.error('Failed to delete city:', error);
          throw error;
        }
      },

      deleteRegion: async (id: string) => {
        try {
          await api.deleteRegion(id);
          set(state => ({
            regions: state.regions.filter(r => r.id !== id),
            cities: state.cities.map(city => ({
              ...city,
              regions: city.regions?.filter(r => r.id !== id),
              areas: city.areas?.filter(r => r.id !== id)
            }))
          }));
        } catch (error) {
          console.error('Failed to delete region:', error);
          throw error;
        }
      },

      // Aliases
      addArea: async (cityId, name, id) => {
        await get().addRegion(name, cityId);
      },
      updateArea: async (cityId, areaId, data) => {
        set(state => ({
          regions: state.regions.map(r => r.id === areaId ? { ...r, ...data } : r),
          cities: state.cities.map(c =>
            c.id === cityId ? {
              ...c,
              regions: c.regions?.map(r => r.id === areaId ? { ...r, ...data } : r),
              areas: c.areas?.map(r => r.id === areaId ? { ...r, ...data } : r)
            } : c
          )
        }));
      },
      deleteArea: async (cityId, areaId) => {
        await get().deleteRegion(areaId);
      },
      restoreDefaults: async () => {
        await get().fetchAreas();
      }
    }),
    {
      name: 'areas-storage',
      partialize: (state) => ({
        cities: state.cities,
        regions: state.regions,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
