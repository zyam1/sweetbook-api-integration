import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { loginApi } from './api';
import { saveAuth } from './storage';
import Modal from '../../components/ui/Modal';

/**
 * SweetPress 로그인 페이지
 * Source: Figma SweetPress / 🔐 Auth / Sign In (Login) (49:3)
 */
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modal, setModal] = useState({ open: false, title: '', message: '', variant: 'info' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await loginApi({ email, password });
      saveAuth(result);
      navigate('/');
    } catch (err) {
      console.error(err);
      setModal({
        open: true,
        title: '로그인 실패',
        message: err?.response?.data?.message || '로그인 실패',
        variant: 'error',
      });
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">다시 만나서 반가워요</h1>
        <p className="auth-subtitle">계정에 로그인하고 작업을 이어가세요</p>

        <div className="auth-spacer" />

        <div className="auth-field">
          <label className="auth-label" htmlFor="auth-email">이메일</label>
          <input
            id="auth-email"
            type="email"
            className="auth-input"
            placeholder="값을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="auth-password">비밀번호</label>
          <input
            id="auth-password"
            type="password"
            className="auth-input"
            placeholder="값을 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="button" className="auth-forgot">비밀번호를 잊으셨나요?</button>

        <button type="submit" className="auth-submit">로그인</button>

        <div className="auth-divider">
          <span className="auth-divider-line" />
          <span className="auth-divider-text">또는</span>
          <span className="auth-divider-line" />
        </div>

        <button type="button" className="auth-google">Google로 계속하기</button>

        <div className="auth-footer">
          <span className="auth-footer-text">아직 계정이 없나요?</span>
          <button
            type="button"
            className="auth-footer-link"
            onClick={() => navigate('/signup')}
          >
            회원가입
          </button>
        </div>
      </form>
      <Modal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
      />
    </div>
  );
}

export default LoginPage;
