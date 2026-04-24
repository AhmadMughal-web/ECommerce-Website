import React, { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import styles from "../styles/style";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import ProductCard from "../components/Route/productCard/productCard";

const BestSellingPage = () => {
  const [data, setData] = useState([]);
  // FIXED: was using hardcoded static productData — now uses real Redux store
  const { allProducts } = useSelector((state) => state.products);

  useEffect(() => {
    const sorted = allProducts
      ? [...allProducts].sort((a, b) => b.sold_out - a.sold_out)
      : [];
    setData(sorted);
  }, [allProducts]);

  return (
    <div>
      <Header activeHeading={2} />
      <br />
      <br />
      <div className={`${styles.section}`}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 xl:gap-7 mb-12">
          {data && data.map((i, index) => <ProductCard data={i} key={index} />)}
        </div>
        {data && data.length === 0 && (
          <h1 className="text-center w-full pb-[110px] text-2xl">
            No Products Found!
          </h1>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BestSellingPage;
