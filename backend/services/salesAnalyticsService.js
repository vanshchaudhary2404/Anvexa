const Order = require('../models/Order');

const VALID_ORDER_STATUSES = ['Processing', 'Shipped', 'Delivered'];

const toFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const roundMoney = (value) => Math.round((toFiniteNumber(value) + Number.EPSILON) * 100) / 100;

const roundPercent = (value) => Math.round((toFiniteNumber(value) + Number.EPSILON) * 100) / 100;

const parseDate = (value, fieldName) => {
  if (value === undefined) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const error = new Error(`${fieldName} must be a valid date`);
    error.statusCode = 400;
    throw error;
  }

  return date;
};

const buildDateMatch = (start, end) => {
  const match = { status: { $in: VALID_ORDER_STATUSES } };

  if (start || end) {
    match.createdAt = {};
    if (start) match.createdAt.$gte = start;
    if (end) match.createdAt.$lt = end;
  }

  return match;
};

const getDefaultPeriod = async () => {
  const [firstOrder, lastOrder] = await Promise.all([
    Order.findOne({ status: { $in: VALID_ORDER_STATUSES } }).sort({ createdAt: 1 }).select('createdAt').lean(),
    Order.findOne({ status: { $in: VALID_ORDER_STATUSES } }).sort({ createdAt: -1 }).select('createdAt').lean()
  ]);

  if (!firstOrder || !lastOrder) {
    return null;
  }

  return {
    start: new Date(firstOrder.createdAt),
    end: new Date(lastOrder.createdAt.getTime() + 1)
  };
};

const getOrderTotals = async (start, end) => {
  const match = buildDateMatch(start, end);
  const [orderCount, revenueResult] = await Promise.all([
    Order.countDocuments(match),
    Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$_id',
          orderRevenue: {
            $sum: { $multiply: ['$items.price', '$items.qty'] }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$orderRevenue' }
        }
      }
    ])
  ]);

  const totalRevenue = toFiniteNumber(revenueResult[0]?.totalRevenue);

  return {
    totalRevenue: roundMoney(totalRevenue),
    totalOrders: orderCount,
    averageOrderValue: orderCount ? roundMoney(totalRevenue / orderCount) : 0
  };
};

const getItemRows = async (start, end) => Order.aggregate([
  { $match: buildDateMatch(start, end) },
  { $unwind: '$items' },
  {
    $lookup: {
      from: 'products',
      localField: 'items.productId',
      foreignField: '_id',
      as: 'product'
    }
  },
  {
    $unwind: {
      path: '$product',
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $project: {
      orderId: '$_id',
      createdAt: 1,
      productId: '$items.productId',
      quantity: '$items.qty',
      revenue: { $multiply: ['$items.price', '$items.qty'] },
      product: { $ifNull: ['$product.name', 'Unknown Product'] },
      category: { $ifNull: ['$product.category', 'Uncategorized'] }
    }
  }
]);

const getPeriodMetrics = async (start, end) => {
  const [summary, rows] = await Promise.all([
    getOrderTotals(start, end),
    getItemRows(start, end)
  ]);

  const monthly = new Map();
  const categories = new Map();
  const products = new Map();

  rows.forEach((row) => {
    const date = new Date(row.createdAt);
    const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    const revenue = toFiniteNumber(row.revenue);
    const quantity = toFiniteNumber(row.quantity);

    if (!monthly.has(month)) {
      monthly.set(month, { month, revenue: 0, orders: new Set() });
    }
    const monthlyMetric = monthly.get(month);
    monthlyMetric.revenue += revenue;
    monthlyMetric.orders.add(String(row.orderId));

    if (!categories.has(row.category)) {
      categories.set(row.category, { category: row.category, revenue: 0, orders: new Set() });
    }
    const categoryMetric = categories.get(row.category);
    categoryMetric.revenue += revenue;
    categoryMetric.orders.add(String(row.orderId));

    const productKey = row.productId ? String(row.productId) : `unknown-${String(row.orderId)}`;
    if (!products.has(productKey)) {
      products.set(productKey, {
        productId: row.productId ? String(row.productId) : null,
        product: row.product,
        revenue: 0,
        quantity: 0
      });
    }
    const productMetric = products.get(productKey);
    productMetric.revenue += revenue;
    productMetric.quantity += quantity;
  });

  return {
    summary,
    monthlyRevenue: [...monthly.values()]
      .sort((left, right) => left.month.localeCompare(right.month))
      .map((metric) => ({
        month: metric.month,
        revenue: roundMoney(metric.revenue),
        orders: metric.orders.size
      })),
    categoryPerformance: [...categories.values()]
      .sort((left, right) => right.revenue - left.revenue)
      .map((metric) => ({
        category: metric.category,
        revenue: roundMoney(metric.revenue),
        orders: metric.orders.size
      })),
    topProducts: [...products.values()]
      .sort((left, right) => right.revenue - left.revenue)
      .slice(0, 10)
      .map((metric) => ({
        productId: metric.productId,
        product: metric.product,
        revenue: roundMoney(metric.revenue),
        quantity: metric.quantity
      }))
  };
};

const calculateChangePercent = (current, previous) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return roundPercent(((current - previous) / previous) * 100);
};

const getSalesAnalytics = async ({ from, to } = {}) => {
  const requestedStart = parseDate(from, 'from');
  const requestedEnd = parseDate(to, 'to');

  if (requestedStart && requestedEnd && requestedStart > requestedEnd) {
    const error = new Error('from must be earlier than or equal to to');
    error.statusCode = 400;
    throw error;
  }

  const availablePeriod = requestedStart && requestedEnd ? null : await getDefaultPeriod();
  const currentStart = requestedStart || availablePeriod?.start;
  const currentEnd = requestedEnd || availablePeriod?.end;

  if (!currentStart || !currentEnd) {
    return {
      summary: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
      monthlyRevenue: [],
      categoryPerformance: [],
      topProducts: [],
      periodComparison: { revenueChangePercent: 0, orderChangePercent: 0 }
    };
  }

  const periodLength = Math.max(currentEnd.getTime() - currentStart.getTime(), 1);
  const previousStart = new Date(currentStart.getTime() - periodLength);
  const previousEnd = currentStart;

  const [current, previous] = await Promise.all([
    getPeriodMetrics(currentStart, currentEnd),
    getOrderTotals(previousStart, previousEnd)
  ]);

  return {
    summary: current.summary,
    monthlyRevenue: current.monthlyRevenue,
    categoryPerformance: current.categoryPerformance,
    topProducts: current.topProducts,
    periodComparison: {
      revenueChangePercent: calculateChangePercent(current.summary.totalRevenue, previous.totalRevenue),
      orderChangePercent: calculateChangePercent(current.summary.totalOrders, previous.totalOrders)
    }
  };
};

module.exports = {
  VALID_ORDER_STATUSES,
  getSalesAnalytics
};