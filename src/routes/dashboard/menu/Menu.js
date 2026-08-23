import { Box, Container, Typography } from '@mui/material';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { ProductContainer } from './product/Product';
import { CategoryContainer } from './category/Category';
import './Menu.css';

export function Menu() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsRefreshToken, setProductsRefreshToken] = useState(0);
  const [categoriesRefreshToken, setCategoriesRefreshToken] = useState(0);

  const handleCategoriesChange = useCallback((nextCategories) => {
    setCategories(nextCategories || []);
  }, []);

  const handleProductsChange = useCallback((nextProducts) => {
    setProducts(Array.isArray(nextProducts) ? nextProducts : []);
  }, []);

  const handleCategoryDeleted = useCallback(() => {
    setProductsRefreshToken((token) => token + 1);
  }, []);

  const handleProductsChanged = useCallback(() => {
    setCategoriesRefreshToken((token) => token + 1);
  }, []);

  const productCounts = useMemo(() => {
    const counts = {};
    products.forEach((product) => {
      if (product?.categoryId == null) return;
      const key = String(product.categoryId);
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [products]);

  return (
    <Box className="menu-container">
      <Container maxWidth="xl" className="menu-content">
        <Typography variant="h4" className="menu-page-title">
          Catálogo
        </Typography>
        <Typography variant="body1" className="menu-page-subtitle">
          Gerencie categorias, subcategorias e produtos da sua loja. Subcategorias são opcionais: lojas simples podem continuar só com categoria e produto.
        </Typography>

        <Box className="menu-section">
          <CategoryContainer
            onCategoriesChange={handleCategoriesChange}
            onCategoryDeleted={handleCategoryDeleted}
            refreshToken={categoriesRefreshToken}
            productCounts={productCounts}
          />
        </Box>

        <Box className="menu-section">
          <ProductContainer
            categories={categories}
            refreshToken={productsRefreshToken}
            onProductsChanged={handleProductsChanged}
            onProductsLoaded={handleProductsChange}
          />
        </Box>
      </Container>
    </Box>
  );
}
