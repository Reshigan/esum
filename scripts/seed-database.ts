/**
 * ESUM Energy Trading Platform - Database Seed Script
 * Generates realistic seed data for development and testing
 */

import { generateUUID, getCurrentTimestamp } from '@esum/utils';

interface SeedConfig {
  organisations: number;
  users: number;
  instruments: number;
  loadProfiles: number;
  gridDataDays: number;
}

const config: SeedConfig = {
  organisations: 20,
  users: 40,
  instruments: 25,
  loadProfiles: 5,
  gridDataDays: 90
};

// Deterministic random number generator with seed
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
  
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
  
  choice<T>(array: T[]): T {
    return array[this.int(0, array.length - 1)];
  }
}

const rng = new SeededRandom(42); // Fixed seed for reproducibility

// ============================================================================
// ORGANISATION DATA
// ============================================================================

const organisationTypes = ['buyer', 'seller', 'trader', 'aggregator', 'municipality', 'carbon_fund', 'institutional_investor', 'system_operator'] as const;
const provinces = ['eastern_cape', 'free_state', 'gauteng', 'kwazulu_natal', 'limpopo', 'mpumalanga', 'northern_cape', 'north_west', 'western_cape'] as const;

const buyerNames = [
  'Anglo American Mining',
  'Sasol Manufacturing',
  'Shoprite Retail Chain',
  'Teraco Data Centres',
  'Tongaat Hulett Agriculture'
];

const sellerNames = [
  'SolarCo Energy',
  'WindForce Power',
  'GreenGen Renewables',
  'AfriSun Solar',
  'Cape Wind Farms'
];

const municipalityNames = [
  'City of Johannesburg',
  'City of Cape Town',
  'eThekwini Municipality'
];

const carbonFundNames = [
  'SA Carbon Fund',
  'Green Climate Partners',
  'African Carbon Trust'
];

function generateOrganisations(db: D1Database) {
  const organisations: any[] = [];
  const now = getCurrentTimestamp();
  
  // 5 buyers
  for (let i = 0; i < 5; i++) {
    organisations.push({
      id: generateUUID(),
      name: buyerNames[i],
      type: 'buyer',
      status: 'active',
      contact_email: `buyer${i + 1}@example.co.za`,
      province: rng.choice(provinces),
      city: 'Johannesburg',
      address_line1: `${rng.int(1, 999)} Main Road`,
      postal_code: `${rng.int(2000, 2999)}`,
      annual_consumption_gwh: rng.range(50, 500),
      kyc_status: 'approved',
      kyc_approved_at: now,
      created_at: now,
      updated_at: now
    });
  }
  
  // 5 sellers (IPPs)
  for (let i = 0; i < 5; i++) {
    organisations.push({
      id: generateUUID(),
      name: sellerNames[i],
      type: 'seller',
      status: 'active',
      contact_email: `seller${i + 1}@example.co.za`,
      province: rng.choice(provinces),
      city: 'Cape Town',
      address_line1: `${rng.int(1, 999)} Energy Park`,
      postal_code: `${rng.int(7000, 7999)}`,
      generation_capacity_mw: rng.range(10, 150),
      kyc_status: 'approved',
      kyc_approved_at: now,
      created_at: now,
      updated_at: now
    });
  }
  
  // 2 traders
  for (let i = 0; i < 2; i++) {
    organisations.push({
      id: generateUUID(),
      name: `Energy Trader ${i + 1}`,
      type: 'trader',
      status: 'active',
      contact_email: `trader${i + 1}@example.co.za`,
      province: 'gauteng',
      city: 'Johannesburg',
      kyc_status: 'approved',
      kyc_approved_at: now,
      created_at: now,
      updated_at: now
    });
  }
  
  // 3 municipalities
  for (let i = 0; i < 3; i++) {
    organisations.push({
      id: generateUUID(),
      name: municipalityNames[i],
      type: 'municipality',
      status: 'active',
      contact_email: `energy@${municipalityNames[i].toLowerCase().replace(/ /g, '')}.gov.za`,
      province: rng.choice(provinces),
      city: municipalityNames[i].replace('City of ', '').replace(' Municipality', ''),
      kyc_status: 'approved',
      kyc_approved_at: now,
      created_at: now,
      updated_at: now
    });
  }
  
  // 3 carbon funds
  for (let i = 0; i < 3; i++) {
    organisations.push({
      id: generateUUID(),
      name: carbonFundNames[i],
      type: 'carbon_fund',
      status: 'active',
      contact_email: `fund${i + 1}@example.co.za`,
      province: 'gauteng',
      city: 'Johannesburg',
      kyc_status: 'approved',
      kyc_approved_at: now,
      created_at: now,
      updated_at: now
    });
  }
  
  // 1 institutional investor
  organisations.push({
    id: generateUUID(),
    name: 'Public Investment Corporation',
    type: 'institutional_investor',
    status: 'active',
    contact_email: 'energy@pic.gov.za',
    province: 'gauteng',
    city: 'Johannesburg',
    kyc_status: 'approved',
    kyc_approved_at: now,
    created_at: now,
    updated_at: now
  });
  
  // 1 system operator
  organisations.push({
    id: generateUUID(),
    name: 'Eskom System Operator',
    type: 'system_operator',
    status: 'active',
    contact_email: 'operator@eskom.co.za',
    province: 'gauteng',
    city: 'Johannesburg',
    kyc_status: 'approved',
    kyc_approved_at: now,
    created_at: now,
    updated_at: now
  });
  
  return organisations;
}

