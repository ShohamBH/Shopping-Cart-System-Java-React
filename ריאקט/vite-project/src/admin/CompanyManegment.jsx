
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
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from '@mui/material';
import TableContainer from '@mui/material/TableContainer';

const Companys = () => {
  const [companys, setCompanys] = useState([]);
  const [form, setForm] = useState({
    id: '',
    name: '',
    email: '',
    cradention: '',
    numCoupons: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const API_BASE_URL = "http://localhost:8080/Admin";
  const token = localStorage.getItem('token');

  const [topCompany, setTopCompany] = useState(null);
  const [loadingTopCompany, setLoadingTopCompany] = useState(false);
  const [topCompanyError, setTopCompanyError] = useState(null);

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

  const getAuthHeaders = () => {
    if (!token) {
      showMessage('Authentication token not found. Please log in.', 'error');
      window.location.href = '/login';
      throw new Error("Token not found");
    }
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

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
      } else if (typeof err.response.data === 'string' && err.response.data) {
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
    fetchCompanys();
  }, [token]);

  const fetchCompanys = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/getAllCompany`, { headers });
      console.log(response);

      const companiesWithEmail = response.data.map(company => ({
        ...company,
        email: company.credentional?.email || ''
      }));

      setCompanys(companiesWithEmail);
      showMessage('Companies loaded successfully.', 'success');
    } catch (error) {
      handleError(error, 'Error fetching companies.');
      setCompanys([]);
    }
  };

  const fetchCompanyById = async () => {
    if (!searchTerm) {
      showMessage('Please enter a Company ID to search.', 'warning');
      return;
    }
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/getCompanyById/${searchTerm}`, { headers });
      const company = response.data;
      setForm({
        id: company.id,
        name: company.name,
        cradention: company.cradention,
        email: company.credentional?.email || '',
        numCoupons: company.numCoupons
      });
      setEditingId(company.id);
      showMessage(`Company ${company.name} loaded for editing.`, 'info');
    } catch (error) {
      handleError(error, `Company with ID ${searchTerm} not found.`);
      setForm({ id: '', name: '', cradention: '', email: '', numCoupons: '' });
      setEditingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = getAuthHeaders();

      // בונים את אובייקט cradention עם email בלבד (אפשר להוסיף password אם צריך)
      const cradentionObj = { email: form.email };

      const dataToSend = {
        id: form.id,
        name: form.name,
        cradention: cradentionObj,
        numCoupons: form.numCoupons,
      };

      if (editingId) {
        await axios.put(`${API_BASE_URL}/updateCompany/${editingId}`, dataToSend, { headers });
        showMessage('Company updated successfully!', 'success');
      } else {
        await axios.post(`${API_BASE_URL}/addCompany`, dataToSend, { headers });
        showMessage('Company added successfully!', 'success');
      }
      setForm({ id: '', name: '', cradention: '', email: '', numCoupons: '' });
      setEditingId(null);
      fetchCompanys();
    } catch (error) {
      handleError(error, 'Failed to submit company data.');
    }
  };

  const handleEdit = (company) => {
    setForm({
      id: company.id,
      name: company.name,
      cradention: company.cradention,
      email: company.credentional?.email || company.email || '',
      numCoupons: company.numCoupons,
    });
    setEditingId(company.id);
    setSearchTerm('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete company ID ${id}?`)) {
      return;
    }
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_BASE_URL}/deleteCompanyById/${id}`, { headers });
      showMessage(`Company ${id} deleted successfully!`, 'success');
      fetchCompanys();
      setForm({ id: '', name: '', cradention: '', email: '', numCoupons: '' });
      setEditingId(null);
    } catch (error) {
      handleError(error, 'Failed to delete company.');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchTopCompanyByCouponsAmount = async () => {
    setLoadingTopCompany(true);
    setTopCompanyError(null);
    setTopCompany(null);
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/getTopCompanyByCouponsAmount`, { headers });

      if (response.status === 204) {
        setTopCompanyError('No company found with coupons.');
        showMessage('No company found with coupons.', 'info');
      } else {
        setTopCompany(response.data);
        showMessage('Top company loaded successfully!', 'success');
      }
    } catch (error) {
      handleError(error, 'Error fetching top company.');
    } finally {
      setLoadingTopCompany(false);
    }
  };

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
      <AppBar position="static" sx={{ mb: 4, backgroundColor: '#8e24aa' }}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            ניהול חברות
          </Typography>
        </Toolbar>
      </AppBar>

      <Snackbar open={openSnackbar} autoHideDuration={message.type === 'error' ? 6000 : 4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={message.type} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>

      {/* Section 1: Top Company */}
      <SectionCard title="החברה המובילה לפי כמות קופונים" color="secondary" sx={{ backgroundColor: '#f3e5f5' }}>
        <Button
          variant="contained"
          onClick={fetchTopCompanyByCouponsAmount}
          disabled={loadingTopCompany}
          sx={{ mb: 2 }}
        >
          {loadingTopCompany ? <CircularProgress size={24} color="inherit" /> : 'הצג חברה מובילה'}
        </Button>

        {topCompanyError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {topCompanyError}
          </Alert>
        )}

        {topCompany && (
          <Box sx={{ mt: 2, p: 2, border: '1px dashed #ce93d8', borderRadius: 1 }}>
            <Typography variant="h6">פרטי החברה המובילה:</Typography>
            <Typography><strong>ID:</strong> {topCompany.id}</Typography>
            <Typography><strong>שם:</strong> {topCompany.name}</Typography>
            {topCompany.email && <Typography><strong>אימייל:</strong> {topCompany.email}</Typography>}
            {topCompany.numCoupons !== undefined && <Typography><strong>מספר קופונים:</strong> {topCompany.numCoupons}</Typography>}
          </Box>
        )}
      </SectionCard>

      {/* Section 2: Add/Update Company */}
      <SectionCard title={editingId ? `עריכת חברה ID: ${editingId}` : "הוספת חברה חדשה"} color="primary" sx={{ backgroundColor: '#e0f2f7' }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="ID"
            name="id"
            value={form.id}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={editingId !== null}
            sx={{ backgroundColor: editingId ? '#f5f5f5' : 'white' }}
          />
          <TextField
            label="שם"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="אימייל"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            disabled={editingId !== null}
            sx={{ backgroundColor: editingId ? '#f5f5f5' : 'white' }}
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
            <Button type="submit" variant="contained" color="primary">
              {editingId ? 'עדכן חברה' : 'הוסף חברה'}
            </Button>
            {editingId && (
              <Button variant="outlined" color="error" onClick={() => handleDelete(editingId)}>
                מחק חברה
              </Button>
            )}
            {editingId && (
              <Button variant="outlined" onClick={() => {
                setEditingId(null);
                setForm({ id: '', name: '', cradention: '', email: '', numCoupons: '' });
                setSearchTerm('');
              }}>
                בטל עריכה
              </Button>
            )}
          </Box>
        </Box>
      </SectionCard>

      {/* Section 3: Search Company */}
      <SectionCard title="חיפוש חברה" color="info" sx={{ backgroundColor: '#e8f5e9' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="חפש חברה לפי ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="number"
            variant="outlined"
            size="small"
            fullWidth
          />
          <Button type="button" variant="contained" onClick={fetchCompanyById} sx={{ height: '40px' }}>
            חפש
          </Button>
        </Box>
      </SectionCard>

      {/* Section 4: All Companies List */}
      <SectionCard title="כל החברות הקיימות" color="success" sx={{ backgroundColor: '#f0f4c3' }}>
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader aria-label="companies table" size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#dce775' }}>
                <TableCell>ID</TableCell>
                <TableCell>שם</TableCell>
                <TableCell>אימייל</TableCell>
                <TableCell>מספר קופונים</TableCell>
                <TableCell>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companys.length > 0 ? (
                companys.map((company) => (
                  <TableRow hover key={company.id}>
                    <TableCell>{company.id}</TableCell>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>{company.email}</TableCell>
                    <TableCell>{company.numCoupons}</TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" onClick={() => handleEdit(company)} sx={{ mr: 1 }}>ערוך</Button>
                      <Button variant="outlined" size="small" color="error" onClick={() => handleDelete(company.id)}>מחק</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="subtitle1" color="textSecondary">
                      לא נמצאו חברות.
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

export default Companys;
