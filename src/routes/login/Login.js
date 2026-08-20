import React, { useState } from 'react';
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import backgroundImage from "../../assets/login-bg.jpg";
import Typography from '@mui/material/Typography';
import orderixLogo from "../../assets/orderix-logo.png";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import * as LoginConstants from './loginConstants.js';
import signIn, { resolveHomePath } from '../../services/authService.js';
import { Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [loginError, setLoginError] = useState(false);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' }}>
            <Container maxWidth="sm" sx={{ marginTop: 32, marginBottom: 32, marginRight: 20, marginLeft: 20, borderRadius: '12px', bgcolor: '#FFFFFF' }}>
                <Box sx={{ marginLeft: -3, display: 'flex', height: '8vh', width: '62vh', flexDirection: 'column' }}>
                    {loginError && (
                        <AlertMessage/>
                    )}
                </Box>
                <Box sx={{ bgcolor: '#FFFFFF', height: '70vh', display: 'flex', justifyContent: 'center' }}>
                    <LoginContent setLoginError={setLoginError} />
                </Box>
            </Container>
        </Box>
    );
}

function AlertMessage() {
    return (
        <Alert variant="filled" severity="error">
            Credenciais inválidas. Você <Link to="/forgot-password" style={{ color: '#FFFFFF' }}>
                esqueceu a sua senha
            </Link>?
        </Alert>
    );
}

function LoginContent({ setLoginError }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Logo />
            <WelcomeMessage />
            <FormSection setLoginError={setLoginError} />
        </Box>
    );
}

function Logo() {
    return (
        <img src={orderixLogo} height={200} width={280} />
    );
}

function WelcomeMessage() {
    return (
        <Box sx={{ alignSelf: 'flex-start', marginTop: 4 }}>
            <Typography variant="h4" component="h4" sx={{ fontWeight: 'bold', marginLeft: '-40px' }}>
                {LoginConstants.WELCOME_TEXT}
            </Typography>
            <Typography variant="subtitle1" component="subtitle1" sx={{ marginLeft: '-40px' }}>
                {LoginConstants.CREDENTIALS_TEXT}
            </Typography>
        </Box>
    );
}

function FormSection({ setLoginError }) {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('')
    const [userPassword, setUserPassword] = useState('')
    const [emailError, setEmailError] = useState(false)
    const [emailHelperText, setEmailHelperText] = useState('')
    const [passwordError, setPasswordError] = useState(false)
    const [passwordHelperText, setPasswordHelperText] = useState('')

    const login = () => {
        if (!userEmail) {
            setEmailError(true)
            setEmailHelperText('Digite seu e-mail')
        }

        if (!userPassword) {
            setPasswordError(true)
            setPasswordHelperText('Digite sua senha')
        }

        else if (userEmail && userPassword) {
            setEmailError(false)
            setEmailHelperText('')
            setPasswordError(false)
            setPasswordHelperText('')

            signIn(userEmail, userPassword)
                .then((user) => {
                    setLoginError(false);
                    navigate(resolveHomePath(user));
                })
                .catch((error) => {
                    setLoginError(true);
                    console.error("Error signing in:", error);
                });
        }
    }


    return (
        <>
            <TextField
                id="filled-basic"
                label={LoginConstants.EMAIL_LABEL}
                variant="filled"
                type="email"
                color="success"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                error={emailError}
                helperText={emailHelperText}
                sx={{ marginTop: 6, width: '130%' }}
            />

            <TextField
                id="filled-basic"
                label={LoginConstants.PASSWORD_LABEL}
                variant="filled"
                type="password"
                color="success"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                error={passwordError}
                helperText={passwordHelperText}
                sx={{ marginTop: 2, width: '130%' }}
            />

            <Box sx={{ alignSelf: 'flex-end', marginTop: 2, marginRight: -5 }}>
                <Typography variant="subtitle1" component="subtitle1" sx={{ fontWeight: 'bold' }}>
                    <Link to="/forgot-password" style={{ color: '#2D6187' }}>
                        {LoginConstants.FORGOT_PASSWORD_TEXT}
                    </Link>
                </Typography>
            </Box>

            <Button onClick={login} variant="contained" color="success" sx={{ marginTop: 8, width: '100%', height: '40px' }}>
                {LoginConstants.LOGIN_BUTTON_TEXT}
            </Button>
        </>
    );
}

export default Login;