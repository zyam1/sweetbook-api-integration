import HeaderSection from './sections/HeaderSection';
import HeroSection from './sections/HeroSection';
import SpecsSection from './sections/SpecsSection';
import WorkspaceSection from './sections/WorkspaceSection';
import FooterSection from './sections/FooterSection';
import './MainPage.css';

/**
 * SweetPress 메인 (랜딩) 페이지
 * Source: Figma SweetPress / 🏠 Main Page (Landing) / Landing / Main (24:3)
 */
function MainPage() {
  return (
    <div className="mp-page">
      <HeaderSection />
      <HeroSection />
      <SpecsSection />
      <WorkspaceSection />
      <FooterSection />
    </div>
  );
}

export default MainPage;
