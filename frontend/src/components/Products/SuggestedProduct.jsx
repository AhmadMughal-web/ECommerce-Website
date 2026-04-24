import React, { useEffect, useState } from "react";
import styles from "../../styles/style";
import ProductCard from "../Route/productCard/productCard";
import { useSelector } from "react-redux";

// FIXED: removed "import { productData } from ../../static/data" — it shadowed the local state variable

const SuggestedProduct = ({ data }) => {
  const { allProducts } = useSelector((state) => state.products);
  const [suggestedProducts, setSuggestedProducts] = useState([]); // FIXED: renamed from productData to avoid conflict

  useEffect(() => {
    if (!data?.category || !allProducts) return;
    const filtered = allProducts.filter(
      (i) => i?.category === data?.category && i?._id !== data?._id // exclude current product
    );
    setSuggestedProducts(filtered);
  }, [data, allProducts]); // FIXED: added [data, allProducts] — was empty [] so never re-ran

  return (
    <div>
      {data ? (
        <div className={`${styles.section}`}>
          <h2 className={`${styles.heading} text-[25px] font-[500] border-b mb-5`}>
            Related Products
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 xl:gap-7 mb-12">
            {suggestedProducts.length > 0 ? (
              suggestedProducts.map((i, index) => (
                <ProductCard data={i} key={index} />
              ))
            ) : (
              <p className="text-gray-500 col-span-full text-center py-4">
                No related products found.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SuggestedProduct;
