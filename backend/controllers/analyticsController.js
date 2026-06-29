const Order = require("../models/Order");
const User = require("../models/User");
const Products = require("../models/Product");

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

module.exports = { getAdminStats };