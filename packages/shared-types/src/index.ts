/**
 * ESUM Energy Trading Platform - Shared Types
 * All TypeScript types and Zod schemas for type safety across the platform
 */

import { z } from 'zod';

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

export const OrganisationType = z.enum([
  'buyer',
  'seller',
  'trader',
  'aggregator',
  'municipality',
  'carbon_fund',
  'institutional_investor',
  'system_operator'
]);
export type OrganisationType = z.infer<typeof OrganisationType>;

export const OrganisationStatus = z.enum(['pending', 'active', 'suspended', 'terminated']);
export type OrganisationStatus = z.infer<typeof OrganisationStatus>;

export const KYCStatus = z.enum(['not_submitted', 'pending_review', 'approved', 'rejected', 'requires_resubmission']);
export type KYCStatus = z.infer<typeof KYCStatus>;

export const UserRole = z.enum(['super_admin', 'platform_admin', 'org_admin', 'trader', 'analyst', 'viewer']);
export type UserRole = z.infer<typeof UserRole>;

export const UserStatus = z.enum(['active', 'inactive', 'suspended']);
export type UserStatus = z.infer<typeof UserStatus>;

export const InstrumentType = z.enum([
  'physical_ppa',
  'virtual_ppa',
  'rec',
  'carbon_credit',
  'bundled_green',
  'wheeling_service'
]);
export type InstrumentType = z.infer<typeof InstrumentType>;

export const InstrumentStatus = z.enum(['draft', 'pending_approval', 'active', 'suspended', 'expired', 'cancelled']);
export type InstrumentStatus = z.infer<typeof InstrumentStatus>;

export const EnergySource = z.enum(['solar', 'wind', 'hydro', 'biomass', 'mixed_renewable', 'grid']);
export type EnergySource = z.infer<typeof EnergySource>;

export const OrderType = z.enum(['bid', 'ask']);
export type OrderType = z.infer<typeof OrderType>;

export const OrderStatus = z.enum(['open', 'partially_filled', 'filled', 'cancelled', 'expired']);
export type OrderStatus = z.infer<typeof OrderStatus>;

export const TradeStatus = z.enum(['pending', 'confirmed', 'settled', 'disputed']);
export type TradeStatus = z.infer<typeof TradeStatus>;

export const ContractType = z.enum(['spot', 'term', 'vppa', 'physical_ppa', 'wheeling']);
export type ContractType = z.infer<typeof ContractType>;

export const ContractStatus = z.enum(['draft', 'active', 'completed', 'terminated', 'disputed']);
export type ContractStatus = z.infer<typeof ContractStatus>;

export const SettlementStatus = z.enum(['pending', 'calculated', 'invoiced', 'paid', 'disputed']);
export type SettlementStatus = z.infer<typeof SettlementStatus>;

export const CarbonStandard = z.enum(['gold_standard', 'verra_vcs', 'cdm', 'sa_national']);
export type CarbonStandard = z.infer<typeof CarbonStandard>;

export const CarbonCreditStatus = z.enum(['available', 'reserved', 'transferred', 'retired']);
export type CarbonCreditStatus = z.infer<typeof CarbonCreditStatus>;

export const AuctionType = z.enum(['sealed_first_price', 'sealed_second_price', 'dutch', 'english']);
export type AuctionType = z.infer<typeof AuctionType>;

export const AuctionStatus = z.enum(['scheduled', 'open', 'closed', 'settled', 'cancelled']);
export type AuctionStatus = z.infer<typeof AuctionStatus>;

export const NegotiationStatus = z.enum(['invited', 'active', 'terms_proposed', 'terms_accepted', 'contract_generated', 'cancelled', 'expired']);
export type NegotiationStatus = z.infer<typeof NegotiationStatus>;

export const TOUPeriod = z.enum(['peak', 'standard', 'off_peak']);
export type TOUPeriod = z.infer<typeof TOUPeriod>;

export const Province = z.enum([
  'eastern_cape',
  'free_state',
  'gauteng',
  'kwazulu_natal',
  'limpopo',
  'mpumalanga',
  'northern_cape',
  'north_west',
  'western_cape'
]);
export type Province = z.infer<typeof Province>;

export const NotificationType = z.enum(['trade_executed', 'order_filled', 'auction_closing', 'settlement_due', 'kyc_approved', 'kyc_rejected', 'password_reset', 'welcome', 'scenario_complete']);
export type NotificationType = z.infer<typeof NotificationType>;

export const NotificationChannel = z.enum(['in_app', 'email', 'webhook']);
export type NotificationChannel = z.infer<typeof NotificationChannel>;

