import { PageHeader } from '../../../commons/components/PageHeader';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    LinearProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
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
import { getKitchenOrders, updateKitchenOrderStatus } from './kitchenService';
import { mapKitchenOrder, orderTypeLabel } from './kitchenOrderMap';
import { useDialogResponsiveProps } from '../../../commons/hooks/useResponsive';
import {
    SALES_CHANNEL_FILTERS,
} from '../../../services/salesChannel';

const KITCHEN_FILTERS = [
    ...SALES_CHANNEL_FILTERS,
    { id: 'atrasados', label: 'Atrasados' },
];

const UI_TO_KITCHEN = {
    novo: 'NEW',
    em_producao: 'IN_PREPARATION',
    feito: 'READY',
    entregue: 'DELIVERED',
};

const STATUS_LABELS = {
    novo: 'Novo',
    em_producao: 'Em Produção',
    feito: 'Feito',
    entregue: 'Entregue',
    finalizado: 'Finalizado',
};

const KITCHEN_COLUMNS = [
    { key: 'novo', title: STATUS_LABELS.novo },
    { key: 'em_producao', title: STATUS_LABELS.em_producao },
    { key: 'feito', title: STATUS_LABELS.feito },
    { key: 'entregue', title: STATUS_LABELS.entregue },
    { key: 'finalizado', title: STATUS_LABELS.finalizado },
];

const SHOW_FINALIZED_KEY = 'kitchen.showFinalizedColumn';

function readShowFinalizedPref() {
    try {
        return window.localStorage.getItem(SHOW_FINALIZED_KEY) === 'true';
    } catch (error) {
        return false;
    }
}

const STATUS_FLOW = ['novo', 'em_producao', 'feito', 'entregue'];

function KitchenItemLines({ items, notes, compact = false }) {
    const textVariant = compact ? 'body2' : 'body1';
    return (
        <>
            {items.map((item, index) => (
                <Box key={`${item.label}-${index}`} sx={{ mb: compact ? 0.75 : 1.25 }}>
                    <Typography variant={textVariant} color="text.secondary">
                        • {item.label}
                    </Typography>
                    {item.selections.map((selection) => (
                        <Typography
                            key={selection}
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ pl: 2 }}
                        >
                            {selection}
                        </Typography>
                    ))}
                    {item.extras.map((extra) => (
                        <Typography
                            key={extra}
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ pl: 2 }}
                        >
                            Extra: {extra}
                        </Typography>
                    ))}
                    {item.observation ? (
                        <Typography
                            className="kitchen-item-obs"
                            variant="caption"
                            display="block"
                            sx={{ pl: 2, fontWeight: 700 }}
                        >
                            Obs.: {item.observation}
                        </Typography>
                    ) : null}
                </Box>
            ))}
            {notes ? (
                <Typography
                    className="kitchen-item-obs"
                    variant={compact ? 'caption' : 'body2'}
                    display="block"
                    sx={{ mt: 0.5, fontWeight: 700 }}
                >
                    Pedido: {notes}
                </Typography>
            ) : null}
        </>
    );
}
const StyledCard = styled(Card)(({ theme, status }) => ({
    marginBottom: theme.spacing(1.5),
    borderRadius: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'grab',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
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
    backgroundColor: 'var(--color-surface)',
    minHeight: 280,
    border: '1px solid var(--color-border)',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    [theme.breakpoints.up('md')]: {
        minHeight: 600,
    },
}));

