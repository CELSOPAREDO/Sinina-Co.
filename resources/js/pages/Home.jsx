import React, { useEffect, useState } from "react";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import "./Home.css";

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSlide, setActiveSlide] = useState(0);

    const heroSlides = [
        {
            title: "Welcome to Sinina Co.",
            description:
                "Discover affordable, locally made fashion products. Support local entrepreneurship with every order.",
            image: "/images/hero-slide-1.svg",
        },
        {
            title: "Made Local, Worn Proud",
            description:
                "Shop curated fashion pieces from local makers and bring home quality with everyday style.",
            image: "/images/hero-slide-2.svg",
        },
        {
            title: "Simple Style, Better Value",
            description:
                "Find essentials and statement pieces at prices that keep your wardrobe fresh and accessible.",
            image: "/images/hero-slide-3.svg",
        },
    ];

    useEffect(() => {
        API.get("/products?per_page=8")
            .then((res) => {
                setProducts(res.data.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide((current) => (current + 1) % heroSlides.length);
        }, 4500);

        return () => clearInterval(interval);
    }, [heroSlides.length]);

    return (
        <div className="home">
            
            <section className="hero">
                <div className="hero-bg" aria-hidden="true">
                    {heroSlides.map((slide, index) => (
                        <div
                            key={`slide-bg-${index}`}
                            className={`hero-bg-layer hero-bg-layer-${index + 1} hero-bg-layer-image ${
                                index === activeSlide ? "is-active" : ""
                            }`}
                            style={{ backgroundImage: `url(${slide.image})` }}
                        />
                    ))}
                </div>
                <div className="hero-content">
                    <h1>{heroSlides[activeSlide].title}</h1>
                    <p>{heroSlides[activeSlide].description}</p>
                    <a href="/products" className="hero-btn">
                        Shop Now
                    </a>
                    <div className="hero-dots" aria-label="Hero slides">
                        {heroSlides.map((slide, index) => (
                            <button
                                key={slide.title}
                                type="button"
                                className={`hero-dot ${
                                    index === activeSlide ? "is-active" : ""
                                }`}
                                onClick={() => setActiveSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
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
