import { useEffect } from 'react';
import { useAreasStore } from '@/store/areas-store';

/**
 * Hook لاستخدام المناطق والمدن
 * يجلب البيانات تلقائياً من الـ API عند أول استخدام
 */
export function useAreas() {
  const {
    cities,
    regions,
    isLoading,
    error,
    fetchAreas,
    getCityByRegion,
    getRegionsByCity,
    getAllCities,
    getAllRegions,
    addCity,
    addRegion,
    deleteCity,
    deleteRegion,
  } = useAreasStore();

  // جلب البيانات عند أول تحميل
  useEffect(() => {
    if (cities.length === 0 && !isLoading) {
      fetchAreas();
    }
  }, [cities.length, isLoading, fetchAreas]);

  return {
    cities,
    regions,
    isLoading,
    error,
    
    // Helper functions
    getCityByRegion,
    getRegionsByCity,
    getAllCities,
    getAllRegions,
    
    // CRUD operations
    addCity,
    addRegion,
    deleteCity,
    deleteRegion,
    
    // Refresh data
    refresh: fetchAreas,
  };
}
