import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { getStoredUser, clearAuth } from '../features/auth/storage';
import Container from './ui/Container';
import './Layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    window.addEventListener('sweetpress-auth', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('sweetpress-auth', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="mp-header">
        <Container
          size="lg"
          className="mp-header-inner"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Link to="/" className="mp-logo" style={{ textDecoration: 'none' }}>
            <span className="mp-logo-dot" />
            <span className="mp-logo-name">SweetPress</span>
          </Link>
          <nav className="mp-nav">
            <Link to="/">메인</Link>
            <Link to="/anthology">합동지</Link>
            {user && <Link to="/orders">주문조회</Link>}
          </nav>
          <div className="mp-header-right">
            {user ? (
              <>
                <span className="nav-user-name">{user.name}님</span>
                <button type="button" className="nav-user-logout" onClick={handleLogout}>
                  로그아웃
                </button>
              </>
            ) : (
              <Link to="/login" className="mp-credit-pill">
                <span>로그인</span>
              </Link>
            )}
          </div>
        </Container>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
