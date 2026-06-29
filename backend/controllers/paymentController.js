const Razorpay = require('razorpay');
const crypto = require('crypto');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Order = require('../models/Order');
dotenv.config();


const createOrder = async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // amount is in paise for INR
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"), // generate a random receipt id
    };

    const order = await instance.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({
        message: 'razorpay_order_id, razorpay_payment_id, razorpay_signature, and orderId are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid orderId' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to verify this payment' });
    }

    order.paymentId = razorpay_payment_id;
    if (order.status === 'Pending') {
      order.status = 'Processing';
    }

    await order.save();

    return res.status(200).json({
      message: 'Payment verified successfully',
      orderId: order._id,
      paymentId: order.paymentId,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {createOrder , verifyPayment};