import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    IconButton,
    Chip,
    Avatar,
    Button,
    Grid,
    Paper,
    Divider,
    Tooltip,
    Badge,
    Modal,
    Fade,
    Backdrop,
    Snackbar,
    Alert,
    LinearProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    AccessTime as TimeIcon,
    Person as PersonIcon,
    ArrowForward as ArrowIcon,
    ExpandMore as ExpandIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './Kitchen.css';

// Dados mockados para demonstração
const mockOrders = [
    {
        id: 1,
        orderNumber: '#123',
        customerName: 'João Silva',
        items: ['Pizza Margherita', 'Coca-Cola 350ml', 'Batata Frita'],
        status: 'novo',
        createdAt: new Date(Date.now() - 15 * 60000), // 15 min atrás
        tableNumber: 5,
        waiter: 'Carlos',
        notes: 'Sem cebola na pizza',
        orderType: 'mesa'
    },
    {
        id: 2,
        orderNumber: '#124',
        customerName: 'Maria Santos',
        items: ['Hambúrguer Artesanal', 'Suco de Laranja'],
        status: 'em_producao',
        createdAt: new Date(Date.now() - 8 * 60000), // 8 min atrás
        tableNumber: 3,
        waiter: 'Ana',
        notes: 'Hambúrguer bem passado',
        orderType: 'mesa'
    },
    {
        id: 3,
        orderNumber: '#125',
        customerName: 'Pedro Costa',
        items: ['Salada Caesar', 'Água Mineral'],
        status: 'feito',
        createdAt: new Date(Date.now() - 25 * 60000), // 25 min atrás
        tableNumber: 7,
        waiter: 'João',
        notes: 'Sem croutons',
        orderType: 'mesa'
    },
    {
        id: 4,
        orderNumber: '#126',
        customerName: 'Ana Oliveira',
        items: ['Pasta Carbonara', 'Vinho Tinto'],
        status: 'entregue',
        createdAt: new Date(Date.now() - 35 * 60000), // 35 min atrás
        tableNumber: 2,
        waiter: 'Maria',
        notes: 'Pasta al dente',
        orderType: 'mesa'
    },
    {
        id: 5,
        orderNumber: '#127',
        customerName: 'Carlos Lima',
        items: ['Risotto de Camarão', 'Cerveja Artesanal'],
        status: 'novo',
        createdAt: new Date(Date.now() - 5 * 60000), // 5 min atrás
        tableNumber: 1,
        waiter: 'Pedro',
        notes: 'Risotto cremoso',
        orderType: 'mesa'
    },
    {
        id: 6,
        orderNumber: '#128',
        customerName: 'Balcão - Delivery',
        items: ['Pizza Quatro Queijos', 'Refrigerante'],
        status: 'novo',
        createdAt: new Date(Date.now() - 3 * 60000), // 3 min atrás
        tableNumber: null,
        waiter: 'Sistema',
        notes: 'Entrega em 30 min',
        orderType: 'balcao'
    },
    {
        id: 7,
        orderNumber: '#129',
        customerName: 'Comanda #45',
        items: ['Café Expresso', 'Pão de Açúcar'],
        status: 'em_producao',
        createdAt: new Date(Date.now() - 12 * 60000), // 12 min atrás
        tableNumber: null,
        waiter: 'Sistema',
        notes: 'Para viagem',
        orderType: 'comanda'
    },
    {
        id: 8,
        orderNumber: '#130',
        customerName: 'Balcão - Retirada',
        items: ['Sanduíche Natural', 'Suco Verde'],
        status: 'feito',
        createdAt: new Date(Date.now() - 20 * 60000), // 20 min atrás
        tableNumber: null,
        waiter: 'Sistema',
        notes: 'Cliente aguardando',
        orderType: 'balcao'
    }
];

const StyledCard = styled(Card)(({ theme, status }) => ({
    marginBottom: theme.spacing(1.5),
    borderRadius: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'grab',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'white',
    border: '1px solid #e9ecef',
    '&:hover': {
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        transform: 'translateY(-2px)'
    },
    '&:active': {
        cursor: 'grabbing',
        transform: 'scale(0.98)'
    }
}));

