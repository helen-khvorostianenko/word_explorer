import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --navy:        #1B2A4A;
    --navy-light:  #243560;
    --blue:        #4A90B8;
    --gold:        #B8960C;
    --gold-light:  #d4ae2a;
    --bg:          #f4f6f8;
    --surface:     #ffffff;
    --border:      #dce3ea;
    --text:        #1a1a2e;
    --text-muted:  #6b7a8d;
    --radius:      8px;
    --shadow:      0 2px 8px rgba(27, 42, 74, 0.08);
    --shadow-md:   0 4px 16px rgba(27, 42, 74, 0.13);
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Georgia', serif;
    font-size: 16px;
    line-height: 1.6;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;

export default GlobalStyles;
