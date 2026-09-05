const Order = require("../models/Order");
const User = require("../models/User");
const Products = require("../models/Product");
const { getSalesAnalytics } = require('../services/salesAnalyticsService');
const { generateSalesInsights, GeminiServiceError } = require('../services/geminiService');

const AI_INSIGHTS_CACHE_TTL_MS = 2 * 60 * 1000;
const aiInsightsCache = new Map();

const getAdminStats = async (req , res) =>{
  try{
    const totalUsers = await User.countDocuments({role: 'user'});
    const totalOrders = await Order.countDocuments({});
    const totalProducts = await Products.countDocuments({});

    const orders = await Order.find({});
    const totalRevenueData = orders.reduce((acc , order) => acc + order.totalAmount , 0)

    res.json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: totalRevenueData
    });
  }catch(error){
    res.status(500).json({message: 'Error fetching stats' , error});
  }
};

const getDetailedSalesAnalytics = async (req, res) => {
  try {
    const analytics = await getSalesAnalytics({
      from: req.query.from,
      to: req.query.to
    });

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching detailed sales analytics:', error);
    res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : 'Error fetching detailed sales analytics'
    });
  }
};

const validateAiInsightsBody = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('Request body must be an object');
    error.statusCode = 400;
    throw error;
  }

  const unexpectedFields = Object.keys(body).filter((field) => !['from', 'to'].includes(field));
  if (unexpectedFields.length > 0) {
    const error = new Error('Only from and to date filters are supported');
    error.statusCode = 400;
    throw error;
  }

  ['from', 'to'].forEach((field) => {
    if (body[field] !== undefined && typeof body[field] !== 'string') {
      const error = new Error(`${field} must be a date string`);
      error.statusCode = 400;
      throw error;
    }
  });

  return {
    from: body.from,
    to: body.to
  };
};

const removeExpiredAiInsights = () => {
  const now = Date.now();
  for (const [key, entry] of aiInsightsCache.entries()) {
    if (entry.expiresAt <= now) {
      aiInsightsCache.delete(key);
    }
  }
};

const getCachedAiInsights = (analytics, dateRange) => {
  removeExpiredAiInsights();

  const key = JSON.stringify({ dateRange, analytics });
  const cachedEntry = aiInsightsCache.get(key);
  if (cachedEntry) {
    return cachedEntry.promise;
  }

  const insightPromise = generateSalesInsights(analytics).catch((error) => {
    aiInsightsCache.delete(key);
    throw error;
  });

  aiInsightsCache.set(key, {
    expiresAt: Date.now() + AI_INSIGHTS_CACHE_TTL_MS,
    promise: insightPromise
  });

  return insightPromise;
};

const getAiSalesInsights = async (req, res) => {
  try {
    const dateRange = validateAiInsightsBody(req.body || {});
    const analytics = await getSalesAnalytics(dateRange);
    const insights = await getCachedAiInsights(analytics, dateRange);

    return res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error instanceof GeminiServiceError) {
      const statusByCode = {
        CONFIGURATION: 503,
        RATE_LIMIT: 429,
        TIMEOUT: 504,
        INVALID_RESPONSE: 502,
        PROVIDER_ERROR: 502
      };

      return res.status(statusByCode[error.code] || 502).json({
        success: false,
        message: 'Unable to generate AI sales insights'
      });
    }

    console.error('AI sales insights request failed:', error?.name || 'UnknownError');
    return res.status(500).json({
      success: false,
      message: 'Unable to generate AI sales insights'
    });
  }
};

module.exports = { getAdminStats, getDetailedSalesAnalytics, getAiSalesInsights };