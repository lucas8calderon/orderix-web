import React from "react";
import { styled } from "@mui/material/styles";
import MuiButton from "@mui/material/Button";

// Mapeamento dos variants customizados
const variants = {
  default: {
    border: "1px solid var(--color-light-gray)",
    backgroundColor: "var(--color-white)",
    color: "var(--color-dark-gray)",
    "&:hover": {
      backgroundColor: "var(--color-light-gray)",
      border: "1px solid var(--color-mid-gray)"
    },
  },
  destructive: {
    backgroundColor: "#d32f2f",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#b71c1c",
    },
  },
  outline: {
    border: "1px solid var(--color-border)",
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text-primary)",
    "&:hover": {
      backgroundColor: "var(--color-surface-muted)",
    },
  },
  secondary: {
    backgroundColor: "var(--color-primary)",
    color: "var(--color-on-primary)",
    "&:hover": {
      backgroundColor: "var(--color-primary-dark)",
    },
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--color-text-primary)",
    "&:hover": {
      backgroundColor: "var(--color-hover)",
    },
  },
  link: {
    backgroundColor: "transparent",
    color: "#1976d2",
    textDecoration: "underline",
    "&:hover": {
      color: "#1565c0",
    },
  },
};

// Mapeamento dos tamanhos
const sizes = {
  default: {
    height: 40,
    width: 'auto',
    padding: "0 16px",
    fontSize: "0.875rem",
  },
  sm: {
    height: 28,
    width: 38,
    padding: "0 12px",
    fontSize: "0.75rem",
  },
  lg: {
    height: 44,
    padding: "0 24px",
    fontSize: "1rem",
  },
  icon: {
    height: 40,
    width: 40,
    minWidth: 16,
    padding: 0,
  },
};

const CustomButton = styled(MuiButton)(
  ({ variantcustom = "default", sizecustom = "icon" }) => ({
    borderRadius: 6,
    fontWeight: 500,
    textTransform: "none",
    transition: "all 0.2s ease",
    minWidth: "unset",
    ...variants[variantcustom],
    ...sizes[sizecustom],
  })
);

export default function Button({ variant = "default", size = "default", ...props }) {
  return <CustomButton variantcustom={variant} sizecustom={size} {...props} />;
}
