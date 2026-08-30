import React, { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import '../styles/product.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const normalizeText = (value) => value.toLowerCase().trim();

  const suggestions = useMemo(() => {
    const query = normalizeText(search);

    if (!query) return [];

    const matched = products.filter((product) => {
      const name = normalizeText(product.name);
      const category = normalizeText(product.category || '');

      return name.includes(query) || category.includes(query);
    });

    const uniqueSuggestions = [];
    const seen = new Set();

    matched.forEach((product) => {
      const key = product.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSuggestions.push(product);
      }
    });

    return uniqueSuggestions.slice(0, 5);
  }, [products, search]);

  const filteredProducts = products.filter((product) => {
    const query = normalizeText(search);

    if (!query) return true;

    const name = normalizeText(product.name);
    const category = normalizeText(product.category || '');

    return name.includes(query) || category.includes(query);
  });

  const handleSuggestionClick = (value) => {
    setSearch(value);
    setShowSuggestions(false);
  };

  return (
    <div className="shop-container">
      <h2>All Products</h2>

      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search products or categories..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 120);
          }}
          className="search-bar"
        />

        {showSuggestions && search && suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map((product) => (
              <button
                key={product._id}
                type="button"
                className="search-suggestion"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionClick(product.name)}
              >
                <span>{product.name}</span>
                <small>{product.category}</small>
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : filteredProducts.length === 0 ? (
        <div>No products found for "{search}"</div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;