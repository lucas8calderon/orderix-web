import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { useContext } from 'react';
import { ProductContext } from './providers/ProductContext';

export default function ImageUpload({ onImageSelected }) {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result; // aqui vem a imagem em string
        setPreview(base64String);

        // envia a string para o componente pai ou para a API
        if (onImageSelected) {
          onImageSelected(base64String);
        }
      };

      reader.readAsDataURL(file); // converte para Base64
    }
  };

  return (
    <div>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="upload-button"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="upload-button">
        <Button variant="contained" component="span">
          Escolher Imagem
        </Button>
      </label>

      {preview && (
        <div style={{ marginTop: 20 }}>
          <img src={preview} alt="Preview" width="150" />
        </div>
      )}
    </div>
  );
}
