/**
 * ESUM Energy Trading Platform - AI Models
 * Prompt templates, model configurations, and inference helpers for Workers AI
 */

import { z } from 'zod';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface ScenarioInput {
  organisationId: string;
  annualConsumptionMwh: number;
  loadProfile?: number[]; // 8760 hourly values
  budgetConstraint?: number;
  renewableTarget?: number; // percentage
  riskTolerance?: 'low' | 'medium' | 'high';
  carbonPriceProjection?: number[];
  tariffEscalationRate?: number;
}

export interface ScenarioResult {
  scenarioId: string;
  scenarioName: string;
  totalCostZar: number;
  renewablePercentage: number;
  carbonReductionTco2e: number;
  riskScore: number;
  energyMix: {
    grid: number;
    solarPpa: number;
    windPpa: number;
    battery: number;
    other: number;
  };
  hourlyAllocation?: number[][];
  sensitivityAnalysis?: SensitivityResult;
}

export interface SensitivityResult {
  tariffPlus10: number;
  tariffMinus10: number;
  carbonPlus10: number;
  carbonMinus10: number;
  generationMinus10: number;
}

export interface PortfolioOptimisationInput {
  organisationId: string;
  availableInstruments: InstrumentOption[];
  budgetZar: number;
  constraints: PortfolioConstraints;
}

export interface InstrumentOption {
  instrumentId: string;
  type: 'solar_ppa' | 'wind_ppa' | 'rec' | 'carbon_credit';
  priceZarPerMwh: number;
  availableVolumeMwh: number;
  location: string;
  capacityFactor: number;
}

export interface PortfolioConstraints {
  minRenewablePercentage: number;
  maxSingleSourcePercentage: number;
  maxBudgetZar: number;
  riskTolerance: 'low' | 'medium' | 'high';
}

export interface PortfolioOptimisationResult {
  recommendedPortfolio: PortfolioAllocation[];
  totalCostZar: number;
  renewablePercentage: number;
  carbonReductionTco2e: number;
  riskScore: number;
  alternativeScenarios: ScenarioResult[];
}

export interface PortfolioAllocation {
  instrumentId: string;
  allocatedMwh: number;
  percentageOfTotal: number;
  annualCostZar: number;
}

export interface PriceForecastInput {
  instrumentId: string;
  historicalPrices: number[];
  forecastHorizon: number; // days
  marketFactors: MarketFactors;
}

export interface MarketFactors {
  demandForecast: number;
  supplyForecast: number;
  carbonPrice: number;
  fuelPrices: {
    coal: number;
    gas: number;
  };
  weatherForecast: WeatherForecast;
}

export interface WeatherForecast {
  solarIrradiance: number[];
  windSpeed: number[];
  temperature: number[];
}

export interface PriceForecastResult {
  instrumentId: string;
  forecastPrices: number[];
  confidenceIntervals: {
    lower: number[];
    upper: number[];
  };
  trend: 'increasing' | 'decreasing' | 'stable';
  volatility: number;
}

export interface CounterpartyRiskInput {
  organisationId: string;
  tradeHistory: TradeHistory[];
  financialMetrics: FinancialMetrics;
  marketReputation: number;
}

export interface TradeHistory {
  tradeId: string;
  volumeMwh: number;
  valueZar: number;
  settlementStatus: 'on_time' | 'late' | 'disputed';
  date: string;
}

export interface FinancialMetrics {
  creditRating?: string;
  annualRevenue?: number;
  debtToEquity?: number;
  currentRatio?: number;
}

export interface CounterpartyRiskResult {
  organisationId: string;
  riskScore: number; // 0-100, lower is better
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  recommendedCreditLimit: number;
  recommendedMarginRequirement: number;
}

export interface RiskFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

// ============================================================================
// PROMPT TEMPLATES
// ============================================================================

