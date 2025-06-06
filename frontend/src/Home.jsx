import React from "react";
import Header from "./Components/HomePage/Header";
import Section1 from "./Components/HomePage/Section1";
import Section2 from "./Components/HomePage/Section2";
import Section3 from "./Components/HomePage/Section3";
import About from "./Components/HomePage/About";	
import Contact from "./Components/HomePage/Contact";
import Footer from "./Components/HomePage/Footer";

function Home(){
    return(
        <>
        <Header/>
        <Section1/>
        <Section2/>
        <Section3/>
        <Contact/>
        <About/>
        <Footer/>
        
        </>
    )
}
export default Home;