// ============================================================================
// USER DATA
// ============================================================================

function generateUsers(db: D1Database, organisationIds: string[]) {
  const users: any[] = [];
  const now = getCurrentTimestamp();
  const roles = ['org_admin', 'trader', 'analyst'] as const;
  
  // 2 users per organisation
  for (const orgId of organisationIds) {
    for (let i = 0; i < 2; i++) {
      const password = 'password123';
      const passwordHash = Array.from(new Uint8Array(
        crypto.subtle.digestSync('SHA-256', new TextEncoder().encode(password))
      )).map(b => b.toString(16).padStart(2, '0')).join('');
      
      users.push({
        id: generateUUID(),
        organisation_id: orgId,
        email: `user${users.length + 1}@example.co.za`,
        name: `User ${users.length + 1}`,
        role: i === 0 ? 'org_admin' : rng.choice(roles),
        status: 'active',
        password_hash: passwordHash,
        created_at: now,
        updated_at: now
      });
    }
  }
  
  // 2 platform admins
  for (let i = 0; i < 2; i++) {
    users.push({
      id: generateUUID(),
      organisation_id: organisationIds[0],
      email: `admin${i + 1}@esum.energy`,
      name: `Platform Admin ${i + 1}`,
      role: 'platform_admin',
      status: 'active',
      created_at: now,
      updated_at: now
    });
  }
  
  // 1 super admin
  users.push({
    id: generateUUID(),
    organisation_id: organisationIds[0],
    email: 'superadmin@esum.energy',
    name: 'Super Administrator',
    role: 'super_admin',
    status: 'active',
    created_at: now,
    updated_at: now
  });
  
  return users;
}

// ============================================================================
// INSTRUMENT DATA
// ============================================================================

