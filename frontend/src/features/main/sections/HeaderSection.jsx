import { Link } from 'react-router-dom';
import Container from '../../../components/ui/Container';
import { useAuth } from '../../auth/useAuth';

/**
 * Landing Header — Figma node 38:2
 * 로고, 네비게이션, 크레딧/아바타. 비로그인 시 로그인 링크 노출.
 */
function HeaderSection() {
  const { isLoggedIn } = useAuth();

  return (
    <header className="mp-header">
      <Container size="lg" className="mp-header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" className="mp-logo" style={{ textDecoration: 'none' }}>
          <span className="mp-logo-dot" />
          <span className="mp-logo-name">SweetPress</span>
        </Link>
        <nav className="mp-nav">
          <Link to="/wizard">새 책 만들기</Link>
          <Link to="/books">내 작업</Link>
          <Link to="/orders">주문 내역</Link>
          <a href="#guide">가이드</a>
        </nav>
        <div className="mp-header-right">
          {isLoggedIn ? (
            <>
              <Link to="/credits" className="mp-credit-pill">
                <span className="mp-credit-dot" />
                <span>₩ 50,000</span>
              </Link>
              <span className="mp-avatar" />
            </>
          ) : (
            <Link to="/login" className="mp-credit-pill">
              <span>로그인</span>
            </Link>
          )}
        </div>
      </Container>
    </header>
  );
}

export default HeaderSection;
