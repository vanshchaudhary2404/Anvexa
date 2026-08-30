import { React, useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import ProductCard from '../components/ProductCard';
import '../styles/product.css';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [productRes, productsRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch('/api/products')
        ]);

        if (!productRes.ok) {
          throw new Error('Failed to fetch product');
        }

        const productData = await productRes.json();
        const productsData = await productsRes.json();

        setProduct(productData);
        setAllProducts(productsData);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const recommendations = useMemo(() => {
    if (!product || !allProducts.length) return [];

    const sameCategory = allProducts.filter(
      (item) => item.category === product.category && item._id !== product._id
    );

    if (sameCategory.length > 0) {
      return sameCategory.slice(0, 4);
    }

    return allProducts.filter((item) => item._id !== product._id).slice(0, 4);
  }, [allProducts, product]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        qty: 1
      }));

      toast.success('🎉 Product successfully added to cart 🛒!');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', margin: '100px', color: '#f97316' }}>Loading Product...</div>;
  if (!product) return <div style={{ textAlign: 'center', margin: '100px', color: '#ef4444' }}>Product Not Found</div>;

  return (
    <div className="product-detail-wrapper" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      
      {/* Breadcrumb Navigation */}
      <div style={{ color: '#a1a1aa', marginBottom: '20px', fontSize: '0.95rem' }}>
        <Link to="/" style={{ color: '#f97316' }}>Home</Link> / <Link to="/shop" style={{ color: '#f97316' }}>Shop</Link> / {product.category} / <span style={{ color: '#fff' }}>{product.name}</span>
      </div>

      <div className="product-detail">
        {/* Left Side: Image */}
        <div className="detail-image-container">
          <img src={product.imageUrl} alt={product.name} className="detail-image" />
        </div>

        {/* Right Side: Information Block */}
        <div className="detail-info">
          <h2 style={{ fontSize: '2.8rem', marginBottom: '10px' }}>{product.name}</h2>

          <p className="detail-price" style={{ fontSize: '2.5rem', margin: '15px 0' }}>₹{product.price.toFixed(2)}</p>

          {/* Description */}
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#fff', marginBottom: '10px' }}>Product Description</h4>
            <p style={{ color: '#a1a1aa', lineHeight: '1.8' }}>{product.description}</p>
          </div>

          {/* Cart & Stock Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={handleAddToCart} className="btn" style={{ flexGrow: '1', padding: '18px', fontSize: '1.2rem' }}>
              Add to Shopping Cart
            </button>
          </div>

          <p style={{ marginTop: '20px', color: product.stock > 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
            {product.stock > 0 ? `● In Stock (${product.stock} units available)` : `● Temporarily Out of Stock`}
          </p>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="recommendation-section">
          <h3 className="recommendation-title">You may also like</h3>
          <div className="product-grid recommendation-grid">
            {recommendations.map((recommendedProduct) => (
              <ProductCard key={recommendedProduct._id} product={recommendedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;