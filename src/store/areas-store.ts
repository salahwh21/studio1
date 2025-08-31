
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
  addCity: (name: string) => void;
  updateCity: (cityId: string, updates: Partial<Omit<City, 'id' | 'areas'>>) => void;
  deleteCity: (cityId: string) => void;
  addArea: (cityId: string, areaName: string) => void;
  updateArea: (cityId: string, areaId: string, updates: Partial<Omit<Area, 'id'>>) => void;
  deleteArea: (cityId: string, areaId: string) => void;
};

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const useAreasStore = create<AreasState>()(immer((set) => ({
  cities: initialCities,

  addCity: (name) => {
    set(state => {
      state.cities.push({
        id: generateId(name.toLowerCase()),
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

  addArea: (cityId, areaName) => {
    set(state => {
      const city = state.cities.find(c => c.id === cityId);
      if (city) {
        city.areas.push({
          id: generateId(areaName.toLowerCase()),
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
