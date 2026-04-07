import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import MainPage from './features/main/MainPage';
import BookListPage from './features/book/BookListPage';
import BookCreatePage from './features/book/BookCreatePage';
import BookDetailPage from './features/book/BookDetailPage';
import OrderPage from './features/order/OrderPage';
import CreditPage from './features/credit/CreditPage';
import WizardLayout from './features/wizard/WizardLayout';
import SpecStep from './features/wizard/SpecStep';
import UploadStep from './features/wizard/UploadStep';
import EditStep from './features/wizard/EditStep';
import OrderStep from './features/wizard/OrderStep';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route element={<Layout />}>
          <Route path="/books" element={<BookListPage />} />
          <Route path="/books/new" element={<BookCreatePage />} />
          <Route path="/books/:bookUid" element={<BookDetailPage />} />
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/credits" element={<CreditPage />} />
          <Route path="/wizard" element={<WizardLayout />}>
            <Route index element={<Navigate to="/wizard/spec" replace />} />
            <Route path="spec" element={<SpecStep />} />
            <Route path="upload" element={<UploadStep />} />
            <Route path="edit" element={<EditStep />} />
            <Route path="order" element={<OrderStep />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
