import React from "react";
import Header from "../components/layout/Header";
import Hero from "../components/Route/Hero/Hero";
import Categories from "../components/Route/Categories/Categories.jsx";
import BestDeals from "../components/Route/BestDeals/BestDeals";
import FeaturedProduct from '../components/Route/FeaturedProduct/FeaturedProduct'
import Events from '../components/Events/Event'
import Sponsored from '../components/Route/Sponsered.jsx'
 import Footer from '../components/layout/Footer.jsx'

const HomePage = () => {
  return (
    <div>
      <Header activeHeading={1} />
      <Hero />
      <Categories />
      <BestDeals />
      <Events/>
      <FeaturedProduct/>
      <Sponsored/>
      <Footer/>
    </div>
  );
};

export default HomePage;
