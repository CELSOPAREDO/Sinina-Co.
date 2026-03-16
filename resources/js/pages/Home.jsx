import React, { useEffect, useState } from "react";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import "./Home.css";

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/products?per_page=8")
            .then((res) => {
                setProducts(res.data.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="home">
            
            <section className="hero">
                <div className="hero-content">
                    <h1>Welcome to Sinina Co.</h1>
                    <p>
                        Discover affordable, locally made fashion products.
                        <br />
                        Support local entrepreneurship — shop with us today!
                    </p>
                    <a href="/products" className="hero-btn">
                        Shop Now
                    </a>
                </div>
            </section>

            
            <section className="featured-section">
                <h2>Featured Products</h2>
                {loading ? (
                    <p className="loading-text">Loading products...</p>
                ) : products.length === 0 ? (
                    <p className="empty-text">No products available yet.</p>
                ) : (
                    <div className="product-grid">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Home;
