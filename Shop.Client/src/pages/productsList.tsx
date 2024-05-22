import {
  useGetAllProductsQuery,
  useGetProductsBySearchQuery,
} from '../redux/api/products-api.ts';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import placeholder from '../img/product-placeholder.png';
import { IFilter, IProduct } from '@Shared/types.ts';
import { Loader, LoaderWrapper } from './home.tsx';
import { ChangeEvent, useState } from 'react';

const ProductListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  box-sizing: border-box;
  max-width: 1000px;
  width: 100%;
`;

const Form = styled.form`
  display: flex;
  gap: 1rem;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  border: 0;
  background: white;
  padding: 0.25rem 1rem;
  border-radius: 1rem;
  box-shadow: 0 0 3px 3px rgba(0, 0, 0, 0.2);
  outline: none;
  color: rgb(54, 54, 54);
  font-size: 1rem;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
`;

const Title = styled.h2`
  width: 100%;
`;

const List = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Product = styled.div`
  display: flex;
  background: white;
  padding: 1rem;
  gap: 1rem;
  border-radius: 1rem;
  box-shadow: 0 0 3px 3px rgba(0, 0, 0, 0.2);
  flex: 1;
`;

const ImageWrapper = styled.div`
  width: 100px;
  display: flex;
  align-items: center;
`;

const Image = styled.img`
  width: 100%;
`;
const Details = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  white-space: nowrap;
`;

const StyledLink = styled(Link)`
  font-size: 1.25rem;
  font-weight: 700;
  text-decoration: none;
  color: rgb(54, 54, 54);
`;

const Price = styled.span`
  font-weight: 700;
`;

export const ProductsListComponent = () => {
  const [searchQuery, setSearchQuery] = useState<IFilter>({
    title: undefined,
    description: undefined,
    priceFrom: undefined,
    priceTo: undefined,
  });

  const hasFilters =
    searchQuery.title ||
    searchQuery.description ||
    searchQuery.priceFrom ||
    searchQuery.priceTo;

  const {
    data: allProducts,
    isLoading: isLoadingAll,
    error: errorAll,
  } = useGetAllProductsQuery({});

  const {
    data: filteredProducts,
    isLoading: isLoadingFiltered,
    error: errorFiltered,
  } = useGetProductsBySearchQuery(searchQuery, {
    skip: !hasFilters,
  });

  const products = hasFilters ? filteredProducts : allProducts;
  const isLoading = hasFilters ? isLoadingFiltered : isLoadingAll;
  const error = hasFilters ? errorFiltered : errorAll;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchQuery((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <ProductListWrapper>
      <Form method={'GET'}>
        <Input
          type={'text'}
          name={'title'}
          value={searchQuery.title}
          placeholder={'Название товара...'}
          onChange={handleChange}
        />
        <Input
          type={'text'}
          name={'description'}
          value={searchQuery.description}
          placeholder={'Описание товара...'}
          onChange={handleChange}
        />
        <Input
          type={'number'}
          name={'priceFrom'}
          value={searchQuery.priceFrom}
          placeholder={'Цена от, руб.'}
          onChange={handleChange}
        />
        <Input
          type={'number'}
          name={'priceTo'}
          value={searchQuery.priceTo}
          placeholder={'Цена до, руб.'}
          onChange={handleChange}
        />
      </Form>
      <Title>Список товаров: {products?.length || 0}</Title>
      {isLoading && (
        <LoaderWrapper>
          <Loader />
        </LoaderWrapper>
      )}
      {error && <span>Неизвестная ошибка</span>}
      {products && products.length > 0 && (
        <List>
          {products.map((product: IProduct) => (
            <Product key={product.id}>
              <ImageWrapper>
                <Link to={`/${product.id}`}>
                  <Image
                    src={product.thumbnail?.url || placeholder}
                    alt={product.title}
                  />
                </Link>
              </ImageWrapper>
              <Details>
                <StyledLink to={`/${product.id}`}>{product.title}</StyledLink>
                <Price>{product.price} ₽</Price>
                <div>Комментариев: {product.comments?.length || 0}</div>
              </Details>
            </Product>
          ))}
        </List>
      )}
    </ProductListWrapper>
  );
};
