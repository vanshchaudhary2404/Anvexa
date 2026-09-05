const express = require('express');
const {protect} = require('../middleware/authMiddleware');
const {admin} = require('../middleware/adminMiddleware');
const { getAdminStats, getDetailedSalesAnalytics, getAiSalesInsights } = require("../controllers/analyticsController");

const router = express.Router();

router.get("/" , protect , admin , getAdminStats);
router.get("/sales" , protect , admin , getDetailedSalesAnalytics);
router.post("/ai-insights" , protect , admin , getAiSalesInsights);

module.exports = router;