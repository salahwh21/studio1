
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

const defaultCities: City[] = [
    {
        "id": "CITY_AMM", "name": "عمان", "areas": [
            { "id": "REG_AMM_001", "name": "تلاع العلي" }, { "id": "REG_AMM_002", "name": "الصويفية" },
            { "id": "REG_AMM_003", "name": "الجبيهة" }, { "id": "REG_AMM_004", "name": "خلدا" },
            { "id": "REG_AMM_005", "name": "أم السماق" }, { "id": "REG_AMM_006", "name": "الدوار السابع" },
            { "id": "REG_AMM_007", "name": "العبدلي" }, { "id": "REG_AMM_008", "name": "جبل عمان" },
            { "id": "REG_AMM_009", "name": "المدينة الرياضية" }, { "id": "REG_AMM_010", "name": "ضاحية الرشيد" }
        ]
    },
    {
        "id": "CITY_ZAR", "name": "الزرقاء", "areas": [
            { "id": "REG_ZAR_001", "name": "الزرقاء الجديدة" }, { "id": "REG_ZAR_002", "name": "حي معصوم" },
            { "id": "REG_ZAR_003", "name": "عوجان" }, { "id": "REG_ZAR_004", "name": "الجبل الأبيض" }
        ]
    },
    {
        "id": "CITY_IRB", "name": "إربد", "areas": [
            { "id": "REG_IRB_001", "name": "الحي الشرقي" }, { "id": "REG_IRB_002", "name": "شارع الجامعة" },
            { "id": "REG_IRB_003", "name": "الحصن" }, { "id": "REG_IRB_004", "name": "البارحة" }
        ]
    },
    {
        "id": "CITY_AQA", "name": "العقبة", "areas": [
            { "id": "REG_AQA_001", "name": "المنطقة التجارية" }, { "id": "REG_AQA_002", "name": "الشاطئ الجنوبي" }
        ]
    },
    {
        "id": "CITY_SLT", "name": "السلط", "areas": [
            { "id": "REG_SLT_001", "name": "وسط البلد" }, { "id": "REG_SLT_002", "name": "زي" }
        ]
    }
];


// Use a deep copy for the initial state to prevent mutation issues
const getInitialCities = () => JSON.parse(JSON.stringify(defaultCities));

type AreasState = {
  cities: City[];
  setCities: (cities: City[]) => void;
  restoreDefaults: () => void;
  addCity: (name: string, id?: string) => void;
  updateCity: (cityId: string, updates: Partial<Omit<City, 'id' | 'areas'>>) => void;
  deleteCity: (cityId: string) => void;
  addArea: (cityId: string, areaName: string, id?: string) => void;
  updateArea: (cityId: string, areaId: string, updates: Partial<Omit<Area, 'id'>>) => void;
  deleteArea: (cityId: string, areaId: string) => void;
};

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const useAreasStore = create<AreasState>()(immer((set) => ({
  cities: getInitialCities(),

  setCities: (cities) => {
    set({ cities });
  },

  restoreDefaults: () => {
    set({ cities: getInitialCities() });
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
