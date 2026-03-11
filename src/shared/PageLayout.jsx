import { NavLink } from 'react-router';
import styled from 'styled-components';
import { RiFileWord2Line } from 'react-icons/ri';

const StyledHeader = styled.header`
  background: var(--navy);
  border-bottom: 3px solid var(--gold);
  padding: 0.85rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fff;
  font-size: 1.15rem;
  font-weight: bold;
  letter-spacing: 0.04em;

  &.active {
    color: #fff;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
`;

const NavItem = styled(NavLink)`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  padding-bottom: 3px;
  border-bottom: 2px solid transparent;
  transition:
    color 0.2s,
    border-color 0.2s;

  &:hover {
    color: #fff;
  }

  &.active {
    color: var(--gold-light);
    border-bottom-color: var(--gold);
    font-weight: bold;
  }
`;

const Main = styled.main`
  flex: 1;
`;

const Wrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
`;

const StyledFooter = styled.footer`
  border-top: 1px solid var(--border);
  padding: 1.5rem 2rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);

  a {
    color: var(--blue);
    transition: color 0.2s;

    &:hover {
      color: var(--gold);
    }
  }
`;

function PageLayout({ children }) {
  return (
    <>
      <StyledHeader>
        <Logo to="/">
          <RiFileWord2Line size={44} />
        </Logo>
        <Nav>
          <NavItem to="/">Home</NavItem>
          <NavItem to="/about">About</NavItem>
        </Nav>
      </StyledHeader>

      <Main>
        <Wrapper>{children}</Wrapper>
      </Main>

      <StyledFooter>
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
      </StyledFooter>
    </>
  );
}

export default PageLayout;
