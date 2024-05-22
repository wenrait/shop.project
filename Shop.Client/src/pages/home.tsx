import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useGetAllProductsQuery } from '../redux/api/products-api.ts';
import { IProduct } from '@Shared/types.ts';

const Home = styled.div`
  display: flex;
  place-items: center;
  flex-direction: column;
  gap: 1rem;
`;

const Text = styled.span`
  font-weight: 700;
`;

export const LoaderWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

export const Loader = styled.div`
  top: 50%;
  left: 50%;
  width: 5rem;
  height: 5rem;
  box-sizing: border-box;
  border: 4px solid rgb(54, 54, 54);;
  border-radius: 50%;
  border-bottom-color: transparent;
  border-top-color: transparent;
  animation: rotation 1s linear infinite;

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
`;

const Button = styled.button`
  border: 0;
  background: white;
  padding: 0.25rem 1rem;
  border-radius: 1rem;
  box-shadow: 0 0 3px 3px rgba(0, 0, 0, 0.2);
  color: rgb(54, 54, 54);
  font-size: 1rem;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  cursor: pointer;
`;

export const HomeComponent = () => {
  const { data: products, isLoading, error } = useGetAllProductsQuery({});

  let totalCost = 0;

  if (products) {
    totalCost = products
      .map((product: IProduct) => product.price)
      .reduce((acc: number, curr: number) => acc + curr, 0);
  }

  return (
    <Home>
      <a href={'/admin'} target="_blank">
        <Button>Перейти в систему администрирования</Button>
      </a>
      {isLoading && (
        <LoaderWrapper>
          <Loader />
        </LoaderWrapper>
      )}
      {error && <div>Неизвестная ошибка</div>}
      {products && products.length > 0 ? (
        <Text>
          В базе данных находится {products.length} товаров общей стоимостью{' '}
          {totalCost} ₽
        </Text>
      ) : (
        <Text>Товары отсутствуют</Text>
      )}
      {products && products.length > 0 && (
        <Link to={'/products-list'}>
          <Button>Перейти к списку товаров</Button>
        </Link>
      )}
    </Home>
  );
};