export const SCENARIO_PLANNING_PROMPT = `You are an energy portfolio optimization AI for the South African energy market.

Given the following inputs:
- Annual consumption: {annualConsumptionMwh} MWh
- Budget constraint: {budgetConstraint} ZAR
- Renewable target: {renewableTarget}%
- Risk tolerance: {riskTolerance}
- Current grid emission factor: 1.04 kg CO2e/kWh

Generate an optimal energy mix scenario that minimizes total cost while meeting the renewable target.

Consider:
1. Eskom grid power with Time-of-Use tariffs (Peak: R3.85/kWh, Standard: R1.22/kWh, Off-peak: R0.78/kWh)
2. Solar PPA prices (R0.55-R0.85/kWh depending on capacity and location)
3. Wind PPA prices (R0.50-R0.75/kWh depending on capacity and location)
4. Battery storage for peak shaving
5. Carbon tax implications (R190/tCO2e)

Return the result as a JSON object with the following structure:
{
  "scenarioName": "string",
  "totalCostZar": number,
  "renewablePercentage": number,
  "carbonReductionTco2e": number,
  "riskScore": number,
  "energyMix": {
    "grid": number,
    "solarPpa": number,
    "windPpa": number,
    "battery": number,
    "other": number
  },
  "hourlyAllocation": number[][],
  "explanation": "string"
}

Ensure all hourly allocations sum to the demand profile and all costs are derived from real tariff rates.`;

export const PORTFOLIO_OPTIMIZATION_PROMPT = `You are a portfolio optimization AI for energy trading.

Given a set of available energy instruments and client constraints, recommend an optimal portfolio allocation.

Available instruments:
{availableInstruments}

Client constraints:
- Minimum renewable percentage: {minRenewablePercentage}%
- Maximum single source percentage: {maxSingleSourcePercentage}%
- Maximum budget: {maxBudgetZar} ZAR
- Risk tolerance: {riskTolerance}

Optimize for:
1. Cost minimization
2. Renewable energy maximization
3. Risk diversification
4. Carbon reduction

Return a JSON object with:
{
  "recommendedPortfolio": [
    {
      "instrumentId": "string",
      "allocatedMwh": number,
      "percentageOfTotal": number,
      "annualCostZar": number
    }
  ],
  "totalCostZar": number,
  "renewablePercentage": number,
  "carbonReductionTco2e": number,
  "riskScore": number,
  "alternativeScenarios": [],
  "reasoning": "string"
}`;

export const PRICE_FORECAST_PROMPT = `You are an energy price forecasting AI.

Analyze the following market data and forecast prices for the next {forecastHorizon} days:

Historical prices (last 30 days): {historicalPrices}

Market factors:
- Demand forecast: {demandForecast}
- Supply forecast: {supplyForecast}
- Carbon price: {carbonPrice} ZAR/tCO2e
- Coal price: {coalPrice} ZAR/ton
- Gas price: {gasPrice} ZAR/MMBtu
- Solar irradiance forecast: {solarIrradiance}
- Wind speed forecast: {windSpeed}

Consider:
1. Seasonal patterns in South African energy demand
2. Load-shedding impact on prices
3. Renewable generation variability
4. Carbon price trends
5. Fuel cost pass-through

Return a JSON object with:
{
  "forecastPrices": number[],
  "confidenceIntervals": {
    "lower": number[],
    "upper": number[]
  },
  "trend": "increasing" | "decreasing" | "stable",
  "volatility": number,
  "reasoning": "string"
}`;

export const COUNTERPARTY_RISK_PROMPT = `You are a counterparty risk assessment AI for energy trading.

Evaluate the credit risk of the following organisation:

Trade history:
{tradeHistory}

Financial metrics:
{financialMetrics}

Market reputation score: {marketReputation} (0-100)

Assess:
1. Payment history and settlement performance
2. Financial stability indicators
3. Market reputation and track record
4. Industry-specific risk factors
5. Recommended credit limits and margin requirements

Return a JSON object with:
{
  "riskScore": number,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "riskFactors": [
    {
      "factor": "string",
      "impact": "positive" | "negative" | "neutral",
      "weight": number,
      "description": "string"
    }
  ],
  "recommendedCreditLimit": number,
  "recommendedMarginRequirement": number,
  "reasoning": "string"
}`;