function generateInstruments(db: D1Database, sellerIds: string[]) {
  const instruments: any[] = [];
  const now = getCurrentTimestamp();
  const energySources = ['solar', 'wind', 'hydro', 'biomass', 'mixed_renewable'] as const;
  const instrumentTypes = ['physical_ppa', 'virtual_ppa', 'rec', 'carbon_credit', 'bundled_green'] as const;
  
  // 8 physical PPAs
  for (let i = 0; i < 8; i++) {
    const source = i < 5 ? 'solar' : i < 7 ? 'wind' : 'mixed_renewable';
    const capacity = source === 'solar' ? rng.range(10, 100) : rng.range(50, 150);
    const price = source === 'solar' ? rng.range(0.55, 0.85) : rng.range(0.50, 0.75);
    
    instruments.push({
      id: generateUUID(),
      name: `${source === 'solar' ? 'Solar' : source === 'wind' ? 'Wind' : 'Mixed'} PPA ${i + 1}`,
      type: 'physical_ppa',
      status: 'active',
      seller_org_id: sellerIds[i % sellerIds.length],
      energy_source: source,
      province: rng.choice(provinces),
      capacity_mw: capacity,
      annual_generation_gwh: capacity * rng.range(1.5, 3.0),
      unit_price_zar: price,
      price_type: 'fixed',
      min_order_volume_mwh: 100,
      carbon_credits_included: rng.next() > 0.5,
      created_by_user_id: generateUUID(),
      created_at: now,
      updated_at: now
    });
  }
  
  // 3 virtual PPAs
  for (let i = 0; i < 3; i++) {
    instruments.push({
      id: generateUUID(),
      name: `Virtual PPA ${i + 1}`,
      type: 'virtual_ppa',
      status: 'active',
      seller_org_id: sellerIds[i % sellerIds.length],
      energy_source: 'solar',
      unit_price_zar: rng.range(0.60, 0.80),
      price_type: 'indexed',
      price_index: 'Eskom Megaflex',
      contract_tenor_months: rng.choice([60, 84, 120]),
      created_by_user_id: generateUUID(),
      created_at: now,
      updated_at: now
    });
  }
  
  // 5 RECs
  for (let i = 0; i < 5; i++) {
    instruments.push({
      id: generateUUID(),
      name: `Renewable Energy Certificates Batch ${i + 1}`,
      type: 'rec',
      status: 'active',
      seller_org_id: sellerIds[i % sellerIds.length],
      energy_source: rng.choice(energySources),
      available_volume_mwh: rng.int(1000, 10000),
      unit_price_zar: rng.range(50, 150),
      price_type: 'fixed',
      created_by_user_id: generateUUID(),
      created_at: now,
      updated_at: now
    });
  }
  
  // 5 carbon credits
  const standards = ['gold_standard', 'verra_vcs', 'cdm', 'sa_national'] as const;
  for (let i = 0; i < 5; i++) {
    instruments.push({
      id: generateUUID(),
      name: `Carbon Credits ${standards[i]} ${2023 + (i % 3)}`,
      type: 'carbon_credit',
      status: 'active',
      seller_org_id: sellerIds[i % sellerIds.length],
      available_volume_mwh: rng.int(5000, 50000),
      unit_price_zar: rng.range(150, 250),
      price_type: 'fixed',
      created_by_user_id: generateUUID(),
      created_at: now,
      updated_at: now
    });
  }
  
  // 3 bundled green contracts
  for (let i = 0; i < 3; i++) {
    instruments.push({
      id: generateUUID(),
      name: `Bundled Green Contract ${i + 1}`,
      type: 'bundled_green',
      status: 'active',
      seller_org_id: sellerIds[i % sellerIds.length],
      energy_source: 'solar',
      capacity_mw: rng.range(20, 50),
      unit_price_zar: rng.range(0.70, 0.90),
      price_type: 'fixed',
      carbon_credits_included: true,
      recs_included: true,
      created_by_user_id: generateUUID(),
      created_at: now,
      updated_at: now
    });
  }
  
  return instruments;
}

// ============================================================================
// TARIFF DATA
// ============================================================================

