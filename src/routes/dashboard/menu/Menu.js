import { Box, Container, Typography } from '@mui/material';
import * as React from 'react';
import { ProductContainer } from './product/Product';
import { CategoryContainer } from './category/Category';
import { useContext } from 'react';
import { CategoryContext } from './category/providers/CategoryContext';
import { ProductContext } from './product/providers/ProductContext';
import { NavActionButtons } from './components/NavActionButtons';
import './Menu.css';

export function Menu() {
  const { showCategories } = useContext(CategoryContext);
  const { showProducts } = useContext(ProductContext);

  return (
    <Box className="menu-container">
      <Container maxWidth="xl" className="menu-content">
        <NavActionButtons />

        <Box className="menu-grid">
          {/* Top - Categories Section */}
          <Box
            className="categories-section"
            sx={{
              mb: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              Categorias
            </Typography>
            <CategoryContainer />
          </Box>

          {/* Bottom - Products Section */}
          <Box
            className="products-section"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              Produtos
            </Typography>
            <ProductContainer />
          </Box>
        </Box>

        {!showCategories && !showProducts && (
          <Typography variant="h6" sx={{ marginTop: 6, textAlign: 'center' }}>
            Carregando cardápio...
          </Typography>
        )}
      </Container>
    </Box>
  );
}
