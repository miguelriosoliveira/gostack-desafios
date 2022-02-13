import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import Logo from '../../assets/logo.svg';

import { Container, Span } from './styles';

interface HeaderProps {
  size?: 'small' | 'large';
}

const Header: React.FC<HeaderProps> = ({ size = 'large' }: HeaderProps) => {
  const location = useLocation();

  return (
    <Container size={size}>
      <header>
        <img src={Logo} alt="GoFinances" />
        <nav>
          <Span selected={location.pathname === '/'}>
            <Link to="/">Listagem</Link>
          </Span>
          <Span selected={location.pathname === '/import'}>
            <Link to="/import">Importar</Link>
          </Span>
        </nav>
      </header>
    </Container>
  );
};

export default Header;