function generateTariffs(db: D1Database) {
  const tariffs: any[] = [];
  const now = getCurrentTimestamp();
  
  // Eskom Megaflex
  tariffs.push({
    id: generateUUID(),
    provider_type: 'eskom',
    provider_name: 'Eskom',
    tariff_name: 'Megaflex',
    effective_from: '2025-01-01T00:00:00Z',
    peak_rate_zar_kwh: 3.85,
    standard_rate_zar_kwh: 1.22,
    off_peak_rate_zar_kwh: 0.78,
    demand_charge_zar_kva: 85.00,
    seasonal_variation: true,
    created_at: now,
    updated_at: now
  });
  
  // Eskom Miniflex
  tariffs.push({
    id: generateUUID(),
    provider_type: 'eskom',
    provider_name: 'Eskom',
    tariff_name: 'Miniflex',
    effective_from: '2025-01-01T00:00:00Z',
    peak_rate_zar_kwh: 3.50,
    standard_rate_zar_kwh: 1.15,
    off_peak_rate_zar_kwh: 0.72,
    created_at: now,
    updated_at: now
  });
  
  // City of Johannesburg
  tariffs.push({
    id: generateUUID(),
    provider_type: 'municipality',
    provider_name: 'City of Johannesburg',
    tariff_name: 'Industrial',
    province: 'gauteng',
    effective_from: '2025-01-01T00:00:00Z',
    peak_rate_zar_kwh: 4.10,
    standard_rate_zar_kwh: 1.35,
    off_peak_rate_zar_kwh: 0.85,
    demand_charge_zar_kva: 90.00,
    fixed_charge_zar_month: 5000,
    created_at: now,
    updated_at: now
  });
  
  // City of Cape Town
  tariffs.push({
    id: generateUUID(),
    provider_type: 'municipality',
    provider_name: 'City of Cape Town',
    tariff_name: 'Industrial',
    province: 'western_cape',
    effective_from: '2025-01-01T00:00:00Z',
    peak_rate_zar_kwh: 3.95,
    standard_rate_zar_kwh: 1.30,
    off_peak_rate_zar_kwh: 0.82,
    demand_charge_zar_kva: 88.00,
    created_at: now,
    updated_at: now
  });
  
  // eThekwini
  tariffs.push({
    id: generateUUID(),
    provider_type: 'municipality',
    provider_name: 'eThekwini',
    tariff_name: 'Industrial',
    province: 'kwazulu_natal',
    effective_from: '2025-01-01T00:00:00Z',
    peak_rate_zar_kwh: 4.00,
    standard_rate_zar_kwh: 1.32,
    off_peak_rate_zar_kwh: 0.83,
    created_at: now,
    updated_at: now
  });
  
  return tariffs;
}

// ============================================================================
// GRID DATA
// ============================================================================

function generateGridData(db: D1Database, days: number) {
  const gridData: any[] = [];
  const now = new Date();
  
  for (let day = 0; day < days; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(date);
      timestamp.setHours(hour, 0, 0, 0);
      
      // Realistic demand pattern
      const baseDemand = 28; // GW
      const hourFactor = hour >= 7 && hour <= 20 ? 1.1 : 0.9;
      const weekendFactor = date.getDay() === 0 || date.getDay() === 6 ? 0.85 : 1.0;
      const demand = baseDemand * hourFactor * weekendFactor * rng.range(0.95, 1.05);
      
      // Generation mix
      const coal = 85;
      const nuclear = 5;
      const gas = 3;
      const hydro = 2;
      const solar = hour >= 6 && hour <= 18 ? rng.range(2, 5) : 0;
      const wind = rng.range(1, 4);
      const other = 100 - coal - nuclear - gas - hydro - solar - wind;
      
      // Load shedding simulation
      const isLoadShedding = rng.next() < 0.15; // 15% chance
      const loadSheddingStage = isLoadShedding ? rng.int(1, 4) : 0;
      
      gridData.push({
        id: generateUUID(),
        timestamp: timestamp.toISOString(),
        system_demand_gw: demand,
        system_frequency_hz: rng.range(49.95, 50.05),
        generation_mix_coal: coal,
        generation_mix_nuclear: nuclear,
        generation_mix_gas: gas,
        generation_mix_hydro: hydro,
        generation_mix_solar: solar,
        generation_mix_wind: wind,
        generation_mix_other: other,
        load_shedding_stage: loadSheddingStage,
        load_shedding_active: isLoadShedding
      });
    }
  }
  
  return gridData;
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

