import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpPage.css';
import { signupApi } from './api';
import { saveAuth } from './storage';

/**
 * SweetPress 회원가입 페이지
 * Source: Figma SweetPress / 🔐 Auth / Sign Up (Register) (50:6)
 */
function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agree, setAgree] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agree) {
      alert('이용약관에 동의해주세요');
      return;
    }
    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다');
      return;
    }
    try {
      const result = await signupApi({ name, email, password });
      saveAuth(result);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || '회원가입 실패');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">SweetPress 시작하기</h1>
        <p className="auth-subtitle">몇 가지 정보만 입력하면 바로 시작할 수 있어요</p>

        <div className="auth-spacer" />

        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-name">이름</label>
          <input
            id="signup-name"
            type="text"
            className="auth-input"
            placeholder="값을 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-email">이메일</label>
          <input
            id="signup-email"
            type="email"
            className="auth-input"
            placeholder="값을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-password">비밀번호</label>
          <input
            id="signup-password"
            type="password"
            className="auth-input"
            placeholder="값을 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-password-confirm">비밀번호 확인</label>
          <input
            id="signup-password-confirm"
            type="password"
            className="auth-input"
            placeholder="값을 입력하세요"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
        </div>

        <label className="auth-terms">
          <input
            type="checkbox"
            className="auth-terms-checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <span className="auth-terms-text">이용약관 및 개인정보처리방침에 동의합니다</span>
        </label>

        <button type="submit" className="auth-submit">회원가입</button>

        <div className="auth-footer">
          <span className="auth-footer-text">이미 계정이 있나요?</span>
          <button
            type="button"
            className="auth-footer-link"
            onClick={() => navigate('/login')}
          >
            로그인
          </button>
        </div>
      </form>
    </div>
  );
}

export default SignUpPage;
