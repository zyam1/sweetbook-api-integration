import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import BookListPage from './features/book/BookListPage';
import BookCreatePage from './features/book/BookCreatePage';
import BookDetailPage from './features/book/BookDetailPage';
import OrderPage from './features/order/OrderPage';
import CreditPage from './features/credit/CreditPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="/books" element={<BookListPage />} />
          <Route path="/books/new" element={<BookCreatePage />} />
          <Route path="/books/:bookUid" element={<BookDetailPage />} />
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/credits" element={<CreditPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
