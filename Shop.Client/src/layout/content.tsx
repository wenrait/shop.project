import styled from 'styled-components';
import { Route, Routes } from 'react-router-dom';
import { HomeComponent } from '../pages/home.tsx';
import { ProductsListComponent } from "../pages/productsList.tsx";
import { ProductComponent } from "../pages/product.tsx";

const Content = styled.main`
  display: flex;
  place-items: center;
  width: 100%;
`;

export const ContentComponent = () => {
  return (
    <Content>
      <Routes>
        <Route path={'/'} element={<HomeComponent />} />
        <Route path={'/products-list'} element={<ProductsListComponent />} />
        <Route path={'/:id'} element={<ProductComponent />} />
      </Routes>
    </Content>
  );
};
