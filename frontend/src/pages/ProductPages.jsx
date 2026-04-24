import React, { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import styles from "../styles/style";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/Route/productCard/productCard";
import { useSelector } from "react-redux";

const ProductPages = () => {
  const [searchParams] = useSearchParams();
  const categoryData = searchParams.get("category");
  const { allProducts } = useSelector((state) => state.products);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (categoryData === null) {
      const d =
        allProducts && [...allProducts].sort((a, b) => a.sold_out - b.sold_out);
      setData(d);
    } else {
      const d =
        allProducts && allProducts.filter((i) => i.category === categoryData);
      setData(d);
    }

    // window.scrollTo(0, 0);
  }, [allProducts, categoryData]);
  

  return (
    <div>
      <Header activeHeading={3} />
      <br />
      <br />
      <div className={`${styles.section}`}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2  md:gap-6 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 xl:gap-7 mb-12 ">
          {data && data.map((i, index) => <ProductCard data={i} key={index} />)}
        </div>
        {data && data.length === 0 ? (
          <h1 className="text-center w-full pb-[110px] text-2xl">
            No Products Found!
          </h1>
        ) : null}
      </div>
    </div>
  );
};

export default ProductPages;
