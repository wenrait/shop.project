import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    width: 100%;
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1;
    font-weight: 400;
    display: flex;
    justify-content: center;

    color: rgb(54, 54, 54);
    background-color: rgb(224, 224, 224);
  }

  body {
    margin: 0;
    display: flex;
    justify-content: center;
    max-width: 1000px;
    width: 100%;
  }

  h1 {
    font-size: 3.2em;
    line-height: 1.1;
  }

  a {
    text-decoration: none;
  }
`;
