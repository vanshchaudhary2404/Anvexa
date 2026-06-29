const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

dotenv.config();

dns.setServers(['1.1.1.1', '8.8.8.8']);

const connectForSeed = async () => {
	const cloudUri = process.env.MONGO_URI;
	const localUri = 'mongodb://127.0.0.1:27017/anvexa-merrn';

	if (cloudUri) {
		try {
			await mongoose.connect(cloudUri);
			console.log('MongoDB connected for seeding (MONGO_URI)');
			return;
		} catch (error) {
			const isDnsOrSrvIssue =
				error?.code === 'ECONNREFUSED' ||
				error?.code === 'ENOTFOUND' ||
				error?.syscall === 'querySrv';

			if (!isDnsOrSrvIssue) {
				throw error;
			}

			console.warn(`Primary MongoDB URI failed (${error.code || error.syscall}). Trying local DB...`);
		}
	}

	await mongoose.connect(localUri);
	console.log('MongoDB connected for seeding (local fallback)');
};

const seedData = async () => {
	try {
		await connectForSeed();

		await Order.deleteMany({});
		await Product.deleteMany({});
		await User.deleteMany({});

		const saltRounds = 10;
		const adminSalt = await bcrypt.genSalt(saltRounds);
		const userSalt = await bcrypt.genSalt(saltRounds);
		const adminPassword = await bcrypt.hash('Admin@123', adminSalt);
		const userPassword = await bcrypt.hash('User@123', userSalt);

		const users = await User.insertMany([
			{
				username: 'Anvexa Admin',
				email: 'admin@anvexa.com',
				password: adminPassword,
				role: 'admin',
				verified: true,
			},
			{
				username: 'Rohan Sharma',
				email: 'rohan@example.com',
				password: userPassword,
				role: 'user',
				verified: true,
			},
			{
				username: 'Priya Verma',
				email: 'priya@example.com',
				password: userPassword,
				role: 'user',
				verified: false,
			},
		]);
		console.log(`Created users: ${users.length}`);

		const products = await Product.insertMany([
			{
				name: 'Classic White Sneakers',
				description: 'Everyday lightweight sneakers with cushioned sole.',
				price: 2499,
				category: 'Footwear',
				stock: 35,
				imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772',
				rating: 4.4,
				numReviews: 28,
			},
			{
				name: 'Denim Jacket',
				description: 'Slim-fit blue denim jacket for casual wear.',
				price: 3199,
				category: 'Apparel',
				stock: 22,
				imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246',
				rating: 4.2,
				numReviews: 15,
			},
			{
				name: 'Wireless Neckband Earphones',
				description: 'Bluetooth neckband with deep bass and 20h battery.',
				price: 1799,
				category: 'Electronics',
				stock: 48,
				imageUrl: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd',
				rating: 4.1,
				numReviews: 41,
			},
			{
				name: 'Minimalist Analog Watch',
				description: 'Matte black dial watch with leather strap.',
				price: 2899,
				category: 'Accessories',
				stock: 18,
				imageUrl: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3',
				rating: 4.5,
				numReviews: 19,
			},
			{
				name: 'Cotton Crew T-Shirt',
				description: 'Premium combed cotton t-shirt, regular fit.',
				price: 799,
				category: 'Apparel',
				stock: 75,
				imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
				rating: 4.0,
				numReviews: 33,
			},
		]);
		console.log(`Created products: ${products.length}`);

		await Order.insertMany([
			{
				user: users[1]._id,
				items: [
					{
						productId: products[0]._id,
						qty: 1,
						price: products[0].price,
					},
					{
						productId: products[4]._id,
						qty: 2,
						price: products[4].price,
					},
				],
				totalAmount: products[0].price + products[4].price * 2,
				address: {
					fullName: 'Rohan Sharma',
					street: '22 Green Park',
					city: 'New Delhi',
					postalCode: '110016',
					country: 'India',
				},
				paymentId: 'pay_demo_1001',
				status: 'Delivered',
			},
			{
				user: users[2]._id,
				items: [
					{
						productId: products[2]._id,
						qty: 1,
						price: products[2].price,
					},
					{
						productId: products[3]._id,
						qty: 1,
						price: products[3].price,
					},
				],
				totalAmount: products[2].price + products[3].price,
				address: {
					fullName: 'Priya Verma',
					street: '8 Residency Road',
					city: 'Bengaluru',
					postalCode: '560025',
					country: 'India',
				},
				paymentId: 'pay_demo_1002',
				status: 'Processing',
			},
		]);


		console.log('✅Database seeded successfully');
		await mongoose.disconnect();
		process.exit(0);
	} catch (error) {
		console.error('❌ Seeding failed:', error);
		if (mongoose.connection.readyState !== 0) {
			await mongoose.disconnect();
		}
		process.exit(1);
	}
};

seedData();