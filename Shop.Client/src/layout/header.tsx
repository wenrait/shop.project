import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HeaderWrapper = styled.header`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: rgb(54, 54, 54);
`;
export const HeaderComponent = () => {
  return (
    <HeaderWrapper>
      <h1>
        <StyledLink to={'/'}>Shop.Client</StyledLink>
      </h1>
    </HeaderWrapper>
  );
};
