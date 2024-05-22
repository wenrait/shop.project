import placeholder from '../img/product-placeholder.png';
import {
  useGetProductByIdQuery,
  useGetSimilarProductsQuery,
} from '../redux/api/products-api.ts';
import { Link, useParams } from 'react-router-dom';
import { Loader, LoaderWrapper } from './home.tsx';
import styled from 'styled-components';
import { ChangeEvent, FormEvent, useState } from 'react';
import {
  useCreateCommentMutation,
  useGetCommentsByProductIdQuery,
} from '../redux/api/comments-api.ts';

const Product = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
`;

const Header = styled.div`
  display: flex;
  padding: 3rem;
  gap: 3rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 0 3px 3px rgba(0, 0, 0, 0.2);
  flex: 1;
`;

const Thumbnail = styled.img`
  max-width: 300px;
  width: 100%;
`;

const Details = styled.div`
  width: 100%;
  display: flex;
  gap: 1rem;
  flex: 1;
  flex-direction: column;
  justify-content: center;
`;

const ProductTitle = styled.h1`
  margin: 0;
`;

const Price = styled.div`
  font-weight: 700;
  font-size: 2rem;
`;

const ImagesContainer = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
  overflow: hidden;
`;

const Image = styled.img`
  max-width: 100px;
  max-height: 100px;
`;

const Title = styled.h2`
  margin: 0;
`;

const SimilarProductsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SimilarProductsContainer = styled.div`
  box-sizing: border-box;

  display: flex;
  gap: 1rem;
  width: 100%;
  background: white;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 0 3px 3px rgba(0, 0, 0, 0.2);
  flex: 1;
`;

const SimilarProduct = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SimilarProductLink = styled(Link)`
  color: rgb(54, 54, 54);
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
`;

const SimilarProductPrice = styled.div`
  color: rgb(54, 54, 54);
  font-weight: 700;
  font-size: 0.75rem;
`;

const CommentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const Comment = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  padding: 1rem;
  gap: 1rem;
  border-radius: 1rem;
  box-shadow: 0 0 3px 3px rgba(0, 0, 0, 0.2);
  flex: 1;
`;

const CommentName = styled.span`
  font-weight: 700;
`;

const CommentEmail = styled.span`
  font-weight: 700;
`;

const CommentBody = styled.span`
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

export const ProductComponent = () => {
  const [createComment] = useCreateCommentMutation();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    body: '',
    email: '',
  });

  const { data: product, isLoading, error } = useGetProductByIdQuery(id!);
  const { data: comments, refetch: refetchComments } =
    useGetCommentsByProductIdQuery(id!);
  const { data: similarProducts } = useGetSimilarProductsQuery(id!);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const newComment = {
        ...formData,
        productId: id!,
      };

      await createComment(newComment);

      setFormData({
        name: '',
        body: '',
        email: '',
      });

      await refetchComments();
    } catch (err) {
      console.error('Failed to create product: ', err);
    }
  };

  if (isLoading) {
    return (
      <LoaderWrapper>
        <Loader />
      </LoaderWrapper>
    );
  }
  if (error) return <div>Неизвестная ошибка</div>;

  if (!product) return <div>Товар с ID {id} не был найден</div>;

  if (product) {
    const { title, description, price, thumbnail, images } = product;
    return (
      <Product>
        <Header>
          <Thumbnail src={thumbnail?.url || placeholder} alt={title} />
          <Details>
            <ProductTitle>{title}</ProductTitle>
            <Price>{price} ₽</Price>
            <div>{description}</div>
            <ImagesContainer>
              {images &&
                images.map((image) => (
                  <Image src={image.url} alt={image.url} />
                ))}
            </ImagesContainer>
          </Details>
        </Header>
        {similarProducts && similarProducts.length > 0 && (
          <SimilarProductsWrapper>
            <Title>Похожие товары</Title>
            <SimilarProductsContainer>
              {similarProducts.map((product) => (
                <SimilarProduct>
                  <SimilarProductLink to={`/${product.id}`}>
                    {product.title}
                  </SimilarProductLink>
                  <SimilarProductPrice>{product.price} ₽</SimilarProductPrice>
                </SimilarProduct>
              ))}
            </SimilarProductsContainer>
          </SimilarProductsWrapper>
        )}
        <Title>Комментарии</Title>
        <Form onSubmit={handleSubmit} method={'POST'}>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            type="text"
            name="body"
            value={formData.body}
            onChange={handleChange}
          />
          <Input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <Button type={'submit'}>Submit</Button>
        </Form>
        {comments && (
          <div>
            <CommentsContainer>
              {comments.map((comment) => (
                <Comment>
                  <CommentName>{comment.name}</CommentName>
                  <CommentEmail>{comment.email}</CommentEmail>
                  <CommentBody>{comment.body}</CommentBody>
                </Comment>
              ))}
            </CommentsContainer>
          </div>
        )}
      </Product>
    );
  }
};
