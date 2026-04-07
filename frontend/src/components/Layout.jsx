import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getStoredUser, clearAuth } from '../features/auth/storage';

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
      <nav className="nav">
        <div className="nav-brand">SweetBook</div>
        <div className="nav-links">
          <NavLink to="/wizard">위저드</NavLink>
          <NavLink to="/books">책 목록</NavLink>
          <NavLink to="/anthology">합동지</NavLink>
          <NavLink to="/orders">주문</NavLink>
          <NavLink to="/credits">충전금</NavLink>
        </div>
        <div className="nav-user">
          {user ? (
            <>
              <span className="nav-user-name">{user.name}님</span>
              <button type="button" className="nav-user-logout" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <NavLink to="/login">로그인</NavLink>
          )}
        </div>
      </nav>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