// ============================================================================
// MODEL CONFIGURATIONS
// ============================================================================

export const MODEL_CONFIGS = {
  // Text generation for scenario planning and analysis
  SCENARIO_PLANNING: {
    model: '@cf/meta/llama-3-8b-instruct',
    maxTokens: 2048,
    temperature: 0.3,
    topP: 0.9,
    systemPrompt: 'You are an expert energy trading AI specializing in portfolio optimization for the South African market.'
  },

  // Embedding model for semantic search
  EMBEDDING: {
    model: '@cf/baai/bge-base-en-v1.5',
    dimensions: 768
  },

  // Price forecasting with time series analysis
  PRICE_FORECAST: {
    model: '@cf/meta/llama-3-8b-instruct',
    maxTokens: 1024,
    temperature: 0.2,
    topP: 0.9
  },

  // Risk assessment
  RISK_ASSESSMENT: {
    model: '@cf/meta/llama-3-8b-instruct',
    maxTokens: 1024,
    temperature: 0.1,
    topP: 0.9
  }
} as const;

// ============================================================================
// INFERENCE HELPERS
// ============================================================================

/**
 * Generate a response using Workers AI
 */
export async function generateWithAI(
  ai: any, // Ai binding from Cloudflare Workers
  config: typeof MODEL_CONFIGS.SCENARIO_PLANNING,
  prompt: string
): Promise<string> {
  const messages = [
    { role: 'system', content: config.systemPrompt },
    { role: 'user', content: prompt }
  ];

  const response = await ai.run(config.model, {
    messages,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    top_p: config.topP
  });

  return response.response || response.generated_text || '';
}

/**
 * Generate embeddings for semantic search
 */
export async function generateEmbeddings(
  ai: any, // Ai binding from Cloudflare Workers
  text: string
): Promise<number[]> {
  const config = MODEL_CONFIGS.EMBEDDING;
  
  const response = await ai.run(config.model, {
    text
  });

  return response.data || response.embeddings || [];
}

/**
 * Parse JSON from AI response with error handling
 */
export function parseAIJsonResponse<T>(response: string): T | null {
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : response;
    
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Failed to parse AI JSON response:', error);
    return null;
  }
}

/**
 * Validate scenario result schema
 */
export const ScenarioResultSchema = z.object({
  scenarioName: z.string(),
  totalCostZar: z.number(),
  renewablePercentage: z.number().min(0).max(100),
  carbonReductionTco2e: z.number(),
  riskScore: z.number().min(0).max(100),
  energyMix: z.object({
    grid: z.number(),
    solarPpa: z.number(),
    windPpa: z.number(),
    battery: z.number(),
    other: z.number()
  }),
  hourlyAllocation: z.array(z.array(z.number())).optional(),
  explanation: z.string()
});

/**
 * Validate portfolio optimization result schema
 */
export const PortfolioOptimisationResultSchema = z.object({
  recommendedPortfolio: z.array(z.object({
    instrumentId: z.string(),
    allocatedMwh: z.number(),
    percentageOfTotal: z.number(),
    annualCostZar: z.number()
  })),
  totalCostZar: z.number(),
  renewablePercentage: z.number().min(0).max(100),
  carbonReductionTco2e: z.number(),
  riskScore: z.number().min(0).max(100),
  alternativeScenarios: z.array(ScenarioResultSchema),
  reasoning: z.string()
});

/**
 * Validate price forecast result schema
 */
export const PriceForecastResultSchema = z.object({
  forecastPrices: z.array(z.number()),
  confidenceIntervals: z.object({
    lower: z.array(z.number()),
    upper: z.array(z.number())
  }),
  trend: z.enum(['increasing', 'decreasing', 'stable']),
  volatility: z.number(),
  reasoning: z.string()
});

/**
 * Validate counterparty risk result schema
 */
export const CounterpartyRiskResultSchema = z.object({
  riskScore: z.number().min(0).max(100),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  riskFactors: z.array(z.object({
    factor: z.string(),
    impact: z.enum(['positive', 'negative', 'neutral']),
    weight: z.number(),
    description: z.string()
  })),
  recommendedCreditLimit: z.number(),
  recommendedMarginRequirement: z.number(),
  reasoning: z.string()
});

