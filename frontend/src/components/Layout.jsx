import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="layout">
      <nav className="nav">
        <div className="nav-brand">SweetBook</div>
        <div className="nav-links">
          <NavLink to="/books">책 목록</NavLink>
          <NavLink to="/orders">주문</NavLink>
          <NavLink to="/credits">충전금</NavLink>
        </div>
      </nav>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
