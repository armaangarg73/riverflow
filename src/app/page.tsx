import React from "react";
import HeroSection from "./components/HeroSection";
import LatestQuestions from "./components/LatestQuestions";
import TopContributers from "./components/TopContributers";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div>
      <HeroSection />

      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-3xl font-bold">Latest Questions</h2>
            <LatestQuestions />
          </div>

          <div className="lg:col-span-1">
            <h2 className="mb-6 text-3xl font-bold">Top Contributors</h2>
            <TopContributers />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