// ============================================================================
// SCENARIO GENERATION HELPERS
// ============================================================================

/**
 * Generate multiple scenario variations
 */
export async function generateScenarios(
  ai: any,
  input: ScenarioInput
): Promise<ScenarioResult[]> {
  const scenarios: ScenarioResult[] = [];
  
  // Generate base scenario
  const basePrompt = SCENARIO_PLANNING_PROMPT
    .replace('{annualConsumptionMwh}', input.annualConsumptionMwh.toString())
    .replace('{budgetConstraint}', input.budgetConstraint?.toString() || 'unlimited')
    .replace('{renewableTarget}', input.renewableTarget?.toString() || '0')
    .replace('{riskTolerance}', input.riskTolerance || 'medium');
  
  const baseResult = await generateWithAI(ai, MODEL_CONFIGS.SCENARIO_PLANNING, basePrompt);
  const parsedBase = parseAIJsonResponse<ScenarioResult>(baseResult);
  if (parsedBase) {
    parsedBase.scenarioId = 'base';
    scenarios.push(parsedBase);
  }
  
  // Generate aggressive renewable scenario
  if (input.renewableTarget && input.renewableTarget < 80) {
    const aggressiveInput = { ...input, renewableTarget: 80 };
    const aggressivePrompt = SCENARIO_PLANNING_PROMPT
      .replace('{annualConsumptionMwh}', aggressiveInput.annualConsumptionMwh.toString())
      .replace('{budgetConstraint}', aggressiveInput.budgetConstraint?.toString() || 'unlimited')
      .replace('{renewableTarget}', aggressiveInput.renewableTarget.toString())
      .replace('{riskTolerance}', aggressiveInput.riskTolerance || 'medium');
    
    const aggressiveResult = await generateWithAI(ai, MODEL_CONFIGS.SCENARIO_PLANNING, aggressivePrompt);
    const parsedAggressive = parseAIJsonResponse<ScenarioResult>(aggressiveResult);
    if (parsedAggressive) {
      parsedAggressive.scenarioId = 'aggressive_renewable';
      parsedAggressive.scenarioName = 'Aggressive Renewable (80%)';
      scenarios.push(parsedAggressive);
    }
  }
  
  // Generate cost-optimized scenario
  const costOptInput = { ...input, renewableTarget: Math.max(0, (input.renewableTarget || 0) - 10) };
  const costOptPrompt = SCENARIO_PLANNING_PROMPT
    .replace('{annualConsumptionMwh}', costOptInput.annualConsumptionMwh.toString())
    .replace('{budgetConstraint}', costOptInput.budgetConstraint?.toString() || 'unlimited')
    .replace('{renewableTarget}', costOptInput.renewableTarget.toString())
    .replace('{riskTolerance}', costOptInput.riskTolerance || 'medium');
  
  const costOptResult = await generateWithAI(ai, MODEL_CONFIGS.SCENARIO_PLANNING, costOptPrompt);
  const parsedCostOpt = parseAIJsonResponse<ScenarioResult>(costOptResult);
  if (parsedCostOpt) {
    parsedCostOpt.scenarioId = 'cost_optimized';
    parsedCostOpt.scenarioName = 'Cost Optimized';
    scenarios.push(parsedCostOpt);
  }
  
  return scenarios;
}

/**
 * Calculate sensitivity analysis for a scenario
 */
export function calculateSensitivity(baseScenario: ScenarioResult): SensitivityResult {
  const baseCost = baseScenario.totalCostZar;
  
  // Simplified sensitivity calculations
  // In production, these would be recalculated with adjusted parameters
  return {
    tariffPlus10: baseCost * 1.10,
    tariffMinus10: baseCost * 0.90,
    carbonPlus10: baseCost * 1.02, // Carbon typically smaller impact
    carbonMinus10: baseCost * 0.98,
    generationMinus10: baseCost * 1.05 // Reduced generation increases grid dependency
  };
}
