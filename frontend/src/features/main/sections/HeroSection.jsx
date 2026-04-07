import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../../../components/ui/Container';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../auth/useAuth';
import { fetchLastEditedProject } from '../api';

function formatLastEditedLabel(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return '오늘';
  if (diff < 2 * day) return '어제';
  return `${Math.floor(diff / day)}일 전`;
}

/**
 * Hero — Figma node 39:2
 * 좌측: 타이틀 + 검색/생성 엔트리.
 * 우측: "이어서 작업하기" 카드 (로그인 시에만 노출).
 */
function HeroSection() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [lastProject, setLastProject] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setLastProject(null);
      return;
    }
    let cancelled = false;
    fetchLastEditedProject()
      .then((data) => {
        if (!cancelled) setLastProject(data || null);
      })
      .catch((err) => {
        console.warn('[HeroSection] fetchLastEditedProject 실패', err);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const handleCreate = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/wizard');
  };

  return (
    <section className="mp-hero-wrap">
      <Container size="lg" className="mp-hero">
        <div className="mp-hero-left">
          <h1 className="mp-hero-title">
            오늘은 어떤 책을<br />
            만드시겠어요?
          </h1>
          <p className="mp-hero-sub">판형을 고르면 바로 작업이 시작됩니다.</p>

          <div className="mp-hero-entry">
            <div className="mp-hero-entry-input">
              <span>🔍</span>
              <span>책 이름이나 판형을 입력하세요</span>
            </div>
            <Button variant="primary" size="md" onClick={handleCreate}>
              새 책 만들기
            </Button>
          </div>
        </div>

        {isLoggedIn && lastProject && (
          <aside className="mp-hero-active">
            <div className="mp-hero-active-label">
              <span className="mp-hero-active-label-dot" />
              <span>이어서 작업하기</span>
            </div>
            <h3 className="mp-hero-active-title">{lastProject.title}</h3>
            <p className="mp-hero-active-meta">
              {lastProject.bookSpecUid}
              {lastProject.pageCount != null ? ` · ${lastProject.pageCount}p` : ''}
              {lastProject.lastEditedAt ? ` · 마지막 편집 ${formatLastEditedLabel(lastProject.lastEditedAt)}` : ''}
            </p>
            <Link to="/wizard" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="md" style={{ width: '100%' }}>
                이어서 편집하기 →
              </Button>
            </Link>
          </aside>
        )}
      </Container>
    </section>
  );
}

export default HeroSection;
