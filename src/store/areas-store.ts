
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type Area = {
  id: string;
  name: string;
};

export type City = {
  id: string;
  name: string;
  areas: Area[];
};

const initialCities: City[] = [
  {
    id: 'amman',
    name: 'عمان',
    areas: [
      { id: 'amman-1', name: 'الصويفية' },
      { id: 'amman-2', name: 'تلاع العلي' },
      { id: 'amman-3', name: 'الجبيهة' },
    ],
  },
  {
    id: 'zarqa',
    name: 'الزرقاء',
    areas: [
        { id: 'zarqa-1', name: 'حي معصوم' },
        { id: 'zarqa-2', name: 'الزرقاء الجديدة' },
    ],
  },
  {
    id: 'irbid',
    name: 'إربد',
    areas: [
        { id: 'irbid-1', name: 'الحي الشرقي' },
        { id: 'irbid-2', name: 'شارع الجامعة' },
    ],
  },
];

type AreasState = {
  cities: City[];
  setCities: (cities: City[]) => void;
  addCity: (name: string, id?: string) => void;
  updateCity: (cityId: string, updates: Partial<Omit<City, 'id' | 'areas'>>) => void;
  deleteCity: (cityId: string) => void;
  addArea: (cityId: string, areaName: string, id?: string) => void;
  updateArea: (cityId: string, areaId: string, updates: Partial<Omit<Area, 'id'>>) => void;
  deleteArea: (cityId: string, areaId: string) => void;
};

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const useAreasStore = create<AreasState>()(immer((set) => ({
  cities: initialCities,

  setCities: (cities) => {
    set({ cities });
  },

  addCity: (name, id) => {
    set(state => {
      const cityId = id || generateId(name.toLowerCase().replace(/\s+/g, '-'));
      if (state.cities.some(c => c.id === cityId)) {
        console.warn(`City with id ${cityId} already exists.`);
        return;
      }
      state.cities.push({
        id: cityId,
        name,
        areas: [],
      });
    });
  },

  updateCity: (cityId, updates) => {
    set(state => {
      const city = state.cities.find(c => c.id === cityId);
      if (city) {
        Object.assign(city, updates);
      }
    });
  },

  deleteCity: (cityId) => {
    set(state => {
      state.cities = state.cities.filter(c => c.id !== cityId);
    });
  },

  addArea: (cityId, areaName, id) => {
    set(state => {
      const city = state.cities.find(c => c.id === cityId);
      if (city) {
        const areaId = id || generateId(areaName.toLowerCase().replace(/\s+/g, '-'));
        if (city.areas.some(a => a.id === areaId)) {
             console.warn(`Area with id ${areaId} already exists in city ${cityId}.`);
             return;
        }
        city.areas.push({
          id: areaId,
          name: areaName,
        });
      }
    });
  },

  updateArea: (cityId, areaId, updates) => {
    set(state => {
      const city = state.cities.find(c => c.id === cityId);
      if (city) {
        const area = city.areas.find(a => a.id === areaId);
        if (area) {
          Object.assign(area, updates);
        }
      }
    });
  },

  deleteArea: (cityId, areaId) => {
    set(state => {
      const city = state.cities.find(c => c.id === cityId);
      if (city) {
        city.areas = city.areas.filter(a => a.id !== areaId);
      }
    });
  },
})));
