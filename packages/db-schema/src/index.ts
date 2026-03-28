/**
 * ESUM Energy Trading Platform - Database Schema
 * Drizzle ORM schema definitions for D1 database
 */

import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
  foreignKey
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================================================
// ORGANISATIONS
// ============================================================================

export const organisations = sqliteTable(
  'organisations',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    type: text('type', {
      enum: [
        'buyer',
        'seller',
        'trader',
        'aggregator',
        'municipality',
        'carbon_fund',
        'institutional_investor',
        'system_operator',
        'ipp', // Independent Power Producer
        'offtaker' // Energy Offtaker
      ]
    }).notNull(),
    status: text('status', {
      enum: ['pending', 'active', 'suspended', 'terminated']
    })
      .notNull()
      .default('pending'),
    registrationNumber: text('registration_number'),
    taxNumber: text('tax_number'),
    kycStatus: text('kyc_status', {
      enum: ['not_submitted', 'pending_review', 'approved', 'rejected', 'requires_resubmission']
    })
      .notNull()
      .default('not_submitted'),
    kycSubmittedAt: text('kyc_submitted_at'),
    kycApprovedAt: text('kyc_approved_at'),
    contactEmail: text('contact_email').notNull(),
    contactPhone: text('contact_phone'),
    addressLine1: text('address_line1').notNull(),
    addressLine2: text('address_line2'),
    city: text('city').notNull(),
    province: text('province', {
      enum: [
        'eastern_cape',
        'free_state',
        'gauteng',
        'kwazulu_natal',
        'limpopo',
        'mpumalanga',
        'northern_cape',
        'north_west',
        'western_cape'
      ]
    }).notNull(),
    postalCode: text('postal_code').notNull(),
    country: text('country').notNull().default('ZA'),
    annualConsumptionGwh: real('annual_consumption_gwh'),
    generationCapacityMw: real('generation_capacity_mw'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  (table) => ({
    idxType: index('idx_organisations_type').on(table.type),
    idxStatus: index('idx_organisations_status').on(table.status),
    idxKycStatus: index('idx_organisations_kyc_status').on(table.kycStatus)
  })
);

// ============================================================================
// USERS
// ============================================================================

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    organisationId: text('organisation_id')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    name: text('name').notNull(),
    role: text('role', {
      enum: ['super_admin', 'platform_admin', 'org_admin', 'trader', 'analyst', 'viewer']
    }).notNull(),
    status: text('status', {
      enum: ['active', 'inactive', 'suspended']
    })
      .notNull()
      .default('active'),
    phone: text('phone'),
    lastLoginAt: text('last_login_at'),
    passwordHash: text('password_hash'),
    mfaEnabled: integer('mfa_enabled', { mode: 'boolean' }).notNull().default(false),
    mfaSecret: text('mfa_secret'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  (table) => ({
    idxOrgId: index('idx_users_organisation_id').on(table.organisationId),
    uniqueEmail: uniqueIndex('idx_users_email_unique').on(table.email)
  })
);

// ============================================================================
// SESSIONS
// ============================================================================

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: text('expires_at').notNull(),
  refreshTokenHash: text('refresh_token_hash').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
});

// ============================================================================
// INSTRUMENTS
// ============================================================================

export const instruments = sqliteTable(
  'instruments',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    type: text('type', {
      enum: ['physical_ppa', 'virtual_ppa', 'rec', 'carbon_credit', 'bundled_green', 'wheeling_service']
    }).notNull(),
    status: text('status', {
      enum: ['draft', 'pending_approval', 'active', 'suspended', 'expired', 'cancelled']
    })
      .notNull()
      .default('draft'),
    sellerOrgId: text('seller_org_id')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),
    energySource: text('energy_source', {
      enum: ['solar', 'wind', 'hydro', 'biomass', 'mixed_renewable', 'grid']
    }),
    province: text('province', {
      enum: [
        'eastern_cape',
        'free_state',
        'gauteng',
        'kwazulu_natal',
        'limpopo',
        'mpumalanga',
        'northern_cape',
        'north_west',
        'western_cape'
      ]
    }),
    latitude: real('latitude'),
    longitude: real('longitude'),
    capacityMw: real('capacity_mw'),
    annualGenerationGwh: real('annual_generation_gwh'),
    availableVolumeMwh: real('available_volume_mwh'),
    unitPriceZar: real('unit_price_zar').notNull(),
    priceType: text('price_type', {
      enum: ['fixed', 'indexed', 'formula']
    }).notNull(),
    priceIndex: text('price_index'),
    priceFormula: text('price_formula'),
    minOrderVolumeMwh: real('min_order_volume_mwh').notNull().default(1),
    maxOrderVolumeMwh: real('max_order_volume_mwh'),
    contractTenorMonths: integer('contract_tenor_months'),
    deliveryStartDate: text('delivery_start_date'),
    deliveryEndDate: text('delivery_end_date'),
    carbonCreditsIncluded: integer('carbon_credits_included', { mode: 'boolean' }).notNull().default(false),
    recsIncluded: integer('recs_included', { mode: 'boolean' }).notNull().default(false),
    wheelingArrangement: text('wheeling_arrangement', {
      enum: ['seller_responsible', 'buyer_responsible', 'platform_coordinated']
    }),
    metadata: text('metadata', { mode: 'json' }),
    createdByUserId: text('created_by_user_id')
      .notNull()
      .references(() => users.id),
    approvedByUserId: text('approved_by_user_id').references(() => users.id),
    approvedAt: text('approved_at'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  (table) => ({
    idxType: index('idx_instruments_type').on(table.type),
    idxStatus: index('idx_instruments_status').on(table.status),
    idxSellerOrg: index('idx_instruments_seller_org').on(table.sellerOrgId),
    idxEnergySource: index('idx_instruments_energy_source').on(table.energySource)
  })
);

