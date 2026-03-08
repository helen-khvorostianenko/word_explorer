import { NavLink, useLocation } from 'react-router';

function PageLayout({ children }) {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <>
      <header>
        <NavLink to="/">Word Explorer</NavLink>
        <nav>
          {!isHome && (
            <>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/about">About</NavLink>
            </>
          )}
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <p>
          Built with ♥ by{' '}
          <a href="https://www.linkedin.com/in/helen-khvorostianenko/"
            target="_blank"
            rel="noreferrer"
          >
            Olena Khvorostianenko
          </a>{' '}
          at{' '}
          <a href="https://codethedream.org" 
            target="_blank" 
            rel="noreferrer"
          >
            Code the Dream
          </a>{' '}
          — for everyday usage.
        </p>
      </footer>
    </>
  );
}

export default PageLayout;