const KanbanColumn = styled(Paper)(({ theme, status }) => ({
    padding: theme.spacing(2),
    borderRadius: 16,
    backgroundColor: '#ffffff',
    minHeight: '600px',
    border: '1px solid #e9ecef',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
}));

const ColumnHeader = styled(Box)(({ theme, status }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2, 0),
    position: 'relative',
    borderBottom: '1px solid #e9ecef'
}));

const OrderCard = ({ order, onStatusChange, index, onCardClick, getTimeAgo }) => {



    return (
        <Draggable draggableId={order.id.toString()} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                        ...provided.draggableProps.style,
                        opacity: snapshot.isDragging ? 0.8 : 1,
                        transform: snapshot.isDragging ? 'rotate(5deg)' : 'none'
                    }}
                >
                    <StyledCard 
                        status={order.status}
                        className={snapshot.isDragging ? 'dragging' : ''}
                        onClick={() => onCardClick(order)}
                        sx={{ cursor: 'pointer' }}
                    >
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                <Typography variant="h6" fontWeight="bold" sx={{ color: '#7b2cbf' }}>
                                    {order.orderNumber}
                                </Typography>
                            </Box>

                            <Box display="flex" alignItems="center" mb={1}>
                                <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {order.customerName}
                                </Typography>
                                <Chip
                                    label={order.orderType === 'mesa' ? 'Mesa' : order.orderType === 'balcao' ? 'Balcão' : 'Comanda'}
                                    size="small"
                                    sx={{
                                        ml: 1,
                                        backgroundColor: '#7b2cbf',
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        height: '20px'
                                    }}
                                />
                            </Box>

                            <Box display="flex" alignItems="center" mb={2}>
                                <TimeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {getTimeAgo(order.createdAt)}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                                Itens do Pedido:
                            </Typography>
                            {order.items.map((item, index) => (
                                <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    • {item}
                                </Typography>
                            ))}

                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                <Typography variant="body2" sx={{ color: '#7b2cbf' }} fontWeight="bold">
                                    Mesa {order.tableNumber}
                                </Typography>
                                <Box display="flex" gap={1}>
                                    <Tooltip title="Ver detalhes">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCardClick(order);
                                            }}
                                            sx={{ 
                                                color: '#666666',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(102, 102, 102, 0.1)',
                                                    color: '#333333'
                                                }
                                            }}
                                        >
                                            <ExpandIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Mover para próxima etapa">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onStatusChange(order.id);
                                            }}
                                            sx={{ 
                                                color: '#666666',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(102, 102, 102, 0.1)',
                                                    color: '#333333'
                                                }
                                            }}
                                        >
                                            <ArrowIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                        </CardContent>
                    </StyledCard>
                </div>
            )}
        </Draggable>
    );
};

