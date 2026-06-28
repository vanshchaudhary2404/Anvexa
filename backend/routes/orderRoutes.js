const express = require('express');
const {protect} = require('../middleware/authMiddleware');
const {admin} = require('../middleware/adminMiddleware');
const {createOrder , getOrders , getMyOrderById , updateOrderStatus} = require('../controllers/orderController');
const router = express.Router();


router.route('/').post(protect , createOrder).get(protect , admin , getOrders);
router.route('/myorders').get(protect , getMyOrderById);
router.route('/:id/status').put(protect , admin , updateOrderStatus);

module.exports = router;