import React, { useEffect, useState } from "react";
import API from "../../services/api";
import ProductCard from "../../features/products/components/ProductCard";
import "./Products.css";

function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    useEffect(() => {
        API.get("/categories").then((res) => setCategories(res.data));
    }, []);

    useEffect(() => {
        setLoading(true);
        let url = `/products?page=${page}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (categoryId) url += `&category_id=${categoryId}`;

        API.get(url)
            .then((res) => {
                setProducts(res.data.data || []);
                setLastPage(res.data.last_page || 1);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [search, categoryId, page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
    };

    return (
        <div className="products-page">
            <h1>All Products</h1>

            
            <div className="products-filters">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </form>

                <select
                    value={categoryId}
                    onChange={(e) => {
                        setCategoryId(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            
            {loading ? (
                <p className="loading-text">Loading...</p>
            ) : products.length === 0 ? (
                <p className="empty-text">No products found.</p>
            ) : (
                <>
                    <div className="product-grid">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    
                    <div className="pagination">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                        >
                            Prev
                        </button>
                        <span>
                            Page {page} of {lastPage}
                        </span>
                        <button
                            disabled={page >= lastPage}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Products;
