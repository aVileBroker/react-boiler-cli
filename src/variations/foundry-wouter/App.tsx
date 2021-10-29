import { Switch, Route } from "wouter";
import { FoundryProvider } from "@headstorm/foundry-react-ui";
import styled from "styled-components";

import Home from "screens/Home";
import Login from "screens/Login";

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
    <Switch>
      <Container>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="">
          <Home />
        </Route>
      </Container>
    </Switch>
  </FoundryProvider>
);
