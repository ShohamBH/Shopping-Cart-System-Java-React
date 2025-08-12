

import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, TextField, Container, Card, CardContent, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

function AuthComponent({ setSelectedComponent }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setOpenSnackbar(true);
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8080/auth/login', { email, password });

      if (response.status === 200) {
        const token = response.data;
        localStorage.setItem('token', token); // שימוש ב'token' עבור ה-JWT
        console.log("Login successful. Token received.");

        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(atob(base64));

        console.log("Decoded Token Payload:", decodedPayload);

        const role = decodedPayload.role; // קבלת תפקיד המשתמש
        const id = decodedPayload.sub; // חילוץ ה-ID משדה 'sub'

        console.log("User Role:", role);
        console.log("User ID:", id);

        if (id) {
          // *** תיקון כאן: שינוי מ-loggedInCustomerId ל-companyId עבור תפקיד COMPANY ***
          if (role === 'ROLE_COMPANY') {
            localStorage.setItem('loggedInCompanyId', id); // שמירת ה-ID של החברה
            console.log("Logged in Company ID saved:", id);
            
          } else {
            // עבור תפקידים אחרים, אם תרצה לשמור ID במפתח גנרי
            localStorage.setItem('loggedInCustomerId', id);
            console.log("Logged in User ID saved:", id);
          }
        } else {
          console.warn("User ID not found in token payload.");
          showMessage("Login successful, but user ID missing from token. Some features may not work.", "warning");
        }

        if (role === 'ROLE_ADMIN') {
          setSelectedComponent('admin');
        } else if (role === 'ROLE_CUSTOMER') {
          setSelectedComponent('customers');
        } else if (role === 'ROLE_COMPANY') {
          setSelectedComponent('company');
        } else {
          showMessage('Unknown role. Access denied.', 'error');
          localStorage.removeItem('token');
          localStorage.removeItem('loggedInCompanyId'); // נקה גם את זה אם התפקיד לא מוכר
          localStorage.removeItem('loggedInCustomerId'); // נקה גם את זה
          return;
        }

        showMessage('Login successful!', 'success');
      } else {
        showMessage('Login failed. Please check your credentials.', 'error');
      }
    } catch (error) {
      console.error("Login Error:", error.response ? error.response.data : error.message);
      let errorMessageText = 'Login failed. Please check your credentials.';
      if (error.response && typeof error.response.data === 'string') {
        errorMessageText = `Login failed: ${error.response.data}`;
      }
      showMessage(errorMessageText, 'error');
    }
  };

  return (
    <Container maxWidth="xs">
      <AppBar position="static" sx={{ mb: 4, backgroundColor: '#3f51b5' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Login
          </Typography>
        </Toolbar>
      </AppBar>

      <Snackbar open={openSnackbar} autoHideDuration={message.type === 'error' ? 6000 : 4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={message.type} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>

      <Card style={{ marginTop: '20px', padding: '20px' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center">Sign In</Typography>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="contained" color="primary" fullWidth onClick={handleLogin} sx={{ mt: 2 }}>
            Login
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}

export default AuthComponent;
