import { HeaderComponent } from './layout/header.tsx';
import { GlobalStyle } from './styles/GlobalStyle.ts';
import { BrowserRouter } from 'react-router-dom';
import { ContentComponent } from './layout/content.tsx';
import { Provider } from 'react-redux';
import { store } from './redux/store.ts';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <GlobalStyle />
        <HeaderComponent />
        <ContentComponent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
