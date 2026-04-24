import React, { useEffect } from 'react'
import ShopCreate from '../components/shop/ShopCreate.jsx'
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
const ShopCreatePage = () => {
   const navigate = useNavigate();
  const { isSeller, seller } = useSelector((state) => state.seller);
  useEffect(() => {
      if (isSeller && seller?._id) {
        navigate(`/shop/${seller._id}`);
      }
    }, [isSeller, seller, navigate]);
  
    // Only hide form if seller exists and we will navigate
    if (isSeller && seller?._id) return null;
  
  return (
    <div>
      <ShopCreate/>
    </div>
  )
}

export default ShopCreatePage
