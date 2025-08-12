
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  TextField,
  Button,
  Box,
  CircularProgress, // נוסף עבור טעינה
  Alert, // נוסף עבור הודעות
  Snackbar, // נוסף עבור הודעות
  Card, // נוסף עבור SectionCard
  CardContent, // נוסף עבור SectionCard
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from '@mui/material';
import TableContainer from '@mui/material/TableContainer'; // ודא שזה מיובא אם אתה משתמש בו

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    id: '',
    name: '',
    lastName: '',
    age: '',
    numCoupons: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const API_BASE_URL = "http://localhost:8080/Admin";
  const token = localStorage.getItem('token');

  // --- State עבור הודעות מערכת ---
  const [message, setMessage] = useState({ text: '', type: '' });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false); // נוסף לטעינה כללית

  // --- Utility Functions for Snackbar ---
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setOpenSnackbar(true);
  };

  const getAuthHeaders = () => {
    if (!token) {
      showMessage('Authentication token not found. Please log in.', 'error');
      // ייתכן שתרצה להפנות לדף ההתחברות כאן
      window.location.href = '/login';
      throw new Error("Token not found"); // זרוק שגיאה כדי לעצור את המשך הפעולה
    }
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  // --- Error Handling Function (לקוח מ-CompanysComponent) ---
  const handleError = (err, defaultMessage) => {
    console.error("API Error:", err);
    if (err.message === "Token not found") {
      showMessage("Authentication token not found. Please log in.", "error");
      return;
    }
    let detailedMessage = defaultMessage;
    if (err.response) {
      if (err.response.status === 401) {
        detailedMessage = "Unauthorized: Please check your login credentials.";
      } else if (err.response.status === 403) {
        detailedMessage = "Forbidden: You don't have permission to perform this action.";
      } else if (err.response.status === 404) {
        detailedMessage = "Not Found: The requested resource could not be found.";
      }
      else if (typeof err.response.data === 'string' && err.response.data) {
        detailedMessage = `Error ${err.response.status}: ${err.response.data}`;
      } else if (err.response.data && err.response.data.message) {
        detailedMessage = `Error ${err.response.status}: ${err.response.data.message}`;
      } else if (err.response.statusText) {
        detailedMessage = `Error ${err.response.status}: ${err.response.statusText}`;
      }
    } else if (err.request) {
      detailedMessage = "No response from server. Please check your network connection.";
    } else {
      detailedMessage = `Request setup error: ${err.message || defaultMessage}`;
    }
    showMessage(detailedMessage, "error");
  };

  useEffect(() => {
    if (!token) {
      showMessage('You must be logged in to access this page.', 'error');
      return;
    }
    fetchCustomers();
  }, [token]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/getAllCustomer`, { headers });
      setCustomers(response.data);
      showMessage('Customers loaded successfully.', 'success');
    } catch (error) {
      handleError(error, 'Error fetching customers.');
      setCustomers([]); // ודא שהרשימה מתאפסת במקרה של שגיאה
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerById = async () => {
    if (!searchTerm) {
      showMessage('Please enter a Customer ID to search.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/getCustomerById/${searchTerm}`, { headers });
      const customer = response.data;
      setForm({
        id: customer.id,
        name: customer.name,
        lastName: customer.lastName,
        age: customer.age,
        numCoupons: customer.numCoupons,
      });
      setEditingId(customer.id);
      showMessage(`Customer ${customer.name} loaded for editing.`, 'info');
    } catch (error) {
      handleError(error, `Customer with ID ${searchTerm} not found.`);
      setForm({ id: '', name: '', lastName: '', age: '', numCoupons: '' });
      setEditingId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const dataToSend = { ...form };

      if (editingId) {
        await axios.put(`${API_BASE_URL}/updateCustomer/${editingId}`, dataToSend, { headers });
        showMessage('Customer updated successfully!', 'success');
      } else {
        await axios.post(`${API_BASE_URL}/addCustomer`, dataToSend, { headers });
        showMessage('Customer added successfully!', 'success');
      }
      setForm({ id: '', name: '', lastName: '', age: '', numCoupons: '' });
      setEditingId(null);
      fetchCustomers(); // רענן את הרשימה לאחר פעולה מוצלחת
    } catch (error) {
      handleError(error, 'Failed to submit customer data.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setForm({
      id: customer.id, // חשוב לשים את ה-ID כאן גם לטופס
      name: customer.name,
      lastName: customer.lastName,
      age: customer.age,
      numCoupons: customer.numCoupons,
    });
    setEditingId(customer.id);
    setSearchTerm(''); // איפוס שדה החיפוש
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete customer ID ${id}?`)) {
      return;
    }
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_BASE_URL}/deleteCustomerById/${id}`, { headers });
      showMessage(`Customer ${id} deleted successfully!`, 'success');
      fetchCustomers();
      setForm({ id: '', name: '', lastName: '', age: '', numCoupons: '' }); // איפוס טופס אם הלקוח נמחק
      setEditingId(null);
    } catch (error) {
      handleError(error, 'Failed to delete customer.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- Helper for Card structure (copied from CompanysComponent) ---
  const SectionCard = ({ title, color, children, sx = {} }) => (
    <Card variant="outlined" sx={{ mb: 3, ...sx }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color={color}>{title}</Typography>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <AppBar position="static" sx={{ mb: 4, backgroundColor: '#4a148c' }}> {/* צבע כותרת שונה */}
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            ניהול לקוחות
          </Typography>
        </Toolbar>
      </AppBar>

      <Snackbar open={openSnackbar} autoHideDuration={message.type === 'error' ? 6000 : 4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={message.type} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>

      {/* Section 1: Add/Update Customer */}
      <SectionCard title={editingId ? `עריכת לקוח ID: ${editingId}` : "הוספת לקוח חדש"} color="primary" sx={{ backgroundColor: '#e8eaf6' }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="ID"
            name="id"
            value={form.id}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={editingId !== null} // מונע עריכת ID בעת עדכון
            sx={{ backgroundColor: editingId ? '#f5f5f5' : 'white' }}
          />
          <TextField
            label="שם פרטי"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="שם משפחה"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="גיל"
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="מספר קופונים"
            name="numCoupons"
            type="number"
            value={form.numCoupons}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : (editingId ? 'עדכן לקוח' : 'הוסף לקוח')}
            </Button>
            {editingId && (
              <Button variant="outlined" color="error" onClick={() => handleDelete(editingId)} disabled={loading}>
                מחק לקוח
              </Button>
            )}
            {editingId && (
                <Button variant="outlined" onClick={() => {
                    setEditingId(null);
                    setForm({ id: '', name: '', lastName: '', age: '', numCoupons: '' });
                    setSearchTerm('');
                }} disabled={loading}>
                    בטל עריכה
                </Button>
            )}
          </Box>
        </Box>
      </SectionCard>

      {/* Section 2: Search Customer */}
      <SectionCard title="חיפוש לקוח" color="info" sx={{ backgroundColor: '#e3f2fd' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="חפש לקוח לפי ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="number"
            variant="outlined"
            size="small"
            fullWidth
          />
          <Button type="button" variant="contained" onClick={fetchCustomerById} sx={{ height: '40px' }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'חפש'}
          </Button>
        </Box>
      </SectionCard>

      {/* Section 3: All Customers List */}
      <SectionCard title="כל הלקוחות הקיימים" color="success" sx={{ backgroundColor: '#e8f5e9' }}>
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader aria-label="customers table" size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#c8e6c9' }}>
                <TableCell>ID</TableCell>
                <TableCell>שם פרטי</TableCell>
                <TableCell>שם משפחה</TableCell>
                <TableCell>גיל</TableCell>
                <TableCell>מספר קופונים</TableCell>
                <TableCell>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow hover key={customer.id}>
                    <TableCell>{customer.id}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.lastName}</TableCell>
                    <TableCell>{customer.age}</TableCell>
                    <TableCell>{customer.numCoupons}</TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" onClick={() => handleEdit(customer)} sx={{ mr: 1 }} disabled={loading}>ערוך</Button>
                      <Button variant="outlined" size="small" color="error" onClick={() => handleDelete(customer.id)} disabled={loading}>מחק</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="subtitle1" color="textSecondary">
                      לא נמצאו לקוחות.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>
    </Container>
  );
};

export default Customers;