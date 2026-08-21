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
import { ThemeToggleButton } from '../../commons/components/ThemeToggleButton';

function Login() {
    const [loginError, setLoginError] = useState(false);

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                width: '100%',
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                px: { xs: 2, sm: 3 },
                py: { xs: 3, sm: 6 },
                position: 'relative',
            }}
        >
            <Box sx={{ position: 'absolute', top: 12, right: 12, color: '#fff' }}>
                <ThemeToggleButton className="header-theme-toggle" />
            </Box>
            <Container
                maxWidth="sm"
                sx={{
                    borderRadius: '12px',
                    bgcolor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    px: { xs: 2.5, sm: 5 },
                    py: { xs: 3, sm: 5 },
                    width: '100%',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                }}
            >
                {loginError && <AlertMessage />}
                <LoginContent setLoginError={setLoginError} />
            </Container>
        </Box>
    );
}

function AlertMessage() {
    return (
        <Alert variant="filled" severity="error" sx={{ mb: 2, wordBreak: 'break-word' }}>
            Credenciais inválidas. Você <Link to="/forgot-password" style={{ color: '#FFFFFF' }}>
                esqueceu a sua senha
            </Link>?
        </Alert>
    );
}

function LoginContent({ setLoginError }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <Logo />
            <WelcomeMessage />
            <FormSection setLoginError={setLoginError} />
        </Box>
    );
}

function Logo() {
    return (
        <Box
            component="img"
            src={orderixLogo}
            alt="Orderix"
            sx={{
                width: '100%',
                maxWidth: 280,
                height: 'auto',
            }}
        />
    );
}

function WelcomeMessage() {
    return (
        <Box sx={{ alignSelf: 'stretch', mt: { xs: 2, sm: 4 } }}>
            <Typography
                variant="h4"
                component="h1"
                sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '1.5rem', sm: '2.125rem' },
                    wordBreak: 'break-word',
                }}
            >
                {LoginConstants.WELCOME_TEXT}
            </Typography>
            <Typography variant="subtitle1" component="p">
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
        <Box sx={{ width: '100%' }}>
            <TextField
                id="login-email"
                label={LoginConstants.EMAIL_LABEL}
                variant="filled"
                type="email"
                color="primary"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                error={emailError}
                helperText={emailHelperText}
                fullWidth
                sx={{ mt: { xs: 3, sm: 6 } }}
            />

            <TextField
                id="login-password"
                label={LoginConstants.PASSWORD_LABEL}
                variant="filled"
                type="password"
                color="primary"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                error={passwordError}
                helperText={passwordHelperText}
                fullWidth
                sx={{ mt: 2 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Typography variant="subtitle1" component="p" sx={{ fontWeight: 'bold' }}>
                    <Link to="/forgot-password" style={{ color: '#2D6187' }}>
                        {LoginConstants.FORGOT_PASSWORD_TEXT}
                    </Link>
                </Typography>
            </Box>

            <Button
                onClick={login}
                variant="contained"
                color="primary"
                sx={{ mt: { xs: 4, sm: 6 }, width: '100%', minHeight: 44 }}
            >
                {LoginConstants.LOGIN_BUTTON_TEXT}
            </Button>
        </Box>
    );
}

export default Login;
