/**
 * ESUM Energy Trading Platform - Utility Functions
 * Common utilities for date, currency, energy unit conversions, and helpers
 */

import { TOUPeriod } from '@esum/shared-types';

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Get the current timestamp in ISO 8601 format
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Parse an ISO 8601 string to a Date object
 */
export function parseISODate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Format a date to a human-readable string
 */
export function formatDate(date: Date | string, locale: string = 'en-ZA'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format a datetime to a human-readable string
 */
export function formatDateTime(date: Date | string, locale: string = 'en-ZA'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get the TOU period for a given hour
 */
export function getTOUPeriod(hour: number): TOUPeriod {
  // Peak hours: 07:00-10:00 and 18:00-20:00
  if ((hour >= 7 && hour < 10) || (hour >= 18 && hour < 20)) {
    return 'peak';
  }
  // Off-peak: 22:00-06:00
  if (hour >= 22 || hour < 6) {
    return 'off_peak';
  }
  // Standard: everything else
  return 'standard';
}

/**
 * Calculate the number of hours between two dates
 */
export function getHoursBetween(start: Date | string, end: Date | string): number {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  const diffMs = endDate.getTime() - startDate.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * Generate an array of hourly timestamps between two dates
 */
export function generateHourlyTimestamps(start: Date, end: Date): string[] {
  const timestamps: string[] = [];
  const current = new Date(start);
  
  while (current <= end) {
    timestamps.push(current.toISOString());
    current.setHours(current.getHours() + 1);
  }
  
  return timestamps;
}

// ============================================================================
// CURRENCY UTILITIES
// ============================================================================

/**
 * Format a number as South African Rand (ZAR)
 */
export function formatZAR(amount: number, options?: { showCents?: boolean; compact?: boolean }): string {
  const { showCents = true, compact = false } = options || {};
  
  if (compact) {
    if (amount >= 1_000_000) {
      return `R${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
      return `R${(amount / 1_000).toFixed(1)}K`;
    }
  }
  
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0
  }).format(amount);
}

/**
 * Parse a ZAR string to a number
 */
export function parseZAR(zarString: string): number {
  const cleaned = zarString.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned);
}

/**
 * Calculate platform fees
 */
export function calculatePlatformFee(amount: number, rate: number = 0.0025): number {
  return amount * rate;
}

/**
 * Calculate carbon fees
 */
export function calculateCarbonFee(amount: number, rate: number = 0.01): number {
  return amount * rate;
}

// ============================================================================
// ENERGY UNIT UTILITIES
// ============================================================================

/**
 * Convert MWh to kWh
 */
export function mwhToKwh(mwh: number): number {
  return mwh * 1000;
}

/**
 * Convert kWh to MWh
 */
export function kwhToMwh(kwh: number): number {
  return kwh / 1000;
}

/**
 * Convert MWh to GWh
 */
export function mwhToGwh(mwh: number): number {
  return mwh / 1000;
}

/**
 * Convert GWh to MWh
 */
export function gwhToMwh(gwh: number): number {
  return gwh * 1000;
}

/**
 * Format energy value with appropriate unit
 */
export function formatEnergy(value: number, unit: 'kwh' | 'mwh' | 'gwh' = 'mwh'): string {
  const formatted = new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
  
  const unitLabels = {
    kwh: 'kWh',
    mwh: 'MWh',
    gwh: 'GWh'
  };
  
  return `${formatted} ${unitLabels[unit]}`;
}

/**
 * Auto-select the best unit for an energy value
 */
export function formatEnergyAuto(value: number): string {
  if (value >= 1_000_000) {
    return formatEnergy(mwhToGwh(value), 'gwh');
  }
  if (value >= 1_000) {
    return formatEnergy(value, 'mwh');
  }
  return formatEnergy(kwhToMwh(value), 'kwh');
}

// ============================================================================
// CARBON UTILITIES
// ============================================================================

/**
 * Grid emission factor for South Africa (kg CO2e per kWh)
 */
export const GRID_EMISSION_FACTOR_KG_CO2E_PER_KWH = 1.04;

/**
 * Carbon tax rate for South Africa (ZAR per tCO2e) - 2025 rate
 */
export const CARBON_TAX_RATE_ZAR_PER_TCO2E = 190;

/**
 * Calculate avoided emissions from renewable energy
 */
export function calculateAvoidedEmissions(renewableMwh: number, lossFactor: number = 0.05): {
  grossMwh: number;
  netMwh: number;
  emissionFactorKgPerKwh: number;
  avoidedTco2e: number;
  equivalentCarbonCredits: number;
} {
  const grossMwh = renewableMwh;
  const netMwh = grossMwh * (1 - lossFactor);
  const emissionFactorKgPerKwh = GRID_EMISSION_FACTOR_KG_CO2E_PER_KWH;
  const avoidedTco2e = (netMwh * 1000 * emissionFactorKgPerKwh) / 1000; // Convert to tCO2e
  const equivalentCarbonCredits = avoidedTco2e; // 1 credit = 1 tCO2e
  
  return {
    grossMwh,
    netMwh,
    emissionFactorKgPerKwh,
    avoidedTco2e,
    equivalentCarbonCredits
  };
}

/**
 * Calculate carbon tax liability
 */
export function calculateCarbonTaxLiability(
  gridConsumptionMwh: number,
  carbonCreditsRetired: number = 0
): {
  grossEmissions: number;
  offsets: number;
  netEmissions: number;
  taxRate: number;
  grossLiability: number;
  offsetSavings: number;
  netLiability: number;
} {
  const grossEmissions = (gridConsumptionMwh * 1000 * GRID_EMISSION_FACTOR_KG_CO2E_PER_KWH) / 1000;
  const offsets = carbonCreditsRetired;
  const netEmissions = Math.max(0, grossEmissions - offsets);
  const taxRate = CARBON_TAX_RATE_ZAR_PER_TCO2E;
  const grossLiability = grossEmissions * taxRate;
  const offsetSavings = offsets * taxRate;
  const netLiability = netEmissions * taxRate;
  
  return {
    grossEmissions,
    offsets,
    netEmissions,
    taxRate,
    grossLiability,
    offsetSavings,
    netLiability
  };
}

// ============================================================================
// MATH UTILITIES
// ============================================================================

/**
 * Round to a specific number of decimal places
 */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, whole: number): number {
  if (whole === 0) return 0;
  return (part / whole) * 100;
}

/**
 * Calculate weighted average
 */
export function weightedAverage(values: number[], weights: number[]): number {
  if (values.length !== weights.length) {
    throw new Error('Values and weights must have the same length');
  }
  
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) return 0;
  
  const weightedSum = values.reduce((sum, v, i) => sum + v * weights[i], 0);
  return weightedSum / totalWeight;
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a trace ID for API requests
 */
export function generateTraceId(): string {
  return generateUUID();
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate an email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate a UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate a South African ID number
 */
export function isValidSAIDNumber(idNumber: string): boolean {
  const idRegex = /^\d{13}$/;
  if (!idRegex.test(idNumber)) return false;
  
  // Basic validation - check digit calculation could be added
  const year = parseInt(idNumber.substring(0, 2), 10);
  const month = parseInt(idNumber.substring(2, 4), 10);
  const day = parseInt(idNumber.substring(4, 6), 10);
  
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  return true;
}

/**
 * Validate a South African tax number
 */
export function isValidSATaxNumber(taxNumber: string): boolean {
  const taxRegex = /^\d{10}$/;
  return taxRegex.test(taxNumber);
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Convert a string to title case
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/**
 * Convert a string to slug case
 */
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Format a number with thousands separators
 */
export function formatNumber(num: number, locale: string = 'en-ZA'): string {
  return new Intl.NumberFormat(locale).format(num);
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Pick specific keys from an object
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit specific keys from an object
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}

/**
 * Check if an object is empty
 */
export function isEmpty(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0;
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Chunk an array into smaller arrays of a specified size
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Remove duplicates from an array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Group an array by a key
 */
export function groupBy<T extends Record<string, unknown>, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
}

// ============================================================================
// PLATFORM CONSTANTS
// ============================================================================

export const PLATFORM_FEE_RATE = 0.0025; // 0.25%
export const CARBON_FEE_RATE = 0.01; // 1%

export const TOU_PEAK_HOURS = {
  morning: { start: 7, end: 10 },
  evening: { start: 18, end: 20 }
};

export const HOURS_IN_YEAR = 8760;
export const HOURS_IN_DAY = 24;
export const DAYS_IN_YEAR = 365;

export const MWH_TO_KWH = 1000;
export const TCO2E_TO_KG = 1000;

export const SOUTH_AFRICAN_PROVINCES = [
  'eastern_cape',
  'free_state',
  'gauteng',
  'kwazulu_natal',
  'limpopo',
  'mpumalanga',
  'northern_cape',
  'north_west',
  'western_cape'
] as const;
