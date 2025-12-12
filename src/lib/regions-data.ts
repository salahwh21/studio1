/**
 * @deprecated هذا الملف قديم - جميع البيانات الآن في قاعدة البيانات
 * استخدم useAreas() hook أو useAreasStore() بدلاً منه
 * 
 * ⚠️ لا توجد بيانات محلية - كل شيء يأتي من قاعدة البيانات
 */

import { useAreasStore } from '@/store/areas-store';

export interface RegionData {
  region: string;
  city: string;
  address?: string;
}

/**
 * @deprecated لا توجد بيانات محلية - استخدم قاعدة البيانات
 */
export const JORDAN_REGIONS: RegionData[] = [];

/**
 * @deprecated لا توجد بيانات محلية - استخدم قاعدة البيانات
 */
export const CITIES: string[] = [];

/**
 * @deprecated لا توجد بيانات محلية - استخدم قاعدة البيانات
 */
export const REGIONS: string[] = [];

/**
 * الحصول على المدينة من اسم المنطقة
 * @deprecated استخدم useAreas().getCityByRegion() بدلاً منه
 */
export function getCityByRegion(region: string): string {
  const store = useAreasStore.getState();
  return store.getCityByRegion(region);
}

/**
 * الحصول على المناطق حسب المدينة
 * @deprecated استخدم useAreas().getRegionsByCity() بدلاً منه
 */
export function getRegionsByCity(city: string): string[] {
  const store = useAreasStore.getState();
  return store.getRegionsByCity(city);
}

/**
 * الحصول على جميع المدن
 * @deprecated استخدم useAreas().getAllCities() بدلاً منه
 */
export function getAllCities(): string[] {
  const store = useAreasStore.getState();
  return store.getAllCities();
}

/**
 * الحصول على جميع المناطق
 * @deprecated استخدم useAreas().getAllRegions() بدلاً منه
 */
export function getAllRegions(): string[] {
  const store = useAreasStore.getState();
  return store.getAllRegions();
}