const ColumnHeader = styled(Box)(({ theme, status }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2, 0),
    position: 'relative',
    borderBottom: '1px solid var(--color-border)'
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
                                <Typography variant="h6" fontWeight="bold" sx={{ color: 'var(--color-primary)' }}>
                                    {order.orderNumber}
                                </Typography>
                            </Box>

                            <Box display="flex" alignItems="center" mb={1}>
                                <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {order.customerName}
                                </Typography>
                                <Chip
                                    label={orderTypeLabel(order.orderType)}
                                    size="small"
                                    sx={{
                                        ml: 1,
                                        backgroundColor: 'var(--color-primary)',
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
                            <KitchenItemLines items={order.items} notes={order.notes} compact />

                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                <Typography variant="body2" sx={{ color: 'var(--color-primary)' }} fontWeight="bold">
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
                                        <span>
                                        <IconButton
                                            size="small"
                                            disabled={order.status === 'finalizado' || order.status === 'entregue'}
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
                                        </span>
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

export function Kitchen({ initialFilter }) {
    const [orders, setOrders] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [filterType, setFilterType] = useState(initialFilter || 'todos');
    const [showFinalized, setShowFinalized] = useState(readShowFinalizedPref);
    const orderDialogProps = useDialogResponsiveProps({
        paperSx: {
            backgroundColor: 'var(--color-surface-elevated)',
            color: 'var(--color-text-primary)',
            backgroundImage: 'none',
            border: '1px solid var(--color-border)',
            opacity: 1,
            maxWidth: 600,
        },
    });

    useEffect(() => {
        if (initialFilter) {
            setFilterType(initialFilter);
        }
    }, [initialFilter]);

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

        if (filterType === 'atrasados') {
            const limit = Date.now() - 20 * 60 * 1000;
            filteredOrders = orders.filter((order) => (
                (order.status === 'novo' || order.status === 'em_producao')
                && order.createdAt
                && order.createdAt.getTime() <= limit
            ));
        } else if (filterType !== 'todos') {
            filteredOrders = orders.filter(order => order.orderType === filterType);
        }

        return filteredOrders.filter(order => order.status === status);
    };

    const finalizedCount = getOrdersByStatus('finalizado').length;
    const showFinalizedColumn = showFinalized && finalizedCount > 0;
    const columns = KITCHEN_COLUMNS.filter((column) => (
        column.key !== 'finalizado' || showFinalizedColumn
    ));
    const columnGridProps = columns.length <= 4
        ? { xs: 12, sm: 6, md: 6, lg: 3 }
        : { xs: 12, sm: 6, md: 4, lg: 2 };

    const handleShowFinalizedChange = (event) => {
        const checked = event.target.checked;
        setShowFinalized(checked);
        try {
            window.localStorage.setItem(SHOW_FINALIZED_KEY, String(checked));
        } catch (error) {
            // ignore storage errors
        }
    };

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const loadOrders = () => {
        return getKitchenOrders()
            .then((response) => {
                const data = Array.isArray(response.data) ? response.data : [];
                setOrders(data.map(mapKitchenOrder));
                return true;
            })
            .catch(() => {
                showToastMessage('Não foi possível carregar os pedidos da cozinha.');
                return false;
            });
    };

    // Poll 12s: ~5 GET /kitchen/orders por loja/min por aba aberta.
    // Baseline (sem WS): p95 = intervalo + RTT. Manter poll; WS só se a carga crescer.
    useEffect(() => {
        loadOrders();
        const timer = setInterval(loadOrders, 12000);
        return () => clearInterval(timer);
    }, []);

    const persistStatus = (orderId, uiStatus) => {
        if (uiStatus === 'finalizado') {
            const current = orders.find((order) => order.id === orderId);
            if (current?.orderStatus !== 'CLOSED') {
                showToastMessage('Finalizado são pedidos já pagos. Feche a conta no atendimento.');
            }
            loadOrders();
            return;
        }
        const kitchenStatus = UI_TO_KITCHEN[uiStatus];
        if (!kitchenStatus) return;
        const current = orders.find((order) => order.id === orderId);
        if (current?.orderStatus === 'CLOSED') {
            loadOrders();
            return;
        }
        updateKitchenOrderStatus(orderId, kitchenStatus)
            .then(() => loadOrders())
            .catch(() => {
                showToastMessage('Não foi possível atualizar o status do pedido.');
                loadOrders();
            });
    };

    const handleStatusChange = (orderId) => {
        const current = orders.find((order) => order.id === orderId);
        if (!current) return;
        const statusFlow = STATUS_FLOW;
        const currentIndex = statusFlow.indexOf(current.status);
        const nextStatus = currentIndex < statusFlow.length - 1
            ? statusFlow[currentIndex + 1]
            : current.status;
        if (nextStatus === current.status) return;
        setOrders((prev) => prev.map((order) => (
            order.id === orderId ? { ...order, status: nextStatus } : order
        )));
        persistStatus(orderId, nextStatus);
        showToastMessage(`Pedido ${current.orderNumber} movido para ${STATUS_LABELS[nextStatus]}`);
    };

    const handleDragEnd = (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }
        const newStatus = destination.droppableId;
        const order = orders.find((item) => item.id.toString() === draggableId);
        if (!order) return;
        if (newStatus === 'finalizado' && order.orderStatus !== 'CLOSED') {
            showToastMessage('Finalizado são pedidos já pagos. Feche a conta no atendimento.');
            return;
        }
        if (order.orderStatus === 'CLOSED' && newStatus !== 'finalizado') {
            showToastMessage('Pedido já pago não pode voltar para a cozinha.');
            return;
        }
        showToastMessage(`Pedido ${order.orderNumber} movido para ${STATUS_LABELS[newStatus] || newStatus}`);
        persistStatus(order.id, newStatus);
        setOrders((prev) => prev.map((item) => (
            item.id.toString() === draggableId ? { ...item, status: newStatus } : item
        )));
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadOrders()
            .then((updated) => {
                if (updated) {
                    showToastMessage('Pedidos atualizados com sucesso!');
                }
            })
            .finally(() => {
                setIsRefreshing(false);
            });
    };

    const handleCardClick = (order) => {
        setSelectedOrder(order);
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
    };

    return (
        <Box className="kitchen-container">
            <PageHeader title="Cozinha" description="Acompanhe os pedidos e avance cada etapa do preparo." actions={<Button
                    variant="outlined"
                    startIcon={<RefreshIcon className={isRefreshing ? 'refreshing' : ''} />}
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="kitchen-refresh-btn"
                    sx={{
                        borderColor: 'var(--color-primary)',
                        color: 'var(--color-primary)',
                        textTransform: 'none',
                        alignSelf: 'flex-start',
                        '&:hover': {
                            borderColor: 'var(--color-primary-dark)',
                            backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        },
                    }}
                >
                    {isRefreshing ? 'Atualizando...' : 'Atualizar'}
                </Button>} />

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
                        flexWrap: 'wrap',
                        width: '100%',
                        gap: { xs: 1, sm: 2 },
                        '& .MuiToggleButton-root': {
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                            px: { xs: 2, sm: 3 },
                            py: 1,
                            minHeight: 40,
                            textTransform: 'none',
                            fontWeight: 500,
                            marginRight: '8px',
                            marginBottom: '8px',
                            '&:last-child': {
                                marginRight: 0
                            },
                            '&.Mui-selected': {
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'var(--color-primary-dark)'
                                }
                            },
                            '&:hover': {
                                backgroundColor: 'rgba(37, 99, 235, 0.1)'
                            }
                        }
                    }}
                >
                    {KITCHEN_FILTERS.map((filter) => (
                        <ToggleButton key={filter.id} value={filter.id} aria-label={filter.label}>
                            {filter.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
                <FormControlLabel
                    sx={{ mt: 1.5, ml: 0.5 }}
                    control={
                        <Switch
                            checked={showFinalized}
                            onChange={handleShowFinalizedChange}
                            color="primary"
                        />
                    }
                    label={
                        finalizedCount > 0
                            ? `Mostrar finalizados (${finalizedCount})`
                            : 'Mostrar finalizados'
                    }
                />
                {showFinalized && finalizedCount === 0 ? (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 0.5 }}>
                        A coluna fica oculta enquanto não houver pedidos pagos.
                    </Typography>
                ) : null}
            </Box>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <Grid container spacing={3} className="kanban-board">
                    {columns.map((column) => (
                        <Grid item {...columnGridProps} key={column.key} sx={{ flexGrow: { lg: 1 } }}>
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
                                                backgroundColor: 'var(--color-primary)',
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
                                            {getOrdersByStatus(column.key).length === 0 && <Typography sx={{ py: 4, px: 2, textAlign: 'center', fontSize: 14 }} color="text.secondary">Nenhum pedido nesta etapa.</Typography>}
                                            {provided.placeholder}
                                        </Box>
                                    )}
                                </Droppable>
                            </KanbanColumn>
                        </Grid>
                    ))}
                </Grid>
            </DragDropContext>

            <Dialog
                open={!!selectedOrder}
                onClose={handleCloseModal}
                maxWidth="sm"
                aria-labelledby="kitchen-order-dialog-title"
                {...orderDialogProps}
                BackdropProps={{
                    sx: {
                        backgroundColor: 'var(--color-overlay)',
                        backdropFilter: 'none',
                    },
                }}
                PaperProps={{
                    ...orderDialogProps.PaperProps,
                    className: 'kitchen-order-dialog',
                    elevation: 0,
                }}
            >
                {selectedOrder && (
                    <>
                        <DialogTitle
                            id="kitchen-order-dialog-title"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1,
                                color: 'var(--color-primary)',
                                fontWeight: 700,
                                pr: 1.5,
                            }}
                        >
                            {selectedOrder.orderNumber}
                            <IconButton
                                onClick={handleCloseModal}
                                aria-label="fechar detalhes do pedido"
                                sx={{ color: 'var(--color-text-secondary)' }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent dividers>
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
                                    <Typography variant="body1" sx={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
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
                                        label={orderTypeLabel(selectedOrder.orderType)}
                                        size="small"
                                        sx={{
                                            backgroundColor: 'var(--color-primary)',
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
                                <KitchenItemLines items={selectedOrder.items} notes="" />
                            </Box>

                            {selectedOrder.notes ? (
                                <Box mt={3} className="kitchen-notes-box">
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        Observação do pedido
                                    </Typography>
                                    <Typography className="kitchen-item-obs" variant="body1">
                                        {selectedOrder.notes}
                                    </Typography>
                                </Box>
                            ) : null}
                        </DialogContent>
                        <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>
                            <Button
                                variant="outlined"
                                onClick={handleCloseModal}
                                sx={{
                                    borderColor: 'var(--color-primary)',
                                    color: 'var(--color-primary)',
                                    '&:hover': {
                                        borderColor: 'var(--color-primary-dark)',
                                        backgroundColor: 'var(--color-primary-soft)'
                                    }
                                }}
                            >
                                Fechar
                            </Button>
                            {selectedOrder.status !== 'finalizado' && selectedOrder.status !== 'entregue' ? (
                            <Button
                                variant="contained"
                                onClick={() => {
                                    handleStatusChange(selectedOrder.id);
                                    handleCloseModal();
                                }}
                                sx={{
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'var(--color-on-primary)',
                                    boxShadow: 'none',
                                    '&:hover': {
                                        backgroundColor: 'var(--color-primary-dark)',
                                        boxShadow: 'none',
                                    }
                                }}
                            >
                                Mover para Próxima Etapa
                            </Button>
                            ) : null}
                        </DialogActions>
                    </>
                )}
            </Dialog>

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
