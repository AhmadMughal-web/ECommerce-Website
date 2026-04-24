import React from 'react'
import Header from '../components/layout/Header'
import CheckoutSteps from '../components/CheckOut/CheckoutSteps';
import Checkout from '../components/CheckOut/Checkout';
import Footer from '../components/layout/Footer'


const CheckoutPage = () => {
  return (
    <div>
        <Header />
        <br />
        <br />
        <CheckoutSteps active={1} />
        <Checkout />
        <br />
        <br />
        <Footer />
    </div>
  )
}

export default CheckoutPage