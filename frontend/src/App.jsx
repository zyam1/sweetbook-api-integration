import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './features/home/HomePage';
import LoginPage from './features/auth/LoginPage';
import SignUpPage from './features/auth/SignUpPage';
import AnthologyListPage from './features/anthology/AnthologyListPage';
import AnthologyNewPage from './features/anthology/AnthologyNewPage';
import AnthologyDashboardPage from './features/anthology/AnthologyDashboardPage';
import ContributorsPage from './features/anthology/ContributorsPage';
import AnthologyOrderPage from './features/anthology/AnthologyOrderPage';
import ContributorAuthPage from './features/anthology/ContributorAuthPage';
import ContributorUploadPage from './features/anthology/ContributorUploadPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/c/:token" element={<ContributorAuthPage />} />
        <Route path="/c/:token/upload" element={<ContributorUploadPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/anthology" element={<AnthologyListPage />} />
          <Route path="/anthology/new" element={<AnthologyNewPage />} />
          <Route path="/anthology/:id" element={<AnthologyDashboardPage />} />
          <Route path="/anthology/:id/contributors" element={<ContributorsPage />} />
          <Route path="/anthology/:id/order" element={<AnthologyOrderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
