import React from 'react';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Button from '../components/ui/Button';
import {Edit, Trash2} from "lucide-react";
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import menuDefault from "../../../../assets/images/menu-default.svg";
import Divider from '@mui/material/Divider';
import { useContext } from 'react';
import { ProductContext } from '../product/providers/ProductContext';


export function CardProduct({ image, name, description, value, portion, isAvailable, isSelected = false }) {


    const {setOpenDeleteDialogProduct} = useContext(ProductContext);

    return (
      <Card
        sx={{
          display: "flex",
          borderRadius: 4,
          width: 350,
          height: 350,
          backgroundColor: "var(--color-white)",
          color: "var(--color-black)",
          boxShadow: 3,
          transition: "transform 0.3s",
          "&:hover": {
            transform: "scale(1.02)",
            boxShadow: 8,
          },
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
            padding: 0,
          }}
        >
          <CardMedia
            component="img"
            sx={{
              height: "50%",
              width: "100%",
              objectFit: "contain",
              background: "#ffff",
            }}
            image={image || menuDefault}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginLeft: 1,
              marginRight: 1,
              marginTop: 1,
            }}
          >
            <Typography
              component={"div"}
              fontWeight={"fontWeightBold"}
              gutterBottom
              variant="h6"
              sx={{
                flex: 1,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginRight: 1,
                lineHeight: 1,
              }}
            >
              {name}
            </Typography>

            <Chip
              label={isAvailable ? "Disponível" : "Indisponível"}
              sx={{
                fontSize: 10,
                height: 22,
                padding: "0 8px",
                backgroundColor: isAvailable ? "green" : "red",
                color: "#fff",
                flexShrink: 0,
              }}
            />
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              mx: 1,
              marginRight: 1,
              marginLeft: 1,
              height: 50,
            }}
          >
            <Typography
              display="inline"
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                height: 60,
              }}
            >
              {description || "Sem descrição"}
            </Typography>
          </Box>
          <Divider sx={{ marginTop: 1, marginLeft: 1, marginRight: 1 }} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 1,
              mx: 1,
              gap: 1,
              marginTop: 1,
              marginRight: 1,
              marginLeft: 1,
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: "bold",
              }}
            >
              R$ {value.toFixed(2).replace(".", ",")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "end",
                gap: 1,
              }}
            >
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
                onClick={() => setOpenDeleteDialogProduct(true)}
              >
                <Tooltip title="Excluir">
                  <Trash2 className="h-4 w-4" />
                </Tooltip>
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
}