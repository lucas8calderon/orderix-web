import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { useState, useContext } from 'react';
import { CategoryContext } from '../category/providers/CategoryContext';
import { ProductContext } from '../product/providers/ProductContext';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

export function NavActionButtons() {
    const { setHandleAddNewCategory, selectedCategory, errorToLoadCategories, setHandleDeleteCategory } = useContext(CategoryContext);
    const { setHandleAddNewProduct, selectedProduct, setHandleDeleteProduct } = useContext(ProductContext);

    const [anchorEl, setAnchorEl] = useState(null);
    const [currentOptions, setCurrentOptions] = useState([]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const open = Boolean(anchorEl);
    const [itemType, setItemType] = useState('');

    const iconStyle = { color: 'black' };
    const buttonStyle = {
        height: 50,
        marginRight: 3,
        borderRadius: '30%',
        backgroundColor: '#f0f0f0',
        '&:hover': { backgroundColor: '#e0e0e0' }
    };

    const handleClick = (event, options) => {
        setAnchorEl(event.currentTarget);
        setCurrentOptions(options);
    };

    const handleDeleteCategory = () => {
        setOpenDeleteDialog(true);
        setItemType('category');
    }

    const handleDeleteProduct = () => {
        setOpenDeleteDialog(true);
        setItemType('product');
    };

    const confirmDelete = () => {
        if (itemType === 'product') {
            setHandleDeleteProduct(selectedProduct);
        } else if (itemType === 'category') {
            setHandleDeleteCategory(selectedCategory);
        }

        setOpenDeleteDialog(false);
    };

    const handleSelected = (optionAction) => () => {
        setAnchorEl(null);
        setCurrentOptions([]);
        optionAction();
    };

    const handleClose = () => {
        setAnchorEl(null);
        setCurrentOptions([]);
    };

    const iconButtons = [
        {
            icon: <AddIcon sx={{ iconStyle }} />,
            onClick: handleClick,
            options: [
                { actionName: "Nova categoria", disabled: errorToLoadCategories === true, action: () => { setHandleAddNewCategory(true); } },
                { actionName: "Novo produto", disabled: Object.keys(selectedCategory).length === 0 || errorToLoadCategories === true, action: () => { setHandleAddNewProduct(true); } }
            ]
        },
        {
            icon: <DeleteIcon sx={{ iconStyle }} />,
            onClick: handleClick,
            options: [
                { actionName: "Deletar categoria", disabled: Object.keys(selectedCategory).length === 0 || errorToLoadCategories === true, action: handleDeleteCategory },
                { actionName: "Deletar produto", disabled: Object.keys(selectedProduct).length === 0 || errorToLoadCategories === true, action: handleDeleteProduct }
            ]
        },
        { icon: <SearchIcon sx={{ iconStyle }} />, onClick: handleClick, options: [] },
        { icon: <EditIcon sx={{ iconStyle }} />, onClick: handleClick, options: [] },
        { icon: <InfoIcon sx={{ iconStyle }} />, onClick: handleClick, options: [] },
    ];

    return (
        <>
            <Box sx={{ marginBottom: 5, display: 'flex', backgroundColor: '#B6C4B6', padding: 2, borderRadius: '10px' }}>
                {iconButtons.map((item, index) => (
                    <Button
                        key={index}
                        sx={{ ...buttonStyle, ...(index === iconButtons.length - 1 && { marginRight: 0 }) }}
                        onClick={(e) => item.onClick(e, item.options)}
                    >
                        {item.icon}
                    </Button>
                ))}
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={open}
                    onClose={handleClose}
                >
                    {currentOptions.map((option, index) => (
                        <MenuItem key={index} disabled={option.disabled} onClick={handleSelected(option.action)}>
                            {option.actionName}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>

            {/* Dialog de confirmação */}
            <ConfirmDeleteDialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={confirmDelete}
                itemType={ itemType}
                itemName={selectedProduct?.name || selectedCategory?.name}
            />
        </>
    );
}