// ============================================================================
// BASE SCHEMAS
// ============================================================================

export const UUIDSchema = z.string().uuid();
export const ISO8601Schema = z.string().datetime();
export const DecimalSchema = z.number().finite();
export const PositiveDecimalSchema = DecimalSchema.positive();

// ============================================================================
// ORGANISATION SCHEMAS
// ============================================================================

export const OrganisationSchema = z.object({
  id: UUIDSchema,
  name: z.string().min(2).max(255),
  type: OrganisationType,
  status: OrganisationStatus,
  registration_number: z.string().optional(),
  tax_number: z.string().optional(),
  kyc_status: KYCStatus,
  kyc_submitted_at: ISO8601Schema.nullable(),
  kyc_approved_at: ISO8601Schema.nullable(),
  contact_email: z.string().email(),
  contact_phone: z.string().optional(),
  address_line1: z.string(),
  address_line2: z.string().optional(),
  city: z.string(),
  province: Province,
  postal_code: z.string(),
  country: z.string().default('ZA'),
  annual_consumption_gwh: DecimalSchema.optional(),
  generation_capacity_mw: DecimalSchema.optional(),
  created_at: ISO8601Schema,
  updated_at: ISO8601Schema
});
export type Organisation = z.infer<typeof OrganisationSchema>;

export const CreateOrganisationInput = OrganisationSchema.omit({
  id: true,
  kyc_status: true,
  kyc_submitted_at: true,
  kyc_approved_at: true,
  created_at: true,
  updated_at: true
}).partial({
  status: true
});
export type CreateOrganisationInput = z.infer<typeof CreateOrganisationInput>;

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const UserSchema = z.object({
  id: UUIDSchema,
  organisation_id: UUIDSchema,
  email: z.string().email(),
  name: z.string().min(2).max(255),
  role: UserRole,
  status: UserStatus,
  phone: z.string().optional(),
  last_login_at: ISO8601Schema.nullable(),
  password_hash: z.string().optional(),
  mfa_enabled: z.boolean().default(false),
  mfa_secret: z.string().optional(),
  created_at: ISO8601Schema,
  updated_at: ISO8601Schema
});
export type User = z.infer<typeof UserSchema>;

export const CreateUserInput = UserSchema.omit({
  id: true,
  last_login_at: true,
  created_at: true,
  updated_at: true
}).partial({
  status: true,
  mfa_enabled: true
});
export type CreateUserInput = z.infer<typeof CreateUserInput>;

export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
export type LoginInput = z.infer<typeof LoginInput>;