export async function seedDatabase(db: D1Database) {
  console.log('Starting database seed...');
  
  // Generate organisations
  console.log('Generating organisations...');
  const organisations = generateOrganisations(db);
  for (const org of organisations) {
    await db.prepare(`
      INSERT INTO organisations (id, name, type, status, contact_email, province, city, address_line1, postal_code, annual_consumption_gwh, generation_capacity_mw, kyc_status, kyc_approved_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      org.id, org.name, org.type, org.status, org.contact_email, org.province, org.city, org.address_line1, org.postal_code,
      org.annual_consumption_gwh, org.generation_capacity_mw, org.kyc_status, org.kyc_approved_at, org.created_at, org.updated_at
    ).run();
  }
  console.log(`Created ${organisations.length} organisations`);
  
  // Generate users
  console.log('Generating users...');
  const orgIds = organisations.map(o => o.id);
  const sellerIds = organisations.filter(o => o.type === 'seller').map(o => o.id);
  const users = generateUsers(db, orgIds);
  for (const user of users) {
    await db.prepare(`
      INSERT INTO users (id, organisation_id, email, name, role, status, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(user.id, user.organisation_id, user.email, user.name, user.role, user.status, user.password_hash, user.created_at, user.updated_at).run();
  }
  console.log(`Created ${users.length} users`);
  
  // Generate instruments
  console.log('Generating instruments...');
  const instruments = generateInstruments(db, sellerIds);
  for (const inst of instruments) {
    await db.prepare(`
      INSERT INTO instruments (id, name, type, status, seller_org_id, energy_source, province, capacity_mw, annual_generation_gwh, available_volume_mwh, unit_price_zar, price_type, price_index, contract_tenor_months, min_order_volume_mwh, carbon_credits_included, recs_included, created_by_user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      inst.id, inst.name, inst.type, inst.status, inst.seller_org_id, inst.energy_source, inst.province,
      inst.capacity_mw, inst.annual_generation_gwh, inst.available_volume_mwh, inst.unit_price_zar,
      inst.price_type, inst.price_index, inst.contract_tenor_months, inst.min_order_volume_mwh,
      inst.carbon_credits_included, inst.recs_included, inst.created_by_user_id, inst.created_at, inst.updated_at
    ).run();
  }
  console.log(`Created ${instruments.length} instruments`);
  
  // Generate tariffs
  console.log('Generating tariffs...');
  const tariffs = generateTariffs(db);
  for (const tariff of tariffs) {
    await db.prepare(`
      INSERT INTO tariffs (id, provider_type, provider_name, tariff_name, province, effective_from, peak_rate_zar_kwh, standard_rate_zar_kwh, off_peak_rate_zar_kwh, demand_charge_zar_kva, fixed_charge_zar_month, seasonal_variation, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      tariff.id, tariff.provider_type, tariff.provider_name, tariff.tariff_name, tariff.province,
      tariff.effective_from, tariff.peak_rate_zar_kwh, tariff.standard_rate_zar_kwh,
      tariff.off_peak_rate_zar_kwh, tariff.demand_charge_zar_kva, tariff.fixed_charge_zar_month,
      tariff.seasonal_variation, tariff.created_at, tariff.updated_at
    ).run();
  }
  console.log(`Created ${tariffs.length} tariffs`);
  
  // Generate grid data
  console.log('Generating grid data...');
  const gridData = generateGridData(db, config.gridDataDays);
  for (const data of gridData) {
    await db.prepare(`
      INSERT INTO grid_data (id, timestamp, system_demand_gw, system_frequency_hz, generation_mix_coal, generation_mix_nuclear, generation_mix_gas, generation_mix_hydro, generation_mix_solar, generation_mix_wind, generation_mix_other, load_shedding_stage, load_shedding_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.id, data.timestamp, data.system_demand_gw, data.system_frequency_hz,
      data.generation_mix_coal, data.generation_mix_nuclear, data.generation_mix_gas,
      data.generation_mix_hydro, data.generation_mix_solar, data.generation_mix_wind,
      data.generation_mix_other, data.load_shedding_stage, data.load_shedding_active
    ).run();
  }
  console.log(`Created ${gridData.length} grid data points (${config.gridDataDays} days)`);
  
  console.log('Database seed completed successfully!');
}
