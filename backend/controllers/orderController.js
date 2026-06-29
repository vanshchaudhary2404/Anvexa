const Order = require('../models/Order');

const sendEmail = require('../utils/sendEmail');

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, address, paymentId } = req.body;
    if(!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }else{
      const order = new Order({
        user: req.user._id,
        items,
        totalAmount,
        address,
        paymentId
      });
      const createdOrder = await order.save();

      // const message = ` Dear ${req.user.name},\n\nYour order has been successfully placed. Here are the details:\n\nOrder ID: ${order._id}\nTotal Amount: ${order.totalAmount}\n\nThank you for shopping with us!\n\nBest regards,\nAnvexa Team`;
      // await sendEmail(req.user.email, 'Order Confirmation', message);
      res.status(201).json({ message: 'Order created successfully', order: createdOrder });
    }
    
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//get request my orders 
const myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('items.productId', 'name price');
    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// get all orders for admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'id name');
    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching orders: ' + error.message });
  }
};

//updated order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = status;
      await order.save();
      res.status(200).json({ message: 'Order status updated successfully', order });
      
    }else{
      return res.status(404).json({ message: 'Order not found' });
    }
    
  } catch (error) {
    res.status(400).json({ message: 'Error updating order status: ' + error.message });
  }
};

module.exports = {
  createOrder,
  myOrders,
  getOrders,
  updateOrderStatus
};