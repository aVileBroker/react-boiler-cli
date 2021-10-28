import { FoundryProvider } from '@headstorm/foundry-react-ui';
import styled from 'styled-components';

const Container = styled.div`
  width: 1080px;
  max-width: 90vw;
  margin: 0 auto;
  padding: 3rem 1rem 1rem;

  display: flex;
  flex-flow: column nowrap;
  gap: 2rem;
`;

export default (): JSX.Element | null => (
  <FoundryProvider>
    <Container></Container>
  </FoundryProvider>
);
