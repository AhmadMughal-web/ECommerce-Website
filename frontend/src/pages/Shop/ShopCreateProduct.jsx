import React from 'react'
import DashboardHeader from '../../components/shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/shop/Layout/DashboardSideBar'
import CreateProduct from '../../components/shop/CreateProduct'

const ShopCreateProduct = () => {
  return (
    <div>
      <DashboardHeader/>
      <div className="flex items-center justify-between w-full">
      <div className=" w-[80px]  800px:w-[280px] ">
        <DashboardSideBar active={4}/>
      </div>
      <div className="w-full justify-center flex">
        <CreateProduct/>
      </div>
     </div>
    </div>
  )
}

export default ShopCreateProduct
