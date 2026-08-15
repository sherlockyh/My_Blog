import HeroSection from './HeroSection';
import FeatureCards from './FeatureCards';
import FeaturedProjects from './FeaturedProjects';
import LatestArticles from './LatestArticles';
import '../../styles/home.css';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeatureCards />
      <FeaturedProjects />
      <LatestArticles />
    </>
  );
}