// ============================================================================
// ORDERS
// ============================================================================

export const orders = sqliteTable(
  'orders',
  {
    id: text('id').primaryKey(),
    instrumentId: text('instrument_id')
      .notNull()
      .references(() => instruments.id, { onDelete: 'cascade' }),
    orderType: text('order_type', {
      enum: ['bid', 'ask']
    }).notNull(),
    status: text('status', {
      enum: ['open', 'partially_filled', 'filled', 'cancelled', 'expired']
    })
      .notNull()
      .default('open'),
    traderOrgId: text('trader_org_id')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),
    traderUserId: text('trader_user_id')
      .notNull()
      .references(() => users.id),
    volumeMwh: real('volume_mwh').notNull(),
    filledVolumeMwh: real('filled_volume_mwh').notNull().default(0),
    remainingVolumeMwh: real('remaining_volume_mwh').notNull(),
    limitPriceZar: real('limit_price_zar').notNull(),
    averageFillPriceZar: real('average_fill_price_zar'),
    timeInForce: text('time_in_force', {
      enum: ['gtc', 'gfd', 'ioc', 'fok']
    })
      .notNull()
      .default('gtc'),
    validUntil: text('valid_until'),
    metadata: text('metadata', { mode: 'json' }),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  (table) => ({
    idxInstrument: index('idx_orders_instrument').on(table.instrumentId),
    idxStatus: index('idx_orders_status').on(table.status),
    idxTraderOrg: index('idx_orders_trader_org').on(table.traderOrgId),
    idxOrderType: index('idx_orders_type').on(table.orderType)
  })
);

// ============================================================================
// TRADES
// ============================================================================

