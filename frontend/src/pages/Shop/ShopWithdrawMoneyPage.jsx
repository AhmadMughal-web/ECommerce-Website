import React from 'react'
import DashboardHeader from '../../components/shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/shop/Layout/DashboardSideBar'
import WithdrawMoney from "../../components/shop/WithdrawMoney"

const ShopWithdrawMoneyPage = () => {
  return (
     <div>
      <DashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className=" w-[80px]  800px:w-[280px] ">
          <DashboardSideBar active={7} />
        </div>
        <WithdrawMoney />
      </div>
    </div>
  )
}

export default ShopWithdrawMoneyPage