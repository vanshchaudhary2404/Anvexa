const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB  = require("./config/db")
// const userRoutes = require("./routes/authRoutes");
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/" , (req , res)=>{
  res.send("Anvexa Backend started....")
});


app.use('/api/auth' , require('./routes/authRoutes'));
// you can add more routes here as needed, for example:
app.use('/api/products' , require('./routes/productRoutes'));
app.use('/api/orders' , require('./routes/orderRoutes'));
app.use('/api/payment' , require('./routes/paymentRoutes'));
app.use('/api/analytics' , require('./routes/analyticsRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT , ()=>{
  console.log(`Server is running on port ${PORT}`);
});