export function Kitchen() {
    const [orders, setOrders] = useState(mockOrders);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [filterType, setFilterType] = useState('todos');

    const columns = [
        { key: 'novo', title: 'Novo' },
        { key: 'em_producao', title: 'Em Produção' },
        { key: 'feito', title: 'Feito' },
        { key: 'entregue', title: 'Entregue' }
    ];

    const getTimeAgo = (date) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / 60000);
        
        if (diffInMinutes < 1) return 'Agora mesmo';
        if (diffInMinutes < 60) return `há ${diffInMinutes} min`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        return `há ${diffInHours}h ${diffInMinutes % 60}min`;
    };

    const getOrdersByStatus = (status) => {
        let filteredOrders = orders;
        
        if (filterType !== 'todos') {
            filteredOrders = orders.filter(order => order.orderType === filterType);
        }
        
        return filteredOrders.filter(order => order.status === status);
    };

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleStatusChange = (orderId) => {
        setOrders(prevOrders => 
            prevOrders.map(order => {
                if (order.id === orderId) {
                    const statusFlow = ['novo', 'em_producao', 'feito', 'entregue'];
                    const currentIndex = statusFlow.indexOf(order.status);
                    const nextStatus = currentIndex < statusFlow.length - 1 
                        ? statusFlow[currentIndex + 1] 
                        : order.status;
                    
                    const statusNames = {
                        'novo': 'Novo',
                        'em_producao': 'Em Produção',
                        'feito': 'Feito',
                        'entregue': 'Entregue'
                    };
                    
                    showToastMessage(`Pedido ${order.orderNumber} movido para ${statusNames[nextStatus]}`);
                    return { ...order, status: nextStatus };
                }
                return order;
            })
        );
    };

    const handleDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        // Se não há destino, não faz nada
        if (!destination) {
            return;
        }

        // Se o item foi solto na mesma posição, não faz nada
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Atualiza o status do pedido baseado na coluna de destino
        const newStatus = destination.droppableId;
        const order = orders.find(o => o.id.toString() === draggableId);
        
        if (order) {
            const statusNames = {
                'novo': 'Novo',
                'em_producao': 'Em Produção',
                'feito': 'Feito',
                'entregue': 'Entregue'
            };
            
            showToastMessage(`Pedido ${order.orderNumber} movido para ${statusNames[newStatus]}`);
        }

        setOrders(prevOrders => 
            prevOrders.map(order => 
                order.id.toString() === draggableId 
                    ? { ...order, status: newStatus }
                    : order
            )
        );
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        // Simular refresh
        setTimeout(() => {
            setIsRefreshing(false);
            showToastMessage('Pedidos atualizados com sucesso!');
        }, 1000);
    };

    const handleCardClick = (order) => {
        setSelectedOrder(order);
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
    };

    return (
        <Box className="kitchen-container">
            {/* Filter Section */}
            <Box className="filter-section">
                <Typography variant="h6" fontWeight="600" color="text.primary" mb={2}>
                    Filtros
                </Typography>
                <ToggleButtonGroup
                    value={filterType}
                    exclusive
                    onChange={(event, newFilter) => {
                        if (newFilter !== null) {
                            setFilterType(newFilter);
                        }
                    }}
                    aria-label="tipo de pedido"
                    sx={{
                        gap: 2,
                        '& .MuiToggleButton-root': {
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 500,
                            marginRight: '8px',
                            '&:last-child': {
                                marginRight: 0
                            },
                            '&.Mui-selected': {
                                backgroundColor: '#7b2cbf',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#6a2599'
                                }
                            },
                            '&:hover': {
                                backgroundColor: 'rgba(123, 44, 191, 0.1)'
                            }
                        }
                    }}
                >
                    <ToggleButton value="todos" aria-label="todos">
                        Todos
                    </ToggleButton>
                    <ToggleButton value="mesa" aria-label="mesas">
                        Mesas
                    </ToggleButton>
                    <ToggleButton value="TESTE" aria-label="TESTE">
                        TESTE
                    </ToggleButton>
                    <ToggleButton value="balcao" aria-label="balcão">
                        Balcão
                    </ToggleButton>
                    <ToggleButton value="comanda" aria-label="comandas">
                        Comandas
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Floating Refresh Button */}
            <Button
                variant="contained"
                startIcon={<RefreshIcon className={isRefreshing ? 'refreshing' : ''} />}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="floating-refresh-btn"
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 1000,
                    borderRadius: '50px',
                    minWidth: 'auto',
                    px: 3,
                    py: 1.5,
                    backgroundColor: '#7b2cbf',
                    boxShadow: '0 4px 20px rgba(123, 44, 191, 0.3)',
                    '&:hover': {
                        backgroundColor: '#6a2599',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 25px rgba(123, 44, 191, 0.4)'
                    },
                    '&:disabled': {
                        backgroundColor: '#a0a0a0',
                        color: '#ffffff'
                    },
                    transition: 'all 0.3s ease'
                }}
            >
                {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </Button>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <Grid container spacing={3} className="kanban-board">
                    {columns.map((column) => (
                        <Grid item xs={12} sm={6} md={3} key={column.key}>
                            <KanbanColumn status={column.key}>
                                <ColumnHeader status={column.key}>
                                    <Typography variant="h6" fontWeight="bold">
                                        {column.title}
                                    </Typography>
                                    <Badge 
                                        badgeContent={getOrdersByStatus(column.key).length} 
                                        sx={{ 
                                            '& .MuiBadge-badge': { 
                                                fontSize: '0.75rem',
                                                backgroundColor: '#7b2cbf',
                                                color: 'white'
                                            } 
                                        }}
                                    />
                                </ColumnHeader>
                                
                                <Droppable droppableId={column.key}>
                                    {(provided, snapshot) => (
                                        <Box 
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`orders-container ${snapshot.isDraggingOver ? 'drop-zone' : ''}`}
                                        >
                                            {getOrdersByStatus(column.key).map((order, index) => (
                                                <OrderCard
                                                    key={order.id}
                                                    order={order}
                                                    index={index}
                                                    onStatusChange={handleStatusChange}
                                                    onCardClick={handleCardClick}
                                                    getTimeAgo={getTimeAgo}
                                                />
                                            ))}
                                            {provided.placeholder}
                                        </Box>
                                    )}
                                </Droppable>
                            </KanbanColumn>
                        </Grid>
                    ))}
                </Grid>
            </DragDropContext>

            {/* Modal de Detalhes do Pedido */}
            <Modal
                open={!!selectedOrder}
                onClose={handleCloseModal}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={!!selectedOrder}>
                    <Box className="order-detail-modal">
                        {selectedOrder && (
                            <Card sx={{ maxWidth: 600, width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h5" fontWeight="bold" sx={{ color: '#7b2cbf' }}>
                                            {selectedOrder.orderNumber}
                                        </Typography>
                                        <IconButton onClick={handleCloseModal}>
                                            <CloseIcon />
                                        </IconButton>
                                    </Box>

                                    <Divider sx={{ mb: 2 }} />

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                Cliente
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary">
                                                {selectedOrder.customerName}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                Mesa
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: '#7b2cbf', fontWeight: 'bold' }}>
                                                Mesa {selectedOrder.tableNumber}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                Garçom
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary">
                                                {selectedOrder.waiter}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                Tipo
                                            </Typography>
                                            <Chip
                                                label={selectedOrder.orderType === 'mesa' ? 'Mesa' : 
                                                       selectedOrder.orderType === 'balcao' ? 'Balcão' : 'Comanda'}
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#7b2cbf',
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                Tempo
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary">
                                                {getTimeAgo(selectedOrder.createdAt)}
                                            </Typography>
                                        </Grid>
                                    </Grid>

                                    <Box mt={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                            Itens do Pedido
                                        </Typography>
                                        {selectedOrder.items.map((item, index) => (
                                            <Typography key={index} variant="body1" sx={{ mb: 1 }}>
                                                • {item}
                                            </Typography>
                                        ))}
                                    </Box>

                                    {selectedOrder.notes && (
                                        <Box mt={3}>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                Observações
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary">
                                                {selectedOrder.notes}
                                            </Typography>
                                        </Box>
                                    )}

                                    <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                                        <Button
                                            variant="outlined"
                                            onClick={handleCloseModal}
                                            sx={{
                                                borderColor: '#7b2cbf',
                                                color: '#7b2cbf',
                                                '&:hover': {
                                                    borderColor: '#6a2599',
                                                    backgroundColor: 'rgba(123, 44, 191, 0.04)'
                                                }
                                            }}
                                        >
                                            Fechar
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={() => {
                                                handleStatusChange(selectedOrder.id);
                                                handleCloseModal();
                                            }}
                                            sx={{
                                                backgroundColor: '#7b2cbf',
                                                '&:hover': {
                                                    backgroundColor: '#6a2599'
                                                }
                                            }}
                                        >
                                            Mover para Próxima Etapa
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                </Fade>
            </Modal>

            {/* Toast de Confirmação */}
            <Snackbar
                open={showToast}
                autoHideDuration={3000}
                onClose={() => setShowToast(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setShowToast(false)} 
                    severity="success" 
                    sx={{ width: '100%' }}
                >
                    {toastMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}