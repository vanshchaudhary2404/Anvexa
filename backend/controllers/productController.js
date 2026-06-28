const Product = require('../models/product');
const cloudinary = require('../config/cloudinary');


//get request to get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get request to get a specific product by id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//post request to create a new product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category , stock } = req.body;
    let imageUrl = ''; // Initialize imageUrl variable

    if( req.file){
      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      // console.log('Cloudinary upload result:', result); // Log the result for debugging
      imageUrl = result.secure_url;
    }
    

    // Create new product
    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      imageUrl: imageUrl
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//put request to update a product
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category , stock } = req.body;
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.category = category || product.category;
      product.stock = stock || product.stock;
      if (req.file) {
        // Upload new image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);
        // // console.log('Cloudinary upload result:', result); // Log the result for debugging
        product.imageUrl = result.secure_url;
      }
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    } 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete request to delete a product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};