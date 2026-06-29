const Razorpay = require('razorpay');
const crypto = require('crypto');
dotenv = require('dotenv');
dotenv.config();


const createOrder = async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const options = {
      amount: req.body.amount *100,//amount is the smallest currency unit, so multiply by 100 for INR
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
    try{
      const {razorpay_order_id , razorpay_payment_id , razorpay_signature} = req.body;
      const generated_signature = crypto
          .createHmac("sha256" , process.env.RAZORPAY_KEY_SECRET)
          .update(razorpay_order_id + "|" + razorpay_payment_id)
          .digest("hex");
      if(generated_signature == razorpay_signature){
        res.status(200).json({message: "Payment verified successfully"});
      }else{
        res.status(400).json({message: "Payment verification failed"});
      }
    } catch(error){
      res.status(500).json({message:"Server error"});
    }
};

module.exports = {createOrder , verifyPayment};