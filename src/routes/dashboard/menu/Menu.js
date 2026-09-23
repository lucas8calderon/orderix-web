import { Box, Container } from '@mui/material';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { ProductContainer } from './product/Product';
import { CategoryContainer } from './category/Category';
import './Menu.css';
import { PageHeader } from '../../../commons/components/PageHeader';
import { PageTabs } from '../../../commons/components/PageTabs';

export function Menu() {
  const [tab, setTab] = useState('products');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsRefreshToken, setProductsRefreshToken] = useState(0);
  const [categoriesRefreshToken, setCategoriesRefreshToken] = useState(0);
  const [newProductCategoryId, setNewProductCategoryId] = useState(null);

  const handleCategoriesChange = useCallback((nextCategories) => {
    setCategories(nextCategories || []);
  }, []);

  const handleProductsChange = useCallback((nextProducts) => {
    setProducts(Array.isArray(nextProducts) ? nextProducts : []);
  }, []);

  const handleCategoryDeleted = useCallback(() => {
    setProductsRefreshToken((token) => token + 1);
  }, []);

  const handleAddProductToCategory = useCallback((category) => {
    if (category?.id == null) return;
    setTab('products');
    setNewProductCategoryId(category.id);
  }, []);

  const handlePresetCategoryConsumed = useCallback(() => {
    setNewProductCategoryId(null);
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
<PageHeader title="Catálogo" description="Organize seus produtos, preços e disponibilidade." />
        <PageTabs id="catalog" label="Seções do catálogo" value={tab} onChange={setTab} tabs={[{ value: 'products', label: 'Produtos' }, { value: 'categories', label: 'Categorias' }]} />

        <div role="tabpanel" id="catalog-panel-categories" aria-labelledby="catalog-tab-categories" hidden={tab !== 'categories'} className="menu-section">
          <CategoryContainer
            onCategoriesChange={handleCategoriesChange}
            onCategoryDeleted={handleCategoryDeleted}
            onAddProduct={handleAddProductToCategory}
            refreshToken={categoriesRefreshToken}
            productCounts={productCounts}
          />
        </div>

        <div role="tabpanel" id="catalog-panel-products" aria-labelledby="catalog-tab-products" hidden={tab !== 'products'} className="menu-section">
          <ProductContainer
            onManageCategories={() => setTab('categories')}
            categories={categories}
            refreshToken={productsRefreshToken}
            presetCategoryId={newProductCategoryId}
            onPresetCategoryConsumed={handlePresetCategoryConsumed}
            onProductsChanged={handleProductsChanged}
            onProductsLoaded={handleProductsChange}
          />
        </div>
      </Container>
    </Box>
  );
}
