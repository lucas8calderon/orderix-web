import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  Inventory,
  Warning,
  CheckCircle,
  Error,
  Add,
  Edit,
  Delete,
  Refresh,
  TrendingDown,
  TrendingUp,
  LocalShipping,
  Schedule,
  AttachMoney,
  ShoppingCart,
  BarChart,
  PieChart,
  Category,
  Inventory2,
  LowPriority,
  PriorityHigh
} from '@mui/icons-material';
import { PieChart as RechartsPieChart, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useDialogResponsiveProps } from '../../../commons/hooks/useResponsive';
import './Inventory.css';

const InventoryPanel = ({ stockFilter }) => {
  const [period, setPeriod] = useState('today');
  const [refreshing, setRefreshing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const dialogProps = useDialogResponsiveProps();

  useEffect(() => {
    if (stockFilter === 'critical') {
      document.getElementById('inventory-critical')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [stockFilter]);

  // Mock data - em produção viria de APIs
  const [inventoryData, setInventoryData] = useState({
    totalProducts: 156,
    lowStockItems: 12,
    outOfStockItems: 3,
    totalValue: 45600,
    categories: [
      { name: 'Carnes', count: 45, value: 18500, color: '#f44336' },
      { name: 'Vegetais', count: 38, value: 8900, color: '#4caf50' },
      { name: 'Bebidas', count: 32, value: 12000, color: '#2196f3' },
      { name: 'Temperos', count: 25, value: 3200, color: '#ff9800' },
      { name: 'Outros', count: 16, value: 3000, color: '#2563EB' }
    ],
    lowStockProducts: [
      { id: 1, name: 'Tomate', current: 5, min: 10, unit: 'kg', category: 'Vegetais', lastUpdate: '2h atrás', price: 8.50, supplier: 'Hortifruti ABC' },
      { id: 2, name: 'Cebola', current: 3, min: 8, unit: 'kg', category: 'Vegetais', lastUpdate: '1h atrás', price: 6.20, supplier: 'Hortifruti ABC' },
      { id: 3, name: 'Carne Bovina', current: 2, min: 15, unit: 'kg', category: 'Carnes', lastUpdate: '30min atrás', price: 45.00, supplier: 'Açougue Central' },
      { id: 4, name: 'Refrigerante', current: 8, min: 20, unit: 'un', category: 'Bebidas', lastUpdate: '45min atrás', price: 3.50, supplier: 'Distribuidora XYZ' },
      { id: 5, name: 'Sal', current: 1, min: 5, unit: 'kg', category: 'Temperos', lastUpdate: '1h atrás', price: 2.80, supplier: 'Supermercado 123' }
    ],
    recentMovements: [
      { id: 1, product: 'Tomate', type: 'entrada', quantity: 20, unit: 'kg', date: '10:30', user: 'João Silva', value: 170.00 },
      { id: 2, product: 'Cebola', type: 'saída', quantity: 5, unit: 'kg', date: '10:15', user: 'Maria Santos', value: 31.00 },
      { id: 3, product: 'Carne Bovina', type: 'entrada', quantity: 25, unit: 'kg', date: '09:45', user: 'Pedro Costa', value: 1125.00 },
      { id: 4, product: 'Refrigerante', type: 'saída', quantity: 12, unit: 'un', date: '09:30', user: 'Ana Oliveira', value: 42.00 },
      { id: 5, product: 'Sal', type: 'entrada', quantity: 10, unit: 'kg', date: '09:00', user: 'João Silva', value: 28.00 }
    ],
    topProducts: [
      { name: 'Tomate', usage: 85, stock: 5, min: 10, status: 'low' },
      { name: 'Cebola', usage: 90, stock: 3, min: 8, status: 'low' },
      { name: 'Carne Bovina', usage: 95, stock: 2, min: 15, status: 'critical' },
      { name: 'Refrigerante', usage: 80, stock: 8, min: 20, status: 'low' },
      { name: 'Sal', usage: 98, stock: 1, min: 5, status: 'critical' }
    ],
    monthlyUsage: [
      { month: 'Jan', usage: 1200, cost: 5400 },
      { month: 'Fev', usage: 1350, cost: 6100 },
      { month: 'Mar', usage: 1180, cost: 5300 },
      { month: 'Abr', usage: 1420, cost: 6400 },
      { month: 'Mai', usage: 1380, cost: 6200 },
      { month: 'Jun', usage: 1500, cost: 6800 }
    ],
    suppliers: [
      { name: 'Hortifruti ABC', products: 45, lastDelivery: '2 dias atrás', rating: 4.8, totalValue: 12500 },
      { name: 'Açougue Central', products: 32, lastDelivery: '1 dia atrás', rating: 4.9, totalValue: 18500 },
      { name: 'Distribuidora XYZ', products: 28, lastDelivery: '3 dias atrás', rating: 4.6, totalValue: 9800 },
      { name: 'Supermercado 123', products: 15, lastDelivery: '1 semana atrás', rating: 4.3, totalValue: 3200 }
    ]
  });

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleOpenDialog = (product = null) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return '#f44336';
      case 'low': return '#ff9800';
      case 'normal': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical': return <Error />;
      case 'low': return <Warning />;
      case 'normal': return <CheckCircle />;
      default: return <Inventory />;
    }
  };

  const getMovementIcon = (type) => {
    return type === 'entrada' ? <TrendingUp color="success" /> : <TrendingDown color="error" />;
  };

  const getMovementColor = (type) => {
    return type === 'entrada' ? '#4caf50' : '#f44336';
  };

  return (
    <Box className="inventory-dashboard">
      {/* Header */}
      <Box className="inventory-header">
        <Box className="header-content">
          <Typography variant="h4" className="header-title">
            📦 Controle de Estoque
          </Typography>
          <Typography variant="body1" className="header-subtitle">
            Gerencie seu inventário e otimize suas compras
          </Typography>
        </Box>
        <Box className="header-actions">
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(e, newPeriod) => newPeriod && setPeriod(newPeriod)}
            size="small"
            className="period-filter"
          >
            <ToggleButton value="today">Hoje</ToggleButton>
            <ToggleButton value="week">Semana</ToggleButton>
            <ToggleButton value="month">Mês</ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Atualizar estoque">
            <IconButton 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="refresh-btn"
            >
              <Refresh className={refreshing ? 'rotating' : ''} />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            className="add-product-btn"
          >
            Adicionar Produto
          </Button>
        </Box>
      </Box>

      {/* Alertas de Estoque Baixo */}
      {inventoryData.lowStockItems > 0 && (
        <Alert 
          severity="warning" 
          className="stock-alert"
          action={
            <Button color="inherit" size="small">
              Ver Produtos
            </Button>
          }
        >
          <strong>{inventoryData.lowStockItems} produtos</strong> com estoque baixo e <strong>{inventoryData.outOfStockItems} produtos</strong> em falta!
        </Alert>
      )}

      {/* Métricas Principais */}
      <Grid container spacing={3} className="metrics-grid">
        {/* Total de Produtos */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="metric-card">
            <CardContent>
              <Box className="metric-header">
                <Inventory className="metric-icon" />
                <Typography variant="h6" className="metric-title">
                  Total de Produtos
                </Typography>
              </Box>
              <Typography variant="h4" className="metric-value">
                {inventoryData.totalProducts}
              </Typography>
              <Typography variant="body2" className="metric-subtitle">
                Itens cadastrados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Valor Total do Estoque */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="metric-card">
            <CardContent>
              <Box className="metric-header">
                <AttachMoney className="metric-icon" />
                <Typography variant="h6" className="metric-title">
                  Valor Total
                </Typography>
              </Box>
              <Typography variant="h4" className="metric-value">
                R$ {inventoryData.totalValue.toLocaleString()}
              </Typography>
              <Typography variant="body2" className="metric-subtitle">
                Investimento em estoque
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Estoque Baixo */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="metric-card warning">
            <CardContent>
              <Box className="metric-header">
                <Warning className="metric-icon" />
                <Typography variant="h6" className="metric-title">
                  Estoque Baixo
                </Typography>
              </Box>
              <Typography variant="h4" className="metric-value">
                {inventoryData.lowStockItems}
              </Typography>
              <Typography variant="body2" className="metric-subtitle">
                Produtos com estoque baixo
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Produtos em Falta */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="metric-card critical">
            <CardContent>
              <Box className="metric-header">
                <Error className="metric-icon" />
                <Typography variant="h6" className="metric-title">
                  Em Falta
                </Typography>
              </Box>
              <Typography variant="h4" className="metric-value">
                {inventoryData.outOfStockItems}
              </Typography>
              <Typography variant="body2" className="metric-subtitle">
                Produtos sem estoque
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Categorias e Produtos Críticos */}
      <Grid container spacing={3} className="categories-section">
        {/* Categorias */}
        <Grid item xs={12} md={6}>
          <Card className="section-card">
            <CardContent>
              <Typography variant="h6" className="section-title">
                📊 Distribuição por Categoria
              </Typography>
              <Box className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <RechartsTooltip formatter={(value, name) => [`${value}`, name]} />
                    <RechartsPieChart
                      data={inventoryData.categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="count"
                    >
                      {inventoryData.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </Box>
              <Box className="categories-legend">
                {inventoryData.categories.map((category, index) => (
                  <Box key={index} className="legend-item">
                    <Box 
                      className="legend-color" 
                      style={{ backgroundColor: category.color }}
                    />
                    <Typography variant="body2">
                      {category.name} ({category.count})
                    </Typography>
                    <Typography variant="body2" className="legend-value">
                      R$ {category.value.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Produtos com Estoque Baixo */}
        <Grid item xs={12} md={6} id="inventory-critical">
          <Card className="section-card">
            <CardContent>
              <Typography variant="h6" className="section-title">
                ⚠️ Produtos com Estoque Baixo
              </Typography>
              <List className="products-list">
                {inventoryData.lowStockProducts.slice(0, 5).map((product) => (
                  <ListItem key={product.id} className="product-item" sx={{ pr: { xs: 2, sm: 16 } }}>
                    <ListItemAvatar>
                      <Avatar 
                        className="product-avatar"
                        style={{ backgroundColor: getStatusColor(product.status) }}
                      >
                        {getStatusIcon(product.status)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box className="product-info">
                          <Typography variant="body1" className="product-name">
                            {product.name}
                          </Typography>
                          <Typography variant="body2" className="product-category">
                            {product.category}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box className="product-details">
                          <Typography variant="body2" className="stock-info">
                            {product.current} {product.unit} (mín: {product.min})
                          </Typography>
                          <Typography variant="body2" className="last-update">
                            Atualizado {product.lastUpdate}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box className="product-actions">
                        <Chip 
                          label={`${Math.round((product.current / product.min) * 100)}%`}
                          size="small"
                          className={`stock-chip ${product.current / product.min < 0.5 ? 'critical' : 'low'}`}
                        />
                        <IconButton size="small" onClick={() => handleOpenDialog(product)}>
                          <Edit />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Movimentações Recentes e Fornecedores */}
      <Grid container spacing={3} className="movements-section">
        {/* Movimentações Recentes */}
        <Grid item xs={12} md={8}>
          <Card className="section-card">
            <CardContent>
              <Typography variant="h6" className="section-title">
                📋 Movimentações Recentes
              </Typography>
              <TableContainer sx={{ overflowX: 'auto', display: { xs: 'none', md: 'block' } }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Produto</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Quantidade</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell>Usuário</TableCell>
                      <TableCell>Data</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventoryData.recentMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          <Box className="movement-product">
                            <Typography variant="body2" className="product-name">
                              {movement.product}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getMovementIcon(movement.type)}
                            label={movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                            size="small"
                            style={{ 
                              backgroundColor: getMovementColor(movement.type),
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {movement.quantity} {movement.unit}
                        </TableCell>
                        <TableCell>
                          R$ {movement.value.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {movement.user}
                        </TableCell>
                        <TableCell>
                          {movement.date}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box className="movements-cards-mobile">
                {inventoryData.recentMovements.map((movement) => (
                  <Box key={movement.id} className="movement-mobile-card">
                    <Box className="movement-mobile-header">
                      <Typography variant="body1" className="product-name" sx={{ wordBreak: 'break-word' }}>
                        {movement.product}
                      </Typography>
                      <Chip
                        icon={getMovementIcon(movement.type)}
                        label={movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                        size="small"
                        style={{
                          backgroundColor: getMovementColor(movement.type),
                          color: 'white',
                        }}
                      />
                    </Box>
                    <Typography variant="body2">
                      {movement.quantity} {movement.unit} · R$ {movement.value.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {movement.user} · {movement.date}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Fornecedores */}
        <Grid item xs={12} md={4}>
          <Card className="section-card">
            <CardContent>
              <Typography variant="h6" className="section-title">
                🚚 Fornecedores
              </Typography>
              <List className="suppliers-list">
                {inventoryData.suppliers.map((supplier, index) => (
                  <ListItem key={index} className="supplier-item" sx={{ pr: { xs: 2, sm: 12 } }}>
                    <ListItemAvatar>
                      <Avatar className="supplier-avatar">
                        {supplier.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={supplier.name}
                      secondary={
                        <Box className="supplier-details">
                          <Typography variant="body2">
                            {supplier.products} produtos • ⭐ {supplier.rating}
                          </Typography>
                          <Typography variant="body2" className="supplier-delivery">
                            Última entrega: {supplier.lastDelivery}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="body2" className="supplier-value">
                        R$ {supplier.totalValue.toLocaleString()}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Análise de Uso Mensal */}
      <Grid container spacing={3} className="usage-section">
        <Grid item xs={12}>
          <Card className="section-card">
            <CardContent>
              <Typography variant="h6" className="section-title">
                📈 Análise de Uso Mensal
              </Typography>
              <Box className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={inventoryData.monthlyUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip 
                      formatter={(value, name) => [
                        name === 'usage' ? `${value} unidades` : `R$ ${value.toLocaleString()}`,
                        name === 'usage' ? 'Uso' : 'Custo'
                      ]}
                    />
                    <Bar yAxisId="left" dataKey="usage" fill="#2563EB" name="usage" />
                    <Bar yAxisId="right" dataKey="cost" fill="#ff9800" name="cost" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog para Adicionar/Editar Produto */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" {...dialogProps}>
        <DialogTitle>
          {selectedProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
        </DialogTitle>
        <DialogContent>
          <Box className="dialog-form">
            <TextField
              fullWidth
              label="Nome do Produto"
              margin="normal"
              defaultValue={selectedProduct?.name || ''}
            />
            <TextField
              fullWidth
              label="Categoria"
              margin="normal"
              defaultValue={selectedProduct?.category || ''}
            />
            <Box className="form-row">
              <TextField
                label="Quantidade Atual"
                type="number"
                margin="normal"
                defaultValue={selectedProduct?.current || ''}
                sx={{ mr: 2 }}
              />
              <TextField
                label="Quantidade Mínima"
                type="number"
                margin="normal"
                defaultValue={selectedProduct?.min || ''}
              />
            </Box>
            <Box className="form-row">
              <TextField
                label="Unidade"
                margin="normal"
                defaultValue={selectedProduct?.unit || ''}
                sx={{ mr: 2 }}
              />
              <TextField
                label="Preço Unitário"
                type="number"
                margin="normal"
                defaultValue={selectedProduct?.price || ''}
              />
            </Box>
            <TextField
              fullWidth
              label="Fornecedor"
              margin="normal"
              defaultValue={selectedProduct?.supplier || ''}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ minHeight: 44 }}>Cancelar</Button>
          <Button variant="contained" onClick={handleCloseDialog} sx={{ minHeight: 44 }}>
            {selectedProduct ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryPanel;
