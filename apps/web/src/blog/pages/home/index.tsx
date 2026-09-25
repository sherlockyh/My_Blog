// 页面用途：组合首页首屏、特色、文章和项目内容。
import HeroSection from './components/HeroSection';
import FeatureCards from './components/FeatureCards';
import FeaturedProjects from './components/FeaturedProjects';
import LatestArticles from './components/LatestArticles';

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