export const trades = sqliteTable(
  'trades',
  {
    id: text('id').primaryKey(),
    buyOrderId: text('buy_order_id')
      .notNull()
      .references(() => orders.id),
    sellOrderId: text('sell_order_id')
      .notNull()
      .references(() => orders.id),
    instrumentId: text('instrument_id')
      .notNull()
      .references(() => instruments.id),
    buyerOrgId: text('buyer_org_id')
      .notNull()
      .references(() => organisations.id),
    sellerOrgId: text('seller_org_id')
      .notNull()
      .references(() => organisations.id),
    status: text('status', {
      enum: ['pending', 'confirmed', 'settled', 'disputed']
    }).notNull(),
    volumeMwh: real('volume_mwh').notNull(),
    unitPriceZar: real('unit_price_zar').notNull(),
    totalValueZar: real('total_value_zar').notNull(),
    platformFeeZar: real('platform_fee_zar').notNull().default(0),
    buyerFeeZar: real('buyer_fee_zar').notNull().default(0),
    sellerFeeZar: real('seller_fee_zar').notNull().default(0),
    carbonCreditsTco2e: real('carbon_credits_tco2e'),
    recsCount: integer('recs_count').notNull().default(0),
    settlementDate: text('settlement_date').notNull(),
    metadata: text('metadata', { mode: 'json' }),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  (table) => ({
    idxInstrument: index('idx_trades_instrument').on(table.instrumentId),
    idxBuyerOrg: index('idx_trades_buyer_org').on(table.buyerOrgId),
    idxSellerOrg: index('idx_trades_seller_org').on(table.sellerOrgId),
    idxStatus: index('idx_trades_status').on(table.status)
  })
);

// ============================================================================
// CONTRACTS
// ============================================================================

export const contracts = sqliteTable(
  'contracts',
  {
    id: text('id').primaryKey(),
    tradeId: text('trade_id')
      .notNull()
      .references(() => trades.id),
    instrumentId: text('instrument_id')
      .notNull()
      .references(() => instruments.id),
    buyerOrgId: text('buyer_org_id')
      .notNull()
      .references(() => organisations.id),
    sellerOrgId: text('seller_org_id')
      .notNull()
      .references(() => organisations.id),
    contractType: text('contract_type', {
      enum: ['spot', 'term', 'vppa', 'physical_ppa', 'wheeling']
    }).notNull(),
    status: text('status', {
      enum: ['draft', 'pending_signature', 'partially_signed', 'active', 'completed', 'terminated', 'disputed', 'expired']
    }).notNull().default('draft'),
    startDate: text('start_date').notNull(),
    endDate: text('end_date').notNull(),
    totalContractedMwh: real('total_contracted_mwh').notNull(),
    deliveredMwh: real('delivered_mwh').notNull().default(0),
    remainingMwh: real('remaining_mwh').notNull(),
    priceTerms: text('price_terms', { mode: 'json' }).notNull(),
    carbonTerms: text('carbon_terms', { mode: 'json' }),
    wheelingTerms: text('wheeling_terms', { mode: 'json' }),
    legalTerms: text('legal_terms', { mode: 'json' }),
    templateId: text('template_id').references(() => contractTemplates.id),
    version: integer('version').notNull().default(1),
    parentContractId: text('parent_contract_id').references(() => contracts.id),
    signedDocumentR2Key: text('signed_document_r2_key'),
    unsignedDocumentR2Key: text('unsigned_document_r2_key'),
    signedAt: text('signed_at'),
    activatedAt: text('activated_at'),
    completedAt: text('completed_at'),
    terminatedAt: text('terminated_at'),
    terminationReason: text('termination_reason'),
    metadata: text('metadata', { mode: 'json' }),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  (table) => ({
    idxTrade: index('idx_contracts_trade').on(table.tradeId),
    idxBuyerOrg: index('idx_contracts_buyer_org').on(table.buyerOrgId),
    idxSellerOrg: index('idx_contracts_seller_org').on(table.sellerOrgId),
    idxStatus: index('idx_contracts_status').on(table.status),
    idxType: index('idx_contracts_type').on(table.contractType),
    idxTemplate: index('idx_contracts_template').on(table.templateId)
  })
);

// ============================================================================
// CONTRACT TEMPLATES
// ============================================================================

export const contractTemplates = sqliteTable(
  'contract_templates',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    contractType: text('contract_type', {
      enum: ['spot', 'term', 'vppa', 'physical_ppa', 'wheeling']
    }).notNull(),
    version: text('version').notNull(),
    status: text('status', {
      enum: ['draft', 'active', 'deprecated']
    }).notNull().default('draft'),
    templateDocumentR2Key: text('template_document_r2_key').notNull(),
    defaultTerms: text('default_terms', { mode: 'json' }).notNull(),
    requiredFields: text('required_fields', { mode: 'json' }).notNull(),
    optionalFields: text('optional_fields', { mode: 'json' }),
    approvalRequired: integer('approval_required', { mode: 'boolean' }).notNull().default(false),
    approvedByUserId: text('approved_by_user_id').references(() => users.id),
    approvedAt: text('approved_at'),
    createdByUserId: text('created_by_user_id')
      .notNull()
      .references(() => users.id),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  (table) => ({
    idxType: index('idx_templates_type').on(table.contractType),
    idxStatus: index('idx_templates_status').on(table.status)
  })
);

// ============================================================================
// CONTRACT SIGNATURES
// ============================================================================

export const contractSignatures = sqliteTable(
  'contract_signatures',
  {
    id: text('id').primaryKey(),
    contractId: text('contract_id')
      .notNull()
      .references(() => contracts.id, { onDelete: 'cascade' }),
    signerUserId: text('signer_user_id')
      .notNull()
      .references(() => users.id),
    signerOrgId: text('signer_org_id')
      .notNull()
      .references(() => organisations.id),
    signerRole: text('signer_role').notNull(), // e.g., 'CEO', 'CFO', 'Authorized Signatory'
    signerEmail: text('signer_email').notNull(),
    signerName: text('signer_name').notNull(),
    signatureType: text('signature_type', {
      enum: ['electronic', 'digital', 'wet_ink']
    }).notNull().default('electronic'),
    signatureData: text('signature_data', { mode: 'json' }), // Signature image, hash, etc.
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    geolocation: text('geolocation', { mode: 'json' }), // { lat, lng, country }
    signedAt: text('signed_at').notNull(),
    certificateR2Key: text('certificate_r2_key'), // Digital signature certificate
    witnessUserId: text('witness_user_id').references(() => users.id),
    witnessName: text('witness_name'),
    witnessEmail: text('witness_email'),
    witnessSignedAt: text('witness_signed_at'),
    status: text('status', {
      enum: ['pending', 'signed', 'declined', 'revoked']
    }).notNull().default('pending'),
    declinedReason: text('declined_reason'),
    revokedReason: text('revoked_reason'),
    metadata: text('metadata', { mode: 'json' }),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  (table) => ({
    idxContract: index('idx_signatures_contract').on(table.contractId),
    idxSigner: index('idx_signatures_user').on(table.signerUserId),
    idxStatus: index('idx_signatures_status').on(table.status),
    uniqueContractSigner: uniqueIndex('idx_unique_contract_signer').on(table.contractId, table.signerUserId)
  })
);

// ============================================================================
// CONTRACT AMENDMENTS
// ============================================================================

export const contractAmendments = sqliteTable(
  'contract_amendments',
  {
    id: text('id').primaryKey(),
    contractId: text('contract_id')
      .notNull()
      .references(() => contracts.id, { onDelete: 'cascade' }),
    amendmentNumber: integer('amendment_number').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    proposedChanges: text('proposed_changes', { mode: 'json' }).notNull(),
    status: text('status', {
      enum: ['draft', 'proposed', 'accepted', 'rejected', 'executed']
    }).notNull().default('draft'),
    proposedByUserId: text('proposed_by_user_id')
      .notNull()
      .references(() => users.id),
    proposedAt: text('proposed_at').notNull(),
    acceptedByBuyerUserId: text('accepted_by_buyer_user_id').references(() => users.id),
    acceptedBySellerUserId: text('accepted_by_seller_user_id').references(() => users.id),
    acceptedAt: text('accepted_at'),
    executedAt: text('executed_at'),
    amendmentDocumentR2Key: text('amendment_document_r2_key'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  (table) => ({
    idxContract: index('idx_amendments_contract').on(table.contractId),
    idxStatus: index('idx_amendments_status').on(table.status)
  })
);

// ============================================================================
// CONTRACT AUDIT LOG
// ============================================================================

export const contractAuditLog = sqliteTable(
  'contract_audit_log',
  {
    id: text('id').primaryKey(),
    contractId: text('contract_id')
      .notNull()
      .references(() => contracts.id, { onDelete: 'cascade' }),
    action: text('action').notNull(),
    performedByUserId: text('performed_by_user_id').references(() => users.id),
    performedByOrgId: text('performed_by_org_id').references(() => organisations.id),
    changes: text('changes', { mode: 'json' }),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    timestamp: text('timestamp')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  (table) => ({
    idxContract: index('idx_contract_audit_contract').on(table.contractId),
    idxAction: index('idx_contract_audit_action').on(table.action),
    idxTimestamp: index('idx_contract_audit_timestamp').on(table.timestamp)
  })
);

// ============================================================================
// SETTLEMENTS
// ============================================================================

export const settlements = sqliteTable(
  'settlements',
  {
    id: text('id').primaryKey(),
    contractId: text('contract_id')
      .notNull()
      .references(() => contracts.id, { onDelete: 'cascade' }),
    periodStart: text('period_start').notNull(),
    periodEnd: text('period_end').notNull(),
    meteredMwh: real('metered_mwh').notNull(),
    contractedMwh: real('contracted_mwh').notNull(),
    varianceMwh: real('variance_mwh').notNull(),
    unitPriceZar: real('unit_price_zar').notNull(),
    grossAmountZar: real('gross_amount_zar').notNull(),
    buyerFeeZar: real('buyer_fee_zar').notNull().default(0),
    sellerFeeZar: real('seller_fee_zar').notNull().default(0),
    netBuyerAmountZar: real('net_buyer_amount_zar').notNull(),
    netSellerAmountZar: real('net_seller_amount_zar').notNull(),
    carbonCreditsSettled: real('carbon_credits_settled'),
    recsSettled: integer('recs_settled').notNull().default(0),
    status: text('status', {
      enum: ['pending', 'calculated', 'invoiced', 'paid', 'disputed']
    }).notNull(),
    invoiceR2Key: text('invoice_r2_key'),
    paymentReference: text('payment_reference'),
    paidAt: text('paid_at'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  (table) => ({
    idxContract: index('idx_settlements_contract').on(table.contractId),
    idxStatus: index('idx_settlements_status').on(table.status)
  })
);

// ============================================================================
// CARBON CREDITS
// ============================================================================

export const carbonCredits = sqliteTable(
  'carbon_credits',
  {
    id: text('id').primaryKey(),
    instrumentId: text('instrument_id')
      .notNull()
      .references(() => instruments.id, { onDelete: 'cascade' }),
    projectName: text('project_name').notNull(),
    projectIdExternal: text('project_id_external').notNull(),
    standard: text('standard', {
      enum: ['gold_standard', 'verra_vcs', 'cdm', 'sa_national']
    }).notNull(),
    vintageYear: integer('vintage_year').notNull(),
    quantityTco2e: real('quantity_tco2e').notNull(),
    serialNumberStart: text('serial_number_start').notNull(),
    serialNumberEnd: text('serial_number_end').notNull(),
    status: text('status', {
      enum: ['available', 'reserved', 'transferred', 'retired']
    }).notNull(),
    ownerOrgId: text('owner_org_id')
      .notNull()
      .references(() => organisations.id),
    originatedByOrgId: text('originated_by_org_id')
      .notNull()
      .references(() => organisations.id),
    retirementDate: text('retirement_date'),
    retirementBeneficiary: text('retirement_beneficiary'),
    registryUrl: text('registry_url'),
    verificationDocumentR2Key: text('verification_document_r2_key'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  (table) => ({
    idxInstrument: index('idx_carbon_credits_instrument').on(table.instrumentId),
    idxStatus: index('idx_carbon_credits_status').on(table.status),
    idxOwner: index('idx_carbon_credits_owner').on(table.ownerOrgId),
    idxStandard: index('idx_carbon_credits_standard').on(table.standard)
  })
);

// ============================================================================
// AUCTIONS
// ============================================================================

export const auctions = sqliteTable(
  'auctions',
  {
    id: text('id').primaryKey(),
    instrumentId: text('instrument_id')
      .notNull()
      .references(() => instruments.id, { onDelete: 'cascade' }),
    auctionType: text('auction_type', {
      enum: ['sealed_first_price', 'sealed_second_price', 'dutch', 'english']
    }).notNull(),
    status: text('status', {
      enum: ['scheduled', 'open', 'closed', 'settled', 'cancelled']
    }).notNull(),
    opensAt: text('opens_at').notNull(),
    closesAt: text('closes_at').notNull(),
    reservePriceZarPerMwh: real('reserve_price_zar_per_mwh'),
    clearingPriceZarPerMwh: real('clearing_price_zar_per_mwh'),
    totalBids: integer('total_bids').notNull().default(0),
    totalVolumeMwh: real('total_volume_mwh').notNull().default(0),
    winningBidIds: text('winning_bid_ids', { mode: 'json' }).notNull().default([]),
    createdByUserId: text('created_by_user_id')
      .notNull()
      .references(() => users.id),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  (table) => ({
    idxInstrument: index('idx_auctions_instrument').on(table.instrumentId),
    idxStatus: index('idx_auctions_status').on(table.status)
  })
);

// ============================================================================
// AUCTION BIDS
// ============================================================================

export const auctionBids = sqliteTable(
  'auction_bids',
  {
    id: text('id').primaryKey(),
    auctionId: text('auction_id')
      .notNull()
      .references(() => auctions.id, { onDelete: 'cascade' }),
    bidderOrgId: text('bidder_org_id')
      .notNull()
      .references(() => organisations.id),
    bidderUserId: text('bidder_user_id')
      .notNull()
      .references(() => users.id),
    volumeMwh: real('volume_mwh').notNull(),
    bidPriceZar: real('bid_price_zar').notNull(),
    isWinner: integer('is_winner', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  (table) => ({
    idxAuction: index('idx_auction_bids_auction').on(table.auctionId),
    idxBidder: index('idx_auction_bids_bidder').on(table.bidderOrgId)
  })
);

// ============================================================================
// NEGOTIATIONS
// ============================================================================

export const negotiations = sqliteTable(
  'negotiations',
  {
    id: text('id').primaryKey(),
    instrumentId: text('instrument_id')
      .notNull()
      .references(() => instruments.id),
    initiatorOrgId: text('initiator_org_id')
      .notNull()
      .references(() => organisations.id),
    counterpartyOrgId: text('counterparty_org_id')
      .notNull()
      .references(() => organisations.id),
    status: text('status', {
      enum: ['invited', 'active', 'terms_proposed', 'terms_accepted', 'contract_generated', 'cancelled', 'expired']
    }).notNull(),
    termSheet: text('term_sheet', { mode: 'json' }).notNull(),
    expiresAt: text('expires_at').notNull(),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  (table) => ({
    idxInitiator: index('idx_negotiations_initiator').on(table.initiatorOrgId),
    idxCounterparty: index('idx_negotiations_counterparty').on(table.counterpartyOrgId),
    idxStatus: index('idx_negotiations_status').on(table.status)
  })
);

// ============================================================================
// NEGOTIATION MESSAGES
// ============================================================================

export const negotiationMessages = sqliteTable('negotiation_messages', {
  id: text('id').primaryKey(),
  negotiationId: text('negotiation_id')
    .notNull()
    .references(() => negotiations.id, { onDelete: 'cascade' }),
  senderUserId: text('sender_user_id')
    .notNull()
    .references(() => users.id),
  senderOrgId: text('sender_org_id')
    .notNull()
    .references(() => organisations.id),
  messageType: text('message_type', {
    enum: ['text', 'term_update', 'document', 'acceptance']
  }).notNull(),
  content: text('content').notNull(),
  attachments: text('attachments', { mode: 'json' }),
  readAt: text('read_at'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
});

// ============================================================================
// GRID DATA
// ============================================================================

export const gridData = sqliteTable(
  'grid_data',
  {
    id: text('id').primaryKey(),
    timestamp: text('timestamp').notNull(),
    systemDemandGw: real('system_demand_gw').notNull(),
    systemFrequencyHz: real('system_frequency_hz').notNull(),
    generationMixCoal: real('generation_mix_coal').notNull(),
    generationMixNuclear: real('generation_mix_nuclear').notNull(),
    generationMixGas: real('generation_mix_gas').notNull(),
    generationMixHydro: real('generation_mix_hydro').notNull(),
    generationMixSolar: real('generation_mix_solar').notNull(),
    generationMixWind: real('generation_mix_wind').notNull(),
    generationMixOther: real('generation_mix_other').notNull(),
    loadSheddingStage: integer('load_shedding_stage').notNull().default(0),
    loadSheddingActive: integer('load_shedding_active', { mode: 'boolean' }).notNull().default(false)
  },
  (table) => ({
    idxTimestamp: uniqueIndex('idx_grid_data_timestamp').on(table.timestamp)
  })
);

// ============================================================================
// TARIFFS
// ============================================================================

export const tariffs = sqliteTable(
  'tariffs',
  {
    id: text('id').primaryKey(),
    providerType: text('provider_type', {
      enum: ['eskom', 'municipality']
    }).notNull(),
    providerName: text('provider_name').notNull(),
    tariffName: text('tariff_name').notNull(),
    province: text('province', {
      enum: [
        'eastern_cape',
        'free_state',
        'gauteng',
        'kwazulu_natal',
        'limpopo',
        'mpumalanga',
        'northern_cape',
        'north_west',
        'western_cape'
      ]
    }),
    effectiveFrom: text('effective_from').notNull(),
    effectiveTo: text('effective_to'),
    peakRateZarKwh: real('peak_rate_zar_kwh').notNull(),
    standardRateZarKwh: real('standard_rate_zar_kwh').notNull(),
    offPeakRateZarKwh: real('off_peak_rate_zar_kwh').notNull(),
    demandChargeZarKva: real('demand_charge_zar_kva'),
    fixedChargeZarMonth: real('fixed_charge_zar_month'),
    networkChargeZarKwh: real('network_charge_zar_kwh'),
    surcharges: text('surcharges', { mode: 'json' }),
    seasonalVariation: integer('seasonal_variation', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  (table) => ({
    idxProvider: index('idx_tariffs_provider').on(table.providerType, table.providerName),
    idxProvince: index('idx_tariffs_province').on(table.province)
  })
);

// ============================================================================
// WEATHER DATA
// ============================================================================

export const weatherData = sqliteTable(
  'weather_data',
  {
    id: text('id').primaryKey(),
    locationId: text('location_id').notNull(),
    timestamp: text('timestamp').notNull(),
    temperatureC: real('temperature_c').notNull(),
    solarIrradianceWM2: real('solar_irradiance_w_m2').notNull(),
    windSpeedMS: real('wind_speed_m_s').notNull(),
    windDirectionDeg: real('wind_direction_deg').notNull(),
    cloudCoverPercent: real('cloud_cover_percent').notNull(),
    humidityPercent: real('humidity_percent').notNull(),
    precipitationMm: real('precipitation_mm')
  },
  (table) => ({
    idxLocation: index('idx_weather_location').on(table.locationId),
    idxTimestamp: index('idx_weather_timestamp').on(table.timestamp)
  })
);

// ============================================================================
// LOAD PROFILE INTERVALS
// ============================================================================

export const loadProfileIntervals = sqliteTable(
  'load_profile_intervals',
  {
    id: text('id').primaryKey(),
    organisationId: text('organisation_id')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),
    timestamp: text('timestamp').notNull(),
    demandKw: real('demand_kw').notNull(),
    energyKwh: real('energy_kwh').notNull(),
    touPeriod: text('tou_period', {
      enum: ['peak', 'standard', 'off_peak']
    }).notNull()
  },
  (table) => ({
    idxOrg: index('idx_load_profile_org').on(table.organisationId),
    idxTimestamp: index('idx_load_profile_timestamp').on(table.timestamp)
  })
);

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notifications = sqliteTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    recipientOrgId: text('recipient_org_id')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),
    recipientUserId: text('recipient_user_id')
      .notNull()
      .references(() => users.id),
    notificationType: text('notification_type', {
      enum: [
        'trade_executed',
        'order_filled',
        'auction_closing',
        'settlement_due',
        'kyc_approved',
        'kyc_rejected',
        'password_reset',
        'welcome',
        'scenario_complete'
      ]
    }).notNull(),
    channel: text('channel', {
      enum: ['in_app', 'email', 'webhook']
    }).notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    metadata: text('metadata', { mode: 'json' }),
    readAt: text('read_at'),
    sentAt: text('sent_at').notNull(),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  (table) => ({
    idxRecipient: index('idx_notifications_recipient').on(table.recipientUserId),
    idxType: index('idx_notifications_type').on(table.notificationType),
    idxRead: index('idx_notifications_read').on(table.readAt)
  })
);

// ============================================================================
// AUDIT LOG
// ============================================================================

export const auditLog = sqliteTable(
  'audit_log',
  {
    id: text('id').primaryKey(),
    organisationId: text('organisation_id').references(() => organisations.id),
    userId: text('user_id').references(() => users.id),
    action: text('action').notNull(),
    resourceType: text('resource_type').notNull(),
    resourceId: text('resource_id'),
    changes: text('changes', { mode: 'json' }),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  (table) => ({
    idxOrg: index('idx_audit_log_org').on(table.organisationId),
    idxUser: index('idx_audit_log_user').on(table.userId),
    idxResource: index('idx_audit_log_resource').on(table.resourceType, table.resourceId),
    idxCreated: index('idx_audit_log_created').on(table.createdAt)
  })
);

// ============================================================================
// KYC DOCUMENTS
// ============================================================================

export const kycDocuments = sqliteTable('kyc_documents', {
  id: text('id').primaryKey(),
  organisationId: text('organisation_id')
    .notNull()
    .references(() => organisations.id, { onDelete: 'cascade' }),
  documentType: text('document_type').notNull(),
  documentName: text('document_name').notNull(),
  r2Key: text('r2_key').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  uploadedByUserId: text('uploaded_by_user_id')
    .notNull()
    .references(() => users.id),
  status: text('status', {
    enum: ['pending', 'approved', 'rejected']
  }).notNull(),
  reviewNotes: text('review_notes'),
  reviewedByUserId: text('reviewed_by_user_id').references(() => users.id),
  reviewedAt: text('reviewed_at'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
});

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const featureFlags = sqliteTable('feature_flags', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(false),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
});

// ============================================================================
// IPP PROJECTS - Independent Power Producer Project Management
// ============================================================================

export const ippProjects = sqliteTable('ipp_projects', {
  id: text('id').primaryKey(),
  ippOrgId: text('ipp_org_id')
    .notNull()
    .references(() => organisations.id, { onDelete: 'cascade' }),
  projectName: text('project_name').notNull(),
  projectType: text('project_type', {
    enum: ['solar_pv', 'wind', 'hydro', 'biomass', 'battery_storage', 'hybrid']
  }).notNull(),
  province: text('province', {
    enum: [
      'eastern_cape',
      'free_state',
      'gauteng',
      'kwazulu_natal',
      'limpopo',
      'mpumalanga',
      'northern_cape',
      'north_west',
      'western_cape'
    ]
  }).notNull(),
  location: text('location'), // GPS coordinates or address
  capacityMw: real('capacity_mw').notNull(),
  estimatedAnnualGenerationGwh: real('estimated_annual_generation_gwh'),
  status: text('status', {
    enum: [
      'concept',
      'feasibility',
      'development',
      'financial_close',
      'construction',
      'commissioning',
      'operational',
      'decommissioned'
    ]
  }).notNull().default('concept'),
  financialCloseTarget: text('financial_close_target'),
  financialCloseActual: text('financial_close_actual'),
  commercialOperationDate: text('commercial_operation_date'),
  totalInvestmentZar: real('total_investment_zar'),
  equityRaisedZar: real('equity_raised_zar'),
  debtRaisedZar: real('debt_raised_zar'),
  offtakeAgreementId: text('offtake_agreement_id').references(() => offtakeAgreements.id),
  gridConnectionStatus: text('grid_connection_status', {
    enum: ['not_applied', 'application_submitted', 'approved', 'connection_agreement', 'connected']
  }).notNull().default('not_applied'),
  environmentalAuthStatus: text('environmental_auth_status', {
    enum: ['not_required', 'application_submitted', 'approved', 'rejected']
  }).notNull().default('not_required'),
  permitsStatus: text('permits_status', {
    enum: ['pending', 'partial', 'complete']
  }).notNull().default('pending'),
  constructionProgress: integer('construction_progress').default(0), // 0-100%
  commissionedCapacityMw: real('commissioned_capacity_mw'),
  metadata: text('metadata', { mode: 'json' }),
  createdByUserId: text('created_by_user_id')
    .notNull()
    .references(() => users.id),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
},
(table) => ({
  idxIppOrg: index('idx_ipp_projects_ipp_org').on(table.ippOrgId),
  idxStatus: index('idx_ipp_projects_status').on(table.status),
  idxProvince: index('idx_ipp_projects_province').on(table.province),
  idxType: index('idx_ipp_projects_type').on(table.projectType)
}));

// ============================================================================
// OFFTAKE AGREEMENTS - Power Purchase Agreements between IPP and Offtaker
// ============================================================================

export const offtakeAgreements = sqliteTable('offtake_agreements', {
  id: text('id').primaryKey(),
  ippOrgId: text('ipp_org_id')
    .notNull()
    .references(() => organisations.id, { onDelete: 'cascade' }),
  offtakerOrgId: text('offtaker_org_id')
    .notNull()
    .references(() => organisations.id, { onDelete: 'cascade' }),
  projectId: text('project_id').references(() => ippProjects.id),
  agreementType: text('agreement_type', {
    enum: ['physical_ppa', 'virtual_ppa', 'wheeling_agreement', 'merchant', 'hybrid']
  }).notNull(),
  status: text('status', {
    enum: [
      'term_sheet',
      'negotiation',
      'signed',
      'conditions_precedent',
      'financial_close',
      'active',
      'terminated',
      'expired'
    ]
  }).notNull().default('term_sheet'),
  contractTenorYears: integer('contract_tenor_years').notNull(),
  contractedCapacityMw: real('contracted_capacity_mw').notNull(),
  annualContractedGwh: real('annual_contracted_gwh'),
  tariffStructure: text('tariff_structure', {
    enum: ['fixed', 'escalating', 'inflation_linked', 'market_indexed', 'hybrid']
  }).notNull(),
  baseTariffZarKwh: real('base_tariff_zar_kwh').notNull(),
  escalationRatePercent: real('escalation_rate_percent'),
  currency: text('currency').notNull().default('ZAR'),
  deliveryStartDate: text('delivery_start_date'),
  deliveryEndDate: text('delivery_end_date'),
  deliveryPoint: text('delivery_point').notNull(), // Grid connection point
  wheelingArrangement: text('wheeling_arrangement', {
    enum: ['seller_responsible', 'buyer_responsible', 'platform_coordinated', 'none']
  }),
  performanceSecurity: text('performance_security'), // Bank guarantee details
  terminationClauses: text('termination_clauses', { mode: 'json' }),
  forceMajeure: text('force_majeure', { mode: 'json' }),
  disputeResolution: text('dispute_resolution').notNull().default('arbitration'),
  governingLaw: text('governing_law').notNull().default('South Africa'),
  signedDate: text('signed_date'),
  effectiveDate: text('effective_date'),
  financialCloseDate: text('financial_close_date'),
  contractDocumentR2Key: text('contract_document_r2_key'),
  metadata: text('metadata', { mode: 'json' }),
  createdByUserId: text('created_by_user_id')
    .notNull()
    .references(() => users.id),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
},
(table) => ({
  idxIpp: index('idx_offtake_ipp_org').on(table.ippOrgId),
  idxOfftaker: index('idx_offtake_offtaker_org').on(table.offtakerOrgId),
  idxProject: index('idx_offtake_project').on(table.projectId),
  idxStatus: index('idx_offtake_status').on(table.status)
}));

// ============================================================================
// FINANCIAL CLOSE MILESTONES - Track progress to financial close
// ============================================================================

export const financialCloseMilestones = sqliteTable('financial_close_milestones', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => ippProjects.id, { onDelete: 'cascade' }),
  milestoneType: text('milestone_type', {
    enum: [
      'land_acquisition',
      'grid_connection_approval',
      'environmental_authorization',
      'water_use_license',
      'municipal_approvals',
      'offtake_agreement',
      'engineering_procurement',
      'equity_commitment',
      'debt_commitment',
      'insurance_arrangement',
      'operations_maintenance',
      'regulatory_compliance',
      'other'
    ]
  }).notNull(),
  description: text('description').notNull(),
  status: text('status', {
    enum: ['not_started', 'in_progress', 'completed', 'blocked', 'cancelled']
  }).notNull().default('not_started'),
  targetDate: text('target_date'),
  actualDate: text('actual_date'),
  completionPercent: integer('completion_percent').default(0),
  blockedReason: text('blocked_reason'),
  responsibleParty: text('responsible_party'),
  dependencies: text('dependencies', { mode: 'json' }), // Array of milestone IDs
  documents: text('documents', { mode: 'json' }), // Array of document references
  comments: text('comments'),
  createdByUserId: text('created_by_user_id')
    .notNull()
    .references(() => users.id),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
},
(table) => ({
  idxProject: index('idx_fc_milestones_project').on(table.projectId),
  idxStatus: index('idx_fc_milestones_status').on(table.status),
  idxType: index('idx_fc_milestones_type').on(table.milestoneType)
}));

// ============================================================================
// PROJECT UPDATES - Progress updates and communications
// ============================================================================

export const projectUpdates = sqliteTable('project_updates', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => ippProjects.id, { onDelete: 'cascade' }),
  updateType: text('update_type', {
    enum: [
      'milestone_completed',
      'financial_update',
      'construction_progress',
      'regulatory_update',
      'offtake_update',
      'risk_alert',
      'general'
    ]
  }).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  visibility: text('visibility', {
    enum: ['internal', 'investors', 'offtaker', 'public']
  }).notNull().default('internal'),
  attachments: text('attachments', { mode: 'json' }), // Array of document references
  authorUserId: text('author_user_id')
    .notNull()
    .references(() => users.id),
  publishedAt: text('published_at'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
},
(table) => ({
  idxProject: index('idx_project_updates_project').on(table.projectId),
  idxType: index('idx_project_updates_type').on(table.updateType),
  idxVisibility: index('idx_project_updates_visibility').on(table.visibility)
}));

// ============================================================================
// INVESTOR COMMITMENTS - Equity and debt commitments for projects
// ============================================================================

export const investorCommitments = sqliteTable('investor_commitments', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => ippProjects.id, { onDelete: 'cascade' }),
  investorOrgId: text('investor_org_id')
    .notNull()
    .references(() => organisations.id, { onDelete: 'cascade' }),
  commitmentType: text('commitment_type', {
    enum: ['equity', 'debt', 'grant', 'concessional_financing']
  }).notNull(),
  committedAmountZar: real('committed_amount_zar').notNull(),
  disbursedAmountZar: real('disbursed_amount_zar').notNull().default(0),
  currency: text('currency').notNull().default('ZAR'),
  interestRatePercent: real('interest_rate_percent'), // For debt
  tenorYears: integer('tenor_years'), // For debt
  status: text('status', {
    enum: ['committed', 'disbursing', 'fully_disbursed', 'cancelled']
  }).notNull().default('committed'),
  conditionsPrecedent: text('conditions_precedent', { mode: 'json' }),
  disbursementSchedule: text('disbursement_schedule', { mode: 'json' }),
  commitmentDate: text('commitment_date'),
  firstDisbursementDate: text('first_disbursement_date'),
  finalDisbursementDate: text('final_disbursement_date'),
  agreementDocumentR2Key: text('agreement_document_r2_key'),
  metadata: text('metadata', { mode: 'json' }),
  createdByUserId: text('created_by_user_id')
    .notNull()
    .references(() => users.id),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
},
(table) => ({
  idxProject: index('idx_investor_commitments_project').on(table.projectId),
  idxInvestor: index('idx_investor_commitments_investor').on(table.investorOrgId),
  idxType: index('idx_investor_commitments_type').on(table.commitmentType),
  idxStatus: index('idx_investor_commitments_status').on(table.status)
}));
