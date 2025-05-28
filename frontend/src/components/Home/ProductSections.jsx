import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import styles from "../../styles/styles";
import Loader from "../Layout/Loader";
import ProductCard from "../Route/ProductCard/ProductCard";

const ProductSections = () => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [topOffers, setTopOffers] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [flashSaleItems, setFlashSaleItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const [recommended, offers, popular, latest, flashSale] = await Promise.all([
          axios.get(`${server}/user-products/recommended`),
          axios.get(`${server}/user-products/top-offers`),
          axios.get(`${server}/user-products/popular`),
          axios.get(`${server}/user-products/latest`),
          axios.get(`${server}/user-products/flash-sale`),
        ]);

        setRecommendedProducts(recommended.data.products);
        setTopOffers(offers.data.products);
        setPopularProducts(popular.data.products);
        setLatestProducts(latest.data.products);
        setFlashSaleItems(flashSale.data.flashSaleItems);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full">
      {/* Recommended Products */}
      <div className="mb-8">
        <h2 className={`${styles.heading} text-2xl font-bold mb-4`}>
          Recommended Products
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {recommendedProducts.map((product) => (
            <ProductCard key={product._id} data={product} />
          ))}
        </div>
      </div>

      {/* Top Offers */}
      <div className="mb-8">
        <h2 className={`${styles.heading} text-2xl font-bold mb-4`}>
          Top Offers
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {topOffers.map((product) => (
            <ProductCard key={product._id} data={product} />
          ))}
        </div>
      </div>

      {/* Most Popular */}
      <div className="mb-8">
        <h2 className={`${styles.heading} text-2xl font-bold mb-4`}>
          Most Popular
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {popularProducts.map((product) => (
            <ProductCard key={product._id} data={product} />
          ))}
        </div>
      </div>

      {/* Latest Products */}
      <div className="mb-8">
        <h2 className={`${styles.heading} text-2xl font-bold mb-4`}>
          Latest Products
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {latestProducts.map((product) => (
            <ProductCard key={product._id} data={product} />
          ))}
        </div>
      </div>

      {/* Flash Sale */}
      <div className="mb-8">
        <h2 className={`${styles.heading} text-2xl font-bold mb-4`}>
          Flash Sale
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {flashSaleItems.map((product) => (
            <ProductCard key={product._id} data={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSections; 