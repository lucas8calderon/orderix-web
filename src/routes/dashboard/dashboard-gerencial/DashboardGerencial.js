import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Paper,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Restaurant as RestaurantIcon,
  People as PeopleIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import './DashboardGerencial.css';

// Componente de gráfico simples
const SimpleChart = ({ title, type = 'bar' }) => (
  <Box className="chart-container">
    <Box className="chart-placeholder">
      <Typography variant="h6" color="text.secondary">
        📊 {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Visualização dos dados de {title.toLowerCase()}
      </Typography>
      <Box className="chart-mock">
        {type === 'bar' ? (
          <Box className="chart-bars">
            {[65, 80, 45, 90, 75, 85, 95].map((height, index) => (
              <Box
                key={index}
                className="chart-bar"
                sx={{
                  height: `${height}%`,
                  backgroundColor: 'var(--dashboard-primary)',
                  borderRadius: '4px 4px 0 0',
                  minHeight: '20px'
                }}
              />
            ))}
          </Box>
        ) : (
          <Box className="chart-line">
            <svg width="100%" height="120" viewBox="0 0 300 120">
              <polyline
                points="0,100 50,80 100,60 150,40 200,50 250,30 300,20"
                fill="none"
                stroke="var(--dashboard-success)"
                strokeWidth="3"
              />
              <circle cx="300" cy="20" r="4" fill="var(--dashboard-success)" />
            </svg>
          </Box>
        )}
        <Box className="chart-labels">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((label, index) => (
            <Typography key={index} variant="caption" className="chart-label">
              {label}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  </Box>
);

// Componente de card de métrica
const MetricCard = React.memo(({ title, value, change, changeType, icon, color = 'primary' }) => (
  <Card className="metric-card">
    <CardContent className="metric-card-content">
      <Box className="metric-header">
        <Box className="metric-title-section">
          <Avatar className={`metric-icon metric-icon--${color}`}>
            {icon}
          </Avatar>
          <Typography className="metric-title">{title}</Typography>
        </Box>
        <IconButton size="small" className="metric-menu">
          <MoreVertIcon />
        </IconButton>
      </Box>
      
      <Box className="metric-value-section">
        <Typography className="metric-value">{value}</Typography>
        <Box className="metric-change">
          {changeType === 'positive' ? (
            <TrendingUpIcon className="metric-trend metric-trend--positive" />
          ) : (
            <TrendingDownIcon className="metric-trend metric-trend--negative" />
          )}
          <Typography className={`metric-change-text metric-change-text--${changeType}`}>
            {change}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
));

// Componente de produto mais vendido
const TopProductCard = React.memo(({ product, rank, sales, revenue }) => (
  <Card className="top-product-card">
    <CardContent className="top-product-content">
      <Box className="product-rank">
        <Typography className="product-rank-number">#{rank}</Typography>
      </Box>
      
      <Box className="product-info">
        <Avatar className="product-avatar">
          <RestaurantIcon />
        </Avatar>
        <Box className="product-details">
          <Typography className="product-name">{product}</Typography>
          <Typography className="product-sales">{sales} vendas</Typography>
        </Box>
      </Box>
      
      <Box className="product-revenue">
        <Typography className="product-revenue-value">R$ {revenue}</Typography>
      </Box>
    </CardContent>
  </Card>
));

// Componente de funcionário
const EmployeeCard = React.memo(({ name, role, avatar, orders, rating, performance }) => (
  <Card className="employee-card">
    <CardContent className="employee-content">
      <Box className="employee-header">
        <Avatar className="employee-avatar" src={avatar}>
          {name.charAt(0)}
        </Avatar>
        <Box className="employee-info">
          <Typography className="employee-name">{name}</Typography>
          <Typography className="employee-role">{role}</Typography>
        </Box>
        <Box className="employee-rating">
          <StarIcon className="rating-icon" />
          <Typography className="rating-value">{rating}</Typography>
        </Box>
      </Box>
      
      <Box className="employee-stats">
        <Box className="employee-stat">
          <Typography className="stat-label">Pedidos</Typography>
          <Typography className="stat-value">{orders}</Typography>
        </Box>
        <Box className="employee-stat">
          <Typography className="stat-label">Performance</Typography>
          <Box className="performance-bar">
            <LinearProgress 
              variant="determinate" 
              value={performance} 
              className="performance-progress"
            />
            <Typography className="performance-value">{performance}%</Typography>
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
));

export function DashboardGerencial() {
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      revenue: {
        current: 'R$ 12.450,00',
        change: '+12.5%',
        changeType: 'positive'
      },
      orders: {
        current: '156',
        change: '+8.2%',
        changeType: 'positive'
      },
      customers: {
        current: '89',
        change: '+15.3%',
        changeType: 'positive'
      },
      avgOrder: {
        current: 'R$ 79,80',
        change: '-2.1%',
        changeType: 'negative'
      }
    },
    topProducts: [
      { product: 'Pizza Margherita', rank: 1, sales: 45, revenue: '1.350,00' },
      { product: 'Hambúrguer Artesanal', rank: 2, sales: 38, revenue: '1.140,00' },
      { product: 'Salada Caesar', rank: 3, sales: 32, revenue: '640,00' },
      { product: 'Pasta Carbonara', rank: 4, sales: 28, revenue: '840,00' },
      { product: 'Sushi Combo', rank: 5, sales: 25, revenue: '1.250,00' }
    ],
    employees: [
      { name: 'Ana Silva', role: 'Garçom', orders: 45, rating: 4.8, performance: 92 },
      { name: 'Carlos Santos', role: 'Cozinheiro', orders: 38, rating: 4.6, performance: 88 },
      { name: 'Maria Costa', role: 'Caixa', orders: 52, rating: 4.9, performance: 95 },
      { name: 'João Oliveira', role: 'Garçom', orders: 41, rating: 4.7, performance: 89 }
    ],
    recentOrders: [
      { id: '#001', customer: 'João Silva', amount: 'R$ 45,00', status: 'Concluído', time: '2 min' },
      { id: '#002', customer: 'Maria Santos', amount: 'R$ 78,50', status: 'Preparando', time: '5 min' },
      { id: '#003', customer: 'Pedro Costa', amount: 'R$ 32,00', status: 'Aguardando', time: '1 min' },
      { id: '#004', customer: 'Ana Oliveira', amount: 'R$ 65,00', status: 'Concluído', time: '3 min' }
    ]
  });

  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const handleRefresh = useCallback(() => {
    console.log('Atualizando dados do dashboard...');
    // Simular atualização de dados
  }, []);

  const handleExport = useCallback(() => {
    console.log('Exportando relatório...');
    // Implementar exportação
  }, []);

  const metricsConfig = useMemo(() => [
    {
      title: 'Faturamento',
      value: dashboardData.metrics.revenue.current,
      change: dashboardData.metrics.revenue.change,
      changeType: dashboardData.metrics.revenue.changeType,
      icon: <MoneyIcon />,
      color: 'success'
    },
    {
      title: 'Pedidos',
      value: dashboardData.metrics.orders.current,
      change: dashboardData.metrics.orders.change,
      changeType: dashboardData.metrics.orders.changeType,
      icon: <CartIcon />,
      color: 'primary'
    },
    {
      title: 'Clientes',
      value: dashboardData.metrics.customers.current,
      change: dashboardData.metrics.customers.change,
      changeType: dashboardData.metrics.customers.changeType,
      icon: <PeopleIcon />,
      color: 'info'
    },
    {
      title: 'Ticket Médio',
      value: dashboardData.metrics.avgOrder.current,
      change: dashboardData.metrics.avgOrder.change,
      changeType: dashboardData.metrics.avgOrder.changeType,
      icon: <TrendingUpIcon />,
      color: 'warning'
    }
  ], [dashboardData.metrics]);

  return (
    <div className="dashboard-gerencial">
      {/* Header */}
      <Box className="dashboard-header">
        <Box className="dashboard-title-section">
          <Typography className="dashboard-title">Dashboard Gerencial</Typography>
          <Typography className="dashboard-subtitle">
            Visão geral do desempenho do seu negócio
          </Typography>
        </Box>
        
        <Box className="dashboard-actions">
          <Tooltip title="Atualizar dados">
            <IconButton onClick={handleRefresh} className="action-button">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Exportar relatório">
            <IconButton onClick={handleExport} className="action-button">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Métricas Principais */}
      <Grid container spacing={3} className="metrics-grid">
        {metricsConfig.map((metric, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      {/* Gráficos e Análises */}
      <Grid container spacing={3} className="charts-grid">
        {/* Gráfico de Faturamento */}
        <Grid item xs={12} lg={8}>
          <Card className="chart-card">
            <CardContent className="chart-card-content">
              <Box className="chart-header">
                <Typography className="chart-title">Faturamento por Período</Typography>
                <Box className="chart-periods">
                  <Chip label="Hoje" className="period-chip period-chip--active" />
                  <Chip label="Semana" className="period-chip" />
                  <Chip label="Mês" className="period-chip" />
                </Box>
              </Box>
              <SimpleChart title="Faturamento por Período" type="bar" />
            </CardContent>
          </Card>
        </Grid>

        {/* Pedidos Recentes */}
        <Grid item xs={12} lg={4}>
          <Card className="chart-card">
            <CardContent className="chart-card-content">
              <Typography className="chart-title">Pedidos Recentes</Typography>
              <Box className="recent-orders">
                {dashboardData.recentOrders.map((order, index) => (
                  <Box key={index} className="order-item">
                    <Box className="order-info">
                      <Typography className="order-id">{order.id}</Typography>
                      <Typography className="order-customer">{order.customer}</Typography>
                    </Box>
                    <Box className="order-details">
                      <Typography className="order-amount">{order.amount}</Typography>
                      <Chip 
                        label={order.status} 
                        className={`status-chip status-chip--${order.status.toLowerCase()}`}
                        size="small"
                      />
                    </Box>
                    <Typography className="order-time">{order.time}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Produtos Mais Vendidos e Equipe */}
      <Grid container spacing={3} className="bottom-grid">
        {/* Produtos Mais Vendidos */}
        <Grid item xs={12} lg={6}>
          <Card className="chart-card">
            <CardContent className="chart-card-content">
              <Typography className="chart-title">Produtos Mais Vendidos</Typography>
              <Box className="top-products">
                {dashboardData.topProducts.map((product, index) => (
                  <TopProductCard key={index} {...product} />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Desempenho da Equipe */}
        <Grid item xs={12} lg={6}>
          <Card className="chart-card">
            <CardContent className="chart-card-content">
              <Typography className="chart-title">Desempenho da Equipe</Typography>
              <Box className="team-performance">
                {dashboardData.employees.map((employee, index) => (
                  <EmployeeCard key={index} {...employee} />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
