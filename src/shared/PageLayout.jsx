import { NavLink, useLocation } from 'react-router';

function PageLayout({ children }) {
  const { pathname } = useLocation();
  const navLinkClass = ({ isActive }) =>
    isActive ? 'nav-link active' : 'nav-link';

  return (
    <>
      <header>
        <NavLink to="/" className={navLinkClass}>
          Word Explorer
        </NavLink>
        <nav>
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <p>
          Built with ♥ by{' '}
          <a
            href="https://www.linkedin.com/in/helen-khvorostianenko/"
            target="_blank"
            rel="noreferrer"
          >
            Olena Khvorostianenko
          </a>{' '}
          at{' '}
          <a href="https://codethedream.org" target="_blank" rel="noreferrer">
            Code the Dream
          </a>{' '}
          — for everyday usage.
        </p>
      </footer>
    </>
  );
}

export default PageLayout;
