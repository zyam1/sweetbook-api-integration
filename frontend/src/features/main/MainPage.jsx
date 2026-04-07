import HeroSection from './sections/HeroSection';
import SpecsSection from './sections/SpecsSection';
import WorkspaceSection from './sections/WorkspaceSection';
import AnthologySection from './sections/AnthologySection';
import FooterSection from './sections/FooterSection';
import { useAuth } from '../auth/useAuth';
import './MainPage.css';
import './sections/AnthologySection.css';

/**
 * SweetPress 메인 (랜딩) 페이지
 * Source: Figma SweetPress / 🏠 Main Page (Landing) / Landing / Main (24:3)
 */
function MainPage() {
  const { isLoggedIn } = useAuth();
  return (
    <div className="mp-page">
      <HeroSection />
      <SpecsSection />
      {isLoggedIn && <WorkspaceSection />}
      <AnthologySection />
      <FooterSection />
    </div>
  );
}

export default MainPage;
