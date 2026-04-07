import Container from '../../../components/ui/Container';

/**
 * Footer — Figma node 42:2
 */
function FooterSection() {
  return (
    <footer className="mp-footer">
      <Container size="lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="mp-footer-left">
          <span className="mp-footer-dot" />
          <span className="mp-footer-name">SweetPress</span>
          <span className="mp-footer-copy">© 2026 · Built on SweetBook API</span>
        </div>
        <div className="mp-footer-right">
          <a href="#guide">가이드</a>
          <a href="#api">API</a>
          <a href="#terms">이용약관</a>
          <a href="#contact">문의</a>
        </div>
      </Container>
    </footer>
  );
}

export default FooterSection;