export const SessionSchema = z.object({
  id: UUIDSchema,
  user_id: UUIDSchema,
  token_hash: z.string(),
  expires_at: ISO8601Schema,
  refresh_token_hash: z.string(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  created_at: ISO8601Schema
});
export type Session = z.infer<typeof SessionSchema>;

// ============================================================================
// INSTRUMENT SCHEMAS
// ============================================================================

export const InstrumentSchema = z.object({
  id: UUIDSchema,
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  type: InstrumentType,
  status: InstrumentStatus,
  seller_org_id: UUIDSchema,
  energy_source: EnergySource.optional(),
  province: Province.optional(),
  latitude: DecimalSchema.optional(),
  longitude: DecimalSchema.optional(),
  capacity_mw: DecimalSchema.optional(),
  annual_generation_gwh: DecimalSchema.optional(),
  available_volume_mwh: DecimalSchema.optional(),
  unit_price_zar: DecimalSchema,
  price_type: z.enum(['fixed', 'indexed', 'formula']),
  price_index: z.string().optional(),
  price_formula: z.string().optional(),
  min_order_volume_mwh: DecimalSchema.default(1),
  max_order_volume_mwh: DecimalSchema.optional(),
  contract_tenor_months: z.number().int().positive().optional(),
  delivery_start_date: ISO8601Schema.optional(),
  delivery_end_date: ISO8601Schema.optional(),
  carbon_credits_included: z.boolean().default(false),
  recs_included: z.boolean().default(false),
  wheeling_arrangement: z.enum(['seller_responsible', 'buyer_responsible', 'platform_coordinated']).optional(),
  metadata: z.record(z.unknown()).optional(),
  created_by_user_id: UUIDSchema,
  approved_by_user_id: UUIDSchema.nullable(),
  approved_at: ISO8601Schema.nullable(),
  created_at: ISO8601Schema,
  updated_at: ISO8601Schema
});
export type Instrument = z.infer<typeof InstrumentSchema>;

export const CreateInstrumentInput = InstrumentSchema.omit({
  id: true,
  status: true,
  approved_by_user_id: true,
  approved_at: true,
  created_at: true,
  updated_at: true
});
export type CreateInstrumentInput = z.infer<typeof CreateInstrumentInput>;

// ============================================================================
// ORDER SCHEMAS
// ============================================================================

export const OrderSchema = z.object({
  id: UUIDSchema,
  instrument_id: UUIDSchema,
  order_type: OrderType,
  status: OrderStatus,
  trader_org_id: UUIDSchema,
  trader_user_id: UUIDSchema,
  volume_mwh: DecimalSchema.positive(),
  filled_volume_mwh: DecimalSchema.default(0),
  remaining_volume_mwh: DecimalSchema,
  limit_price_zar: DecimalSchema.positive(),
  average_fill_price_zar: DecimalSchema.optional(),
  time_in_force: z.enum(['gtc', 'gfd', 'ioc', 'fok']).default('gtc'),
  valid_until: ISO8601Schema.nullable(),
  metadata: z.record(z.unknown()).optional(),
  created_at: ISO8601Schema,
  updated_at: ISO8601Schema
});
export type Order = z.infer<typeof OrderSchema>;

export const CreateOrderInput = OrderSchema.omit({
  id: true,
  status: true,
  filled_volume_mwh: true,
  remaining_volume_mwh: true,
  average_fill_price_zar: true,
  created_at: true,
  updated_at: true
});
export type CreateOrderInput = z.infer<typeof CreateOrderInput>;

// ============================================================================
// TRADE SCHEMAS
// ============================================================================

export const TradeSchema = z.object({
  id: UUIDSchema,
  buy_order_id: UUIDSchema,
  sell_order_id: UUIDSchema,
  instrument_id: UUIDSchema,
  buyer_org_id: UUIDSchema,
  seller_org_id: UUIDSchema,
  status: TradeStatus,
  volume_mwh: DecimalSchema.positive(),
  unit_price_zar: DecimalSchema.positive(),
  total_value_zar: DecimalSchema.positive(),
  platform_fee_zar: DecimalSchema.default(0),
  buyer_fee_zar: DecimalSchema.default(0),
  seller_fee_zar: DecimalSchema.default(0),
  carbon_credits_tco2e: DecimalSchema.optional(),
  recs_count: z.number().int().nonnegative().default(0),
  settlement_date: ISO8601Schema,
  metadata: z.record(z.unknown()).optional(),
  created_at: ISO8601Schema,
  updated_at: ISO8601Schema
});
export type Trade = z.infer<typeof TradeSchema>;

// ============================================================================
// CONTRACT SCHEMAS
// ============================================================================

export const ContractSchema = z.object({
  id: UUIDSchema,
  trade_id: UUIDSchema,
  instrument_id: UUIDSchema,
  buyer_org_id: UUIDSchema,
  seller_org_id: UUIDSchema,
  contract_type: ContractType,
  status: ContractStatus,
  start_date: ISO8601Schema,
  end_date: ISO8601Schema,
  total_contracted_mwh: DecimalSchema.positive(),
  delivered_mwh: DecimalSchema.default(0),
  remaining_mwh: DecimalSchema,
  price_terms: z.record(z.unknown()),
  carbon_terms: z.record(z.unknown()).optional(),
  wheeling_terms: z.record(z.unknown()).optional(),
  signed_document_r2_key: z.string().optional(),
  signed_at: ISO8601Schema.nullable(),
  terminated_at: ISO8601Schema.nullable(),
  termination_reason: z.string().optional(),
  created_at: ISO8601Schema,
  updated_at: ISO8601Schema
});
export type Contract = z.infer<typeof ContractSchema>;

// ============================================================================
// SETTLEMENT SCHEMAS
// ============================================================================

export const SettlementSchema = z.object({
  id: UUIDSchema,
  contract_id: UUIDSchema,
  period_start: ISO8601Schema,
  period_end: ISO8601Schema,
  metered_mwh: DecimalSchema.positive(),
  contracted_mwh: DecimalSchema.positive(),
  variance_mwh: DecimalSchema,
  unit_price_zar: DecimalSchema.positive(),
  gross_amount_zar: DecimalSchema.positive(),
  buyer_fee_zar: DecimalSchema.default(0),
  seller_fee_zar: DecimalSchema.default(0),
  net_buyer_amount_zar: DecimalSchema.positive(),
  net_seller_amount_zar: DecimalSchema.positive(),
  carbon_credits_settled: DecimalSchema.optional(),
  recs_settled: z.number().int().nonnegative().default(0),
  status: SettlementStatus,
  invoice_r2_key: z.string().optional(),
  payment_reference: z.string().optional(),
  paid_at: ISO8601Schema.nullable(),
  created_at: ISO8601Schema,
  updated_at: ISO8601Schema
});
export type Settlement = z.infer<typeof SettlementSchema>;

// ============================================================================
// CARBON CREDIT SCHEMAS
// ============================================================================

export const CarbonCreditSchema = z.object({
  id: UUIDSchema,
  instrument_id: UUIDSchema,
  project_name: z.string().min(2).max(255),
  project_id_external: z.string(),
  standard: CarbonStandard,
  vintage_year: z.number().int().min(2000).max(2100),
  quantity_tco2e: DecimalSchema.positive(),
  serial_number_start: z.string(),
  serial_number_end: z.string(),
  status: CarbonCreditStatus,
  owner_org_id: UUIDSchema,
  originated_by_org_id: UUIDSchema,
  retirement_date: ISO8601Schema.nullable(),
  retirement_beneficiary: z.string().optional(),
  registry_url: z.string().url().optional(),
  verification_document_r2_key: z.string().optional(),
  created_at: ISO8601Schema,
  updated_at: ISO8601Schema
});
export type CarbonCredit = z.infer<typeof CarbonCreditSchema>;

export const EmissionsResultSchema = z.object({
  grossMwh: DecimalSchema,
  netMwh: DecimalSchema,
  emissionFactorKgPerKwh: DecimalSchema,
  avoidedTco2e: DecimalSchema,
  equivalentCarbonCredits: DecimalSchema
});
export type EmissionsResult = z.infer<typeof EmissionsResultSchema>;

export const TaxLiabilityResultSchema = z.object({
  grossEmissions: DecimalSchema,
  offsets: DecimalSchema,
  netEmissions: DecimalSchema,
  taxRate: DecimalSchema,
  grossLiability: DecimalSchema,
  offsetSavings: DecimalSchema,
  netLiability: DecimalSchema
});
export type TaxLiabilityResult = z.infer<typeof TaxLiabilityResultSchema>;

// ============================================================================
// AUCTION SCHEMAS
// ============================================================================

export const AuctionSchema = z.object({
  id: UUIDSchema,
  instrument_id: UUIDSchema,
  auction_type: AuctionType,
  status: AuctionStatus,
  opens_at: ISO8601Schema,
  closes_at: ISO8601Schema,
  reserve_price_zar_per_mwh: DecimalSchema.optional(),
  clearing_price_zar_per_mwh: DecimalSchema.optional(),
  total_bids: z.number().int().nonnegative().default(0),
  total_volume_mwh: DecimalSchema.default(0),
  winning_bid_ids: z.array(UUIDSchema).default([]),
  created_by_user_id: UUIDSchema,
  created_at: ISO8601Schema,
  updated_at: ISO8601Schema
});
export type Auction = z.infer<typeof AuctionSchema>;

export const AuctionBidSchema = z.object({
  id: UUIDSchema,
  auction_id: UUIDSchema,
  bidder_org_id: UUIDSchema,
  bidder_user_id: UUIDSchema,
  volume_mwh: DecimalSchema.positive(),
  bid_price_zar: DecimalSchema.positive(),
  is_winner: z.boolean().default(false),
  created_at: ISO8601Schema
});
export type AuctionBid = z.infer<typeof AuctionBidSchema>;

// ============================================================================
// NEGOTIATION SCHEMAS
// ============================================================================

export const NegotiationSchema = z.object({
  id: UUIDSchema,
  instrument_id: UUIDSchema,
  initiator_org_id: UUIDSchema,
  counterparty_org_id: UUIDSchema,
  status: NegotiationStatus,
  term_sheet: z.record(z.unknown()),
  expires_at: ISO8601Schema,
  created_at: ISO8601Schema,
  updated_at: ISO8601Schema
});
export type Negotiation = z.infer<typeof NegotiationSchema>;

export const NegotiationMessageSchema = z.object({
  id: UUIDSchema,
  negotiation_id: UUIDSchema,
  sender_user_id: UUIDSchema,
  sender_org_id: UUIDSchema,
  message_type: z.enum(['text', 'term_update', 'document', 'acceptance']),
  content: z.string(),
  attachments: z.array(z.string()).optional(),
  read_at: ISO8601Schema.nullable(),
  created_at: ISO8601Schema
});
export type NegotiationMessage = z.infer<typeof NegotiationMessageSchema>;

// ============================================================================
// GRID DATA SCHEMAS
// ============================================================================

export const GridDataSchema = z.object({
  id: UUIDSchema,
  timestamp: ISO8601Schema,
  system_demand_gw: DecimalSchema,
  system_frequency_hz: DecimalSchema,
  generation_mix: z.object({
    coal: DecimalSchema,
    nuclear: DecimalSchema,
    gas: DecimalSchema,
    hydro: DecimalSchema,
    solar: DecimalSchema,
    wind: DecimalSchema,
    other: DecimalSchema
  }),
  load_shedding_stage: z.number().int().min(0).max(8).default(0),
  load_shedding_active: z.boolean().default(false)
});
export type GridData = z.infer<typeof GridDataSchema>;

export const TariffSchema = z.object({
  id: UUIDSchema,
  provider_type: z.enum(['eskom', 'municipality']),
  provider_name: z.string(),
  tariff_name: z.string(),
  province: Province.optional(),
  effective_from: ISO8601Schema,
  effective_to: ISO8601Schema.nullable(),
  peak_rate_zar_kwh: DecimalSchema,
  standard_rate_zar_kwh: DecimalSchema,
  off_peak_rate_zar_kwh: DecimalSchema,
  demand_charge_zar_kva: DecimalSchema.optional(),
  fixed_charge_zar_month: DecimalSchema.optional(),
  network_charge_zar_kwh: DecimalSchema.optional(),
  surcharges: z.record(DecimalSchema).optional(),
  seasonal_variation: z.boolean().default(false),
  created_at: ISO8601Schema,
  updated_at: ISO8601Schema
});
export type Tariff = z.infer<typeof TariffSchema>;

export const WeatherDataSchema = z.object({
  id: UUIDSchema,
  location_id: UUIDSchema,
  timestamp: ISO8601Schema,
  temperature_c: DecimalSchema,
  solar_irradiance_w_m2: DecimalSchema,
  wind_speed_m_s: DecimalSchema,
  wind_direction_deg: DecimalSchema,
  cloud_cover_percent: DecimalSchema,
  humidity_percent: DecimalSchema,
  precipitation_mm: DecimalSchema.optional()
});
export type WeatherData = z.infer<typeof WeatherDataSchema>;

// ============================================================================
// NOTIFICATION SCHEMAS
// ============================================================================

export const NotificationSchema = z.object({
  id: UUIDSchema,
  recipient_org_id: UUIDSchema,
  recipient_user_id: UUIDSchema,
  notification_type: NotificationType,
  channel: NotificationChannel,
  title: z.string(),
  content: z.string(),
  metadata: z.record(z.unknown()).optional(),
  read_at: ISO8601Schema.nullable(),
  sent_at: ISO8601Schema,
  created_at: ISO8601Schema
});
export type Notification = z.infer<typeof NotificationSchema>;

// ============================================================================
// API REQUEST/RESPONSE SCHEMAS
// ============================================================================

export const PaginatedResponseSchema = <T extends z.ZodType>(schema: T) =>
  z.object({
    data: z.array(schema),
    pagination: z.object({
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      total: z.number().int().nonnegative(),
      total_pages: z.number().int().nonnegative()
    })
  });

export const APIErrorResponseSchema = z.object({
  error_code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  trace_id: z.string().uuid()
});
export type APIErrorResponse = z.infer<typeof APIErrorResponseSchema>;

export const APISuccessResponseSchema = <T extends z.ZodType>(schema: T) =>
  z.object({
    success: z.boolean().default(true),
    data: schema,
    trace_id: z.string().uuid().optional()
  });

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

export type APIResponse<T> =
  | { success: true; data: T; trace_id?: string }
  | { success: false; error: APIErrorResponse };

// ============================================================================
// CONSTANTS
// ============================================================================

export const GRID_EMISSION_FACTOR_KG_CO2E_PER_KWH = 1.04;
export const CARBON_TAX_RATE_ZAR_PER_TCO2E = 190; // 2025 rate
export const PLATFORM_FEE_RATE = 0.0025; // 0.25%
export const CARBON_FEE_RATE = 0.01; // 1%

export const TOU_PEAK_HOURS = {
  start: 7,
  end: 10
};

export const TOU_EVENING_PEAK_HOURS = {
  start: 18,
  end: 20
};

export const HOURS_IN_YEAR = 8760;
export const MWH_TO_KWH = 1000;
export const TCO2E_TO_KG = 1000;
