const { GoogleGenAI } = require('@google/genai');

const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const GEMINI_TIMEOUT_MS = 15000;

const AI_INSIGHTS_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    keyTrends: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 5
    },
    topPerformers: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 5
    },
    recommendations: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 5
    },
    risks: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 5
    }
  },
  required: ['summary', 'keyTrends', 'topPerformers', 'recommendations', 'risks'],
  additionalProperties: false
};

const SYSTEM_INSTRUCTION = [
  'You are an e-commerce sales intelligence analyst.',
  'Analyze only the supplied deterministic analytics object.',
  'Backend-calculated financial metrics, quantities, counts, and percentages are authoritative.',
  'Never calculate, modify, round, reinterpret, or replace supplied financial values.',
  'Never invent numbers, products, categories, trends, or comparisons.',
  'Only mention a trend, risk, or recommendation when supported by the supplied data.',
  'State that there is insufficient data when the supplied data does not support an insight.',
  'Keep the response concise and practical for an e-commerce administrator.',
  'Return only the requested JSON object. Do not include markdown or extra fields.'
].join(' ');

class GeminiServiceError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'GeminiServiceError';
    this.code = code;
  }
}

const finiteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const stringValue = (value, fallback) => typeof value === 'string' ? value : fallback;

const sanitizeAnalyticsData = (analyticsData) => {
  if (!analyticsData || typeof analyticsData !== 'object' || Array.isArray(analyticsData)) {
    throw new GeminiServiceError('INVALID_ANALYTICS', 'Analytics data is invalid');
  }

  const summary = analyticsData.summary;
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) {
    throw new GeminiServiceError('INVALID_ANALYTICS', 'Analytics summary is invalid');
  }

  const monthlyRevenue = Array.isArray(analyticsData.monthlyRevenue)
    ? analyticsData.monthlyRevenue.map((metric) => ({
      month: stringValue(metric?.month, 'Unknown month'),
      revenue: finiteNumber(metric?.revenue),
      orders: finiteNumber(metric?.orders)
    }))
    : [];

  const categoryPerformance = Array.isArray(analyticsData.categoryPerformance)
    ? analyticsData.categoryPerformance.map((metric) => ({
      category: stringValue(metric?.category, 'Uncategorized'),
      revenue: finiteNumber(metric?.revenue),
      orders: finiteNumber(metric?.orders)
    }))
    : [];

  const topProducts = Array.isArray(analyticsData.topProducts)
    ? analyticsData.topProducts.map((metric) => ({
      product: stringValue(metric?.product, 'Unknown Product'),
      revenue: finiteNumber(metric?.revenue),
      quantity: finiteNumber(metric?.quantity)
    }))
    : [];

  const periodComparison = analyticsData.periodComparison && typeof analyticsData.periodComparison === 'object'
    ? {
      revenueChangePercent: finiteNumber(analyticsData.periodComparison.revenueChangePercent),
      orderChangePercent: finiteNumber(analyticsData.periodComparison.orderChangePercent)
    }
    : {
      revenueChangePercent: 0,
      orderChangePercent: 0
    };

  return {
    summary: {
      totalRevenue: finiteNumber(summary.totalRevenue),
      totalOrders: finiteNumber(summary.totalOrders),
      averageOrderValue: finiteNumber(summary.averageOrderValue)
    },
    monthlyRevenue,
    categoryPerformance,
    topProducts,
    periodComparison
  };
};

const isEmptyAnalytics = (analyticsData) => (
  analyticsData.summary.totalOrders === 0 &&
  analyticsData.summary.totalRevenue === 0 &&
  analyticsData.monthlyRevenue.length === 0 &&
  analyticsData.categoryPerformance.length === 0 &&
  analyticsData.topProducts.length === 0
);

const validateInsights = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new GeminiServiceError('INVALID_RESPONSE', 'Gemini returned an invalid insights object');
  }

  const expectedFields = ['summary', 'keyTrends', 'topPerformers', 'recommendations', 'risks'];
  const actualFields = Object.keys(value).sort();
  const expectedSorted = [...expectedFields].sort();

  if (actualFields.length !== expectedSorted.length || actualFields.some((field, index) => field !== expectedSorted[index])) {
    throw new GeminiServiceError('INVALID_RESPONSE', 'Gemini returned unexpected insight fields');
  }

  if (typeof value.summary !== 'string' || !Array.isArray(value.keyTrends) ||
      !Array.isArray(value.topPerformers) || !Array.isArray(value.recommendations) ||
      !Array.isArray(value.risks)) {
    throw new GeminiServiceError('INVALID_RESPONSE', 'Gemini returned incorrectly typed insights');
  }

  const insightLists = [value.keyTrends, value.topPerformers, value.recommendations, value.risks];
  if (insightLists.some((list) => list.length > 5 || list.some((item) => typeof item !== 'string'))) {
    throw new GeminiServiceError('INVALID_RESPONSE', 'Gemini returned invalid insight list values');
  }

  return {
    summary: value.summary,
    keyTrends: value.keyTrends,
    topPerformers: value.topPerformers,
    recommendations: value.recommendations,
    risks: value.risks
  };
};

const generateSalesInsights = async (analyticsData) => {
  const sanitizedAnalytics = sanitizeAnalyticsData(analyticsData);

  if (isEmptyAnalytics(sanitizedAnalytics)) {
    return {
      summary: 'Insufficient sales data is available to generate business insights.',
      keyTrends: [],
      topPerformers: [],
      recommendations: [],
      risks: []
    };
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new GeminiServiceError('CONFIGURATION', 'AI insights are not configured');
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Deterministic sales analytics:\n${JSON.stringify(sanitizedAnalytics)}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseJsonSchema: AI_INSIGHTS_SCHEMA,
        temperature: 0.2,
        maxOutputTokens: 600,
        httpOptions: { timeout: GEMINI_TIMEOUT_MS }
      }
    });

    if (!response || typeof response.text !== 'string' || response.text.trim() === '') {
      throw new GeminiServiceError('INVALID_RESPONSE', 'Gemini returned no insights');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response.text);
    } catch (error) {
      throw new GeminiServiceError('INVALID_RESPONSE', 'Gemini returned malformed JSON');
    }

    return validateInsights(parsedResponse);
  } catch (error) {
    if (error instanceof GeminiServiceError) {
      throw error;
    }

    const providerMessage = typeof error?.message === 'string' ? error.message.toLowerCase() : '';
    const code = providerMessage.includes('429') || providerMessage.includes('rate')
      ? 'RATE_LIMIT'
      : providerMessage.includes('timeout') || providerMessage.includes('timed out')
        ? 'TIMEOUT'
        : 'PROVIDER_ERROR';

    console.error(`Gemini insights request failed: ${code}`);
    throw new GeminiServiceError(code, 'AI insights are temporarily unavailable');
  }
};

module.exports = {
  GEMINI_MODEL,
  AI_INSIGHTS_SCHEMA,
  generateSalesInsights,
  GeminiServiceError
};