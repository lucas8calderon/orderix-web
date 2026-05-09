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
  ListItemSecondaryAction
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  CreditCard,
  AccountBalanceWallet,
  LocalAtm,
  QrCode,
  Restaurant,
  Timer,
  People,
  TableBar,
  Schedule,
  BarChart,
  PieChart,
  ShowChart,
  Refresh,
  FilterList
} from '@mui/icons-material';
import { PieChart as RechartsPieChart, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import './Financial.css';

const Financial = () => {
  const [period, setPeriod] = useState('today');
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - em produção viria de APIs
  const [financialData, setFinancialData] = useState({
    totalSales: 15600,
    totalOrders: 89,
    averageTicket: 175.28,
    paidOrders: 67,
    pendingOrders: 22,
    ordersInProduction: 4,
    ordersReady: 2,
    ordersDelivered: 12,
    averagePrepTime: 18,
    occupiedTables: 8,
    totalTables: 12,
    monthlyRevenue: 234500,
    topProducts: [
      { name: 'Hambúrguer Clássico', sales: 45, revenue: 2250 },
      { name: 'Pizza Margherita', sales: 38, revenue: 1900 },
      { name: 'Coca-Cola 350ml', sales: 67, revenue: 670 },
      { name: 'Batata Frita', sales: 42, revenue: 1260 },
      { name: 'Salada Caesar', sales: 28, revenue: 1400 }
    ],
    paymentMethods: [
      { name: 'PIX', value: 45, color: '#7b2cbf' },
      { name: 'Cartão', value: 30, color: '#2196F3' },
      { name: 'Dinheiro', value: 15, color: '#4CAF50' },
      { name: 'Vale Refeição', value: 10, color: '#FF9800' }
    ],
    hourlySales: [
      { hour: '08:00', sales: 1200 },
      { hour: '09:00', sales: 1800 },
      { hour: '10:00', sales: 2200 },
      { hour: '11:00', sales: 2800 },
      { hour: '12:00', sales: 4500 },
      { hour: '13:00', sales: 5200 },
      { hour: '14:00', sales: 3100 },
      { hour: '15:00', sales: 1900 },
      { hour: '16:00', sales: 1600 },
      { hour: '17:00', sales: 2100 },
      { hour: '18:00', sales: 3800 },
      { hour: '19:00', sales: 4200 },
      { hour: '20:00', sales: 4800 },
      { hour: '21:00', sales: 3600 },
      { hour: '22:00', sales: 2400 }
    ],
    weeklyComparison: [
      { day: 'Seg', current: 12000, previous: 11500 },
      { day: 'Ter', current: 13500, previous: 12800 },
      { day: 'Qua', current: 14200, previous: 13900 },
      { day: 'Qui', current: 15800, previous: 15200 },
      { day: 'Sex', current: 18900, previous: 17500 },
      { day: 'Sáb', current: 22100, previous: 20800 },
      { day: 'Dom', current: 19600, previous: 19200 }
    ],
    topWaiters: [
      { name: 'João Silva', orders: 23, sales: 3450, avatar: 'JS' },
      { name: 'Maria Santos', orders: 19, sales: 2890, avatar: 'MS' },
      { name: 'Pedro Costa', orders: 17, sales: 2560, avatar: 'PC' },
      { name: 'Ana Oliveira', orders: 15, sales: 2230, avatar: 'AO' }
    ]
  });

  const handleRefresh = () => {
    setRefreshing(true);
    // Simular carregamento
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const getPeriodLabel = () => {
    const labels = {
      today: 'Hoje',
      week: 'Esta Semana',
      month: 'Este Mês',
      custom: 'Personalizado'
    };
    return labels[period];
  };

  const getComparisonData = () => {
    const current = financialData.totalSales;
    const previous = period === 'today' ? 14200 : period === 'week' ? 125000 : 198000;
    const percentage = ((current - previous) / previous * 100).toFixed(1);
    return { current, previous, percentage, isPositive: percentage > 0 };
  };

  const comparison = getComparisonData();

  return (
    <Box className="financial-dashboard">
      {/* Header */}
      <Box className="financial-header">
        <Box className="header-content">
          <Typography variant="h4" className="header-title">
            Financeiro & Vendas
          </Typography>
          <Typography variant="body1" className="header-subtitle">
            Acompanhe o desempenho do seu restaurante
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
            <ToggleButton value="custom">Personalizado</ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Atualizar dados">
            <IconButton 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="refresh-btn"
            >
              <Refresh className={refreshing ? 'rotating' : ''} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Métricas Principais */}
      <Grid container spacing={3} className="metrics-grid">
        {/* Ticket Médio */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="metric-card">
            <CardContent>
              <Box className="metric-header">
                <AttachMoney className="metric-icon" />
                <Typography variant="h6" className="metric-title">
                  Ticket Médio
                </Typography>
              </Box>
              <Typography variant="h4" className="metric-value">
                R$ {financialData.averageTicket.toFixed(2)}
              </Typography>
              <Typography variant="body2" className="metric-subtitle">
                {financialData.totalSales.toLocaleString()} ÷ {financialData.totalOrders} pedidos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Vendas Totais */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="metric-card">
            <CardContent>
              <Box className="metric-header">
                <ShoppingCart className="metric-icon" />
                <Typography variant="h6" className="metric-title">
                  Vendas Totais
                </Typography>
              </Box>
              <Typography variant="h4" className="metric-value">
                R$ {financialData.totalSales.toLocaleString()}
              </Typography>
              <Box className="comparison">
                {comparison.isPositive ? (
                  <TrendingUp className="trend-icon positive" />
                ) : (
                  <TrendingDown className="trend-icon negative" />
                )}
                <Typography 
                  variant="body2" 
                  className={`comparison-text ${comparison.isPositive ? 'positive' : 'negative'}`}
                >
                  {comparison.percentage}% vs período anterior
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pedidos Pagos vs Pendentes */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="metric-card">
            <CardContent>
              <Box className="metric-header">
                <CreditCard className="metric-icon" />
                <Typography variant="h6" className="metric-title">
                  Status Pagamentos
                </Typography>
              </Box>
              <Box className="payment-status">
                <Box className="status-item">
                  <Chip 
                    label={`${financialData.paidOrders} Pagos`} 
                    color="success" 
                    size="small" 
                  />
                </Box>
                <Box className="status-item">
                  <Chip 
                    label={`${financialData.pendingOrders} Pendentes`} 
                    color="warning" 
                    size="small" 
                  />
                </Box>
              </Box>
              <Typography variant="body2" className="metric-subtitle">
                {((financialData.paidOrders / (financialData.paidOrders + financialData.pendingOrders)) * 100).toFixed(1)}% pagos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Faturamento do Mês */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="metric-card">
            <CardContent>
              <Box className="metric-header">
                <BarChart className="metric-icon" />
                <Typography variant="h6" className="metric-title">
                  Faturamento Mensal
                </Typography>
              </Box>
              <Typography variant="h4" className="metric-value">
                R$ {financialData.monthlyRevenue.toLocaleString()}
              </Typography>
              <Typography variant="body2" className="metric-subtitle">
                Outubro 2024
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Seção Operacional */}
      <Grid container spacing={3} className="operational-section">
        <Grid item xs={12} md={6}>
          <Card className="section-card">
            <CardContent>
              <Typography variant="h6" className="section-title">
                👨‍🍳 Status dos Pedidos
              </Typography>
              <Box className="kanban-mini">
                <Box className="kanban-column">
                  <Typography variant="body2" className="kanban-label">Em Produção</Typography>
                  <Box className="kanban-count production">{financialData.ordersInProduction}</Box>
                </Box>
                <Box className="kanban-column">
                  <Typography variant="body2" className="kanban-label">Prontos</Typography>
                  <Box className="kanban-count ready">{financialData.ordersReady}</Box>
                </Box>
                <Box className="kanban-column">
                  <Typography variant="body2" className="kanban-label">Entregues</Typography>
                  <Box className="kanban-count delivered">{financialData.ordersDelivered}</Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="section-card">
            <CardContent>
              <Typography variant="h6" className="section-title">
                ⏱️ Tempo Médio de Preparo
              </Typography>
              <Box className="prep-time">
                <Typography variant="h3" className="time-value">
                  {financialData.averagePrepTime} min
                </Typography>
                <Typography variant="body2" className="time-subtitle">
                  Entre pedido recebido e entregue
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Mesas e Garçons */}
      <Grid container spacing={3} className="tables-waiters-section">
        <Grid item xs={12} md={6}>
          <Card className="section-card">
            <CardContent>
              <Typography variant="h6" className="section-title">
                🪑 Ocupação das Mesas
              </Typography>
              <Box className="tables-status">
                <Typography variant="h4" className="tables-count">
                  {financialData.occupiedTables}/{financialData.totalTables}
                </Typography>
                <Typography variant="body2" className="tables-subtitle">
                  Mesas ocupadas
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(financialData.occupiedTables / financialData.totalTables) * 100}
                  className="tables-progress"
                />
                <Typography variant="body2" className="tables-percentage">
                  {((financialData.occupiedTables / financialData.totalTables) * 100).toFixed(1)}% ocupação
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="section-card">
            <CardContent>
              <Typography variant="h6" className="section-title">
                🏆 Top Garçons
              </Typography>
              <List className="waiters-list">
                {financialData.topWaiters.map((waiter, index) => (
                  <ListItem key={index} className="waiter-item">
                    <ListItemAvatar>
                      <Avatar className="waiter-avatar">
                        {waiter.avatar}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={waiter.name}
                      secondary={`${waiter.orders} pedidos • R$ ${waiter.sales.toLocaleString()}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        label={`#${index + 1}`} 
                        size="small" 
                        className="ranking-chip"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} className="charts-section">
        {/* Formas de Pagamento */}
        <Grid item xs={12} md={6}>
          <Card className="section-card">
            <CardContent>
              <Typography variant="h6" className="section-title">
                💳 Formas de Pagamento
              </Typography>
              <Box className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <RechartsTooltip formatter={(value) => `${value}%`} />
                    <RechartsPieChart
                      data={financialData.paymentMethods}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="value"
                    >
                      {financialData.paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Produtos */}
        <Grid item xs={12} md={6}>
          <Card className="section-card">
            <CardContent>
              <Typography variant="h6" className="section-title">
                🍔 Top Produtos Vendidos
              </Typography>
              <List className="products-list">
                {financialData.topProducts.map((product, index) => (
                  <ListItem key={index} className="product-item">
                    <ListItemText
                      primary={
                        <Box className="product-info">
                          <Typography variant="body1" className="product-name">
                            {product.name}
                          </Typography>
                          <Typography variant="body2" className="product-sales">
                            {product.sales} vendas
                          </Typography>
                        </Box>
                      }
                      secondary={`R$ ${product.revenue.toLocaleString()}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        label={`#${index + 1}`} 
                        size="small" 
                        className="ranking-chip"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Vendas por Hora */}
      <Grid container spacing={3} className="hourly-section">
        <Grid item xs={12}>
          <Card className="section-card">
            <CardContent>
              <Typography variant="h6" className="section-title">
                📈 Vendas por Hora (Heatmap)
              </Typography>
              <Box className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={financialData.hourlySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Vendas']} />
                    <Bar dataKey="sales" fill="#7b2cbf" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Comparativo Semanal */}
      <Grid container spacing={3} className="weekly-section">
        <Grid item xs={12}>
          <Card className="section-card">
            <CardContent>
              <Typography variant="h6" className="section-title">
                📊 Comparativo Semanal
              </Typography>
              <Box className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={financialData.weeklyComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Vendas']} />
                    <Bar dataKey="current" fill="#7b2cbf" name="Esta Semana" />
                    <Bar dataKey="previous" fill="#e0e0e0" name="Semana Anterior" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Financial;
