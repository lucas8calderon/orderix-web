import React from 'react';
import Card from '@mui/material/Card';
import Button from '../components/ui/Button';
import Tooltip from '@mui/material/Tooltip';
import {Edit, Trash2} from "lucide-react";
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import menuDefault from "../../../../assets/images/sem-imagem.jpg";
import Divider from '@mui/material/Divider';
import { useContext } from 'react';
import { ProductContext } from '../product/providers/ProductContext';
import { CategoryContext } from '../category/providers/CategoryContext';


export function CardCategory({ width = 250, height = 80, image, name, description, value, portion, isAvailable, isSelected = false, isCategory = true }) {
    let applySelectedStyle = isSelected 
    
    const {setOpenDeleteDialogCategory} = useContext(CategoryContext);

    return (
      <Card
        className={`category-card ${isSelected ? 'selected' : ''}`}
        sx={{
          width: width,
          maxWidth: isCategory ? "100%" : "700px",
          backgroundColor: "var(--color-surface)",
          borderRadius: "12px",
          border: applySelectedStyle ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
          boxShadow: applySelectedStyle
            ? "0 8px 32px rgba(var(--color-primary-rgb), 0.2)"
            : "var(--color-shadow)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        {isCategory ? (
          <CardMedia 
            sx={{ 
              height: height,
              borderRadius: "12px 12px 0 0",
              objectFit: "cover"
            }} 
            image={image || menuDefault} 
          />
        ) : (
          <Box sx={{ position: "relative" }}>
            <CardMedia
              sx={{
                height: 200,
                marginTop: 1,
                backgroundSize: "cover",
                borderRadius: "12px 12px 0 0",
              }}
              image={image || menuDefault}
            />
            <Typography
              sx={{
                position: "absolute",
                top: "24%",
                left: "84%",
                transform: "translate(-50%, -50%)",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "10px",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                backgroundColor: isAvailable ? "#4caf50" : "#f44336",
                borderRadius: "8px",
                padding: "2px 8px",
              }}
            >
              {isAvailable ? "Disponível" : "Indisponível"}
            </Typography>
          </Box>
        )}

        <CardContent sx={{ color: "#333", padding: "16px" }}>
          <Typography
            component={"div"}
            fontWeight={"fontWeightBold"}
            gutterBottom
            variant="h5"
          >
            {name}
          </Typography>

          {description ? (
            <Typography
              gutterBottom
              variant="h7"
              component="div"
              sx={{
                height: "50px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {description}
            </Typography>
          ) : !isCategory ? (
            <Typography
              gutterBottom
              variant="h7"
              component="div"
              sx={{
                height: "50px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Sem descrição
            </Typography>
          ) : null}
          <Divider variant="middle" />
          <Box display="flex" justifyContent="space-between" marginTop={2}>
            {portion && (
              <Typography gutterBottom variant="p" component="div">
                {portion}
              </Typography>
            )}

            {value && (
              <Typography
                gutterBottom
                variant="p"
                component="div"
                fontWeight={"fontWeightBold"}
              >
                R$ {value}
              </Typography>
            )}
          </Box>
          <Box className="category-actions">
            <Button 
              size="small" 
              variant="outlined"
              className="action-btn edit-btn"
            >
              <Tooltip title="Editar"> 
                <Edit className="h-4 w-4" />
              </Tooltip>
            </Button>
           
            <Button
              size="small"
              variant="outlined"
              className="action-btn delete-btn"
              onClick={() => setOpenDeleteDialogCategory(true)}
            >
              <Tooltip title="Excluir">
                <Trash2 className="h-4 w-4" />
              </Tooltip>
            </Button>
          </Box>

          {isAvailable && (
            <Typography gutterBottom variant="h5" component="div">
              {isAvailable}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
}