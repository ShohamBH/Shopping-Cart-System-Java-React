

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AppBar, Toolbar, Typography, Container, TextField, Button, Box,
  Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody,
  Paper, Snackbar, Alert
} from "@mui/material";
import TableContainer from '@mui/material/TableContainer';

const CustomersAndCouponsComponent = () => {
  const [message, setMessage] = useState({ text: "", type: "" });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [loggedInCustomerId, setLoggedInCustomerId] = useState(() => {
    const storedId = localStorage.getItem('loggedInCustomerId');
    return storedId ? parseInt(storedId) : null;
  });
  const [loggedInCustomerDetails, setLoggedInCustomerDetails] = useState(null);
  const [loggedInCustomerCoupons, setLoggedInCustomerCoupons] = useState([]);
const [myUpdateData, setMyUpdateData] = useState({ name: "", lastName: "", age: "" });
  const [isEditingMyDetails, setIsEditingMyDetails] = useState(false);

  const [allCoupons, setAllCoupons] = useState([]);
  const [couponIdToPurchase, setCouponIdToPurchase] = useState("");

  const API_CUSTOMER_URL = "http://localhost:8080/Customer";

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setOpenSnackbar(true);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    console.log("Auth Token:", token);
    if (!token) {
      showMessage("Authentication token not found. Please log in.", "error");
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
        detailedMessage = "Unauthorized: Please check your login credentials or token.";
      } else if (err.response.status === 403) {
        detailedMessage = "Forbidden: You don't have permission to perform this action.";
      } else if (err.response.status === 404) {
        detailedMessage = "Not Found: The requested resource could not be found.";
      }
      if (typeof err.response.data === 'string' && err.response.data) {
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

  const fetchAllCoupons = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await axios.get(`${API_CUSTOMER_URL}/getAllCoupons`, { headers });
      setAllCoupons(res.data);
    } catch (err) {
      handleError(err, "Error loading all coupons.");
      setAllCoupons([]);
    }
  };

  const fetchCustomerCoupons = async () => {
    if (!loggedInCustomerId) {
      showMessage("Customer ID is required to fetch coupons.", "error");
      setLoggedInCustomerCoupons([]);
      return;
    }
    try {
      const headers = getAuthHeaders();
      const res = await axios.get(`${API_CUSTOMER_URL}/getCouponsByCustomer`, { headers });
      setLoggedInCustomerCoupons(res.data);
      showMessage(`Coupons for customer ${loggedInCustomerId} loaded successfully.`, "success");
    } catch (err) {
      handleError(err, `Error loading coupons for customer ${loggedInCustomerId}.`);
      setLoggedInCustomerCoupons([]);
    }
  };

  const purchaseCoupon = async () => {
    if (!loggedInCustomerId || !couponIdToPurchase) {
      showMessage("Please log in as a customer and enter a coupon ID to purchase.", "error");
      return;
    }
    try {
      const headers = getAuthHeaders();
      // התיקון: מעבירים "null" כגוף הבקשה, כי השרת לא מצפה לזה
      // await axios.post(`${API_CUSTOMER_URL}/addCoupons/${couponIdToPurchase}`, null, { headers });
      // קטע מתוך CustomersComponent.jsx
await axios.post(`${API_CUSTOMER_URL}/addCoupons/${couponIdToPurchase}`, null, { headers });
      showMessage(`Coupon ${couponIdToPurchase} purchased successfully!`, "success");
      setCouponIdToPurchase("");
      fetchCustomerCoupons();
      fetchLoggedInCustomerDetails();
    } catch (err) {
      handleError(err, "Failed to purchase coupon.");
    }
  };

  const removeCoupon = async (couponIdToRemove) => {
    if (!loggedInCustomerId) {
      showMessage("You must be logged in as a customer to remove coupons.", "error");
      return;
    }
    if (!window.confirm(`Are you sure you want to remove coupon ID ${couponIdToRemove} from your collection?`)) {
      return;
    }
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_CUSTOMER_URL}/removeCoupon/${couponIdToRemove}`, { headers });
      showMessage(`Coupon ${couponIdToRemove} removed successfully from your collection!`, "success");
      fetchCustomerCoupons();
      fetchLoggedInCustomerDetails();
    } catch (err) {
      handleError(err, "Failed to remove coupon from your collection.");
    }
  };

  const fetchLoggedInCustomerDetails = async () => {
    if (!loggedInCustomerId) {
      showMessage("Logged-in Customer ID is missing.", "error");
      setLoggedInCustomerDetails(null);
      return;
    }
    try {
      const headers = getAuthHeaders();
      const res = await axios.get(`${API_CUSTOMER_URL}/getCustomerById`, { headers });
      console.log("Customer details from API:", res.data);
      setLoggedInCustomerDetails(res.data);
    } catch (err) {
      handleError(err, "Failed to load my details.");
      setLoggedInCustomerDetails(null);
    }
  };

  const updateMyDetails = async () => {
    if (!loggedInCustomerId) {
      showMessage("You must be logged in to update your details.", "error");
      return;
    }
    try {
      const headers = getAuthHeaders();
      await axios.put(`${API_CUSTOMER_URL}/updateMyDetails`, myUpdateData, { headers });
      showMessage("Your details updated successfully!", "success");
      await fetchLoggedInCustomerDetails();
      setIsEditingMyDetails(false);
    } catch (err) {
      handleError(err, "Failed to update your details.");
    }
  };

  useEffect(() => {
    console.log("LoggedInCustomerId:", loggedInCustomerId);
    fetchAllCoupons();
    if (loggedInCustomerId) {
      fetchLoggedInCustomerDetails();
      fetchCustomerCoupons();
    } else {
      showMessage("Please log in as a customer to view your details and purchase coupons.", "info");
    }
  }, [loggedInCustomerId]);

useEffect(() => {
    if (loggedInCustomerDetails) {
      setMyUpdateData({
        name: loggedInCustomerDetails.name || "",
        lastName: loggedInCustomerDetails.lastName || "", // הוספה: מאתחל את ה-lastName מהנתונים הקיימים
        age: loggedInCustomerDetails.age || ""
      });
    }
}, [loggedInCustomerDetails]);
  const SectionCard = ({ title, color, children, sx = {} }) => (
    <Card variant="outlined" sx={{ mb: 3, boxShadow: 3, ...sx }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color={color} sx={{ borderBottom: `2px solid ${color}`, pb: 1, mb: 2 }}>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <AppBar position="static" sx={{ mb: 4, backgroundColor: '#1976d2', borderRadius: 1 }}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Customer & Coupon Management Portal
          </Typography>
        </Toolbar>
      </AppBar>

      <Snackbar open={openSnackbar} autoHideDuration={message.type === 'error' ? 6000 : 4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={message.type} sx={{ width: '100%', boxShadow: 6 }}>
          {message.text}
        </Alert>
      </Snackbar>

      <SectionCard title="My Details" color="primary" sx={{ backgroundColor: '#e3f2fd', borderColor: '#90caf9' }}>
        {loggedInCustomerDetails ? (
          <Box>
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              <strong>ID:</strong> {loggedInCustomerDetails.id}
            </Typography>
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              <strong>Name:</strong> {loggedInCustomerDetails.name}
            </Typography>
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              <strong>Last Name:</strong> {loggedInCustomerDetails.lastName}
            </Typography>
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              <strong>Age:</strong> {loggedInCustomerDetails.age}
            </Typography>
<Typography variant="body1" sx={{ mb: 0.5 }}>
              <strong>numCoupons:</strong> {loggedInCustomerDetails.numCoupons}
            </Typography>
            {isEditingMyDetails ? (
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="First Name"
                  value={myUpdateData.name}
                  onChange={(e) => setMyUpdateData({ ...myUpdateData, name: e.target.value })}
                  sx={{ mt: 1, mr: 2, mb: 1 }}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
                <TextField
    label="Last Name"
    value={myUpdateData.lastName}
    onChange={(e) => setMyUpdateData({ ...myUpdateData, lastName: e.target.value })}
    sx={{ mt: 1, mr: 2, mb: 1 }}
    variant="outlined"
    size="small"
    fullWidth
/>
                <TextField
                  label="Age"
                  type="number"
                  value={myUpdateData.age}
                  onChange={(e) => setMyUpdateData({ ...myUpdateData, age: parseInt(e.target.value) || 0 })}
                  sx={{ mt: 1, mb: 1 }}
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0 }}
                  fullWidth
                />
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={updateMyDetails}
                    sx={{ mr: 1 }}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setIsEditingMyDetails(false);
                      setMyUpdateData({
                        name: loggedInCustomerDetails.name || "",
                        age: loggedInCustomerDetails.age || ""
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setIsEditingMyDetails(true)}
                  sx={{ mt: 2, mb: 3 }}
                >
                  Edit My Details
                </Button>
              </Box>
            )}

            {loggedInCustomerCoupons.length > 0 ? (
              <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 1, border: '1px solid #bbdefb' }}>
                <Typography variant="subtitle1" sx={{ p: 2, backgroundColor: '#e1f5fe', borderBottom: '1px solid #bbdefb', fontWeight: 'medium' }}>My Purchased Coupons:</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#bbdefb' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loggedInCustomerCoupons.map((coupon) => (
                      <TableRow key={coupon.id} hover>
                        <TableCell>{coupon.id}</TableCell>
                        <TableCell>{coupon.title}</TableCell>
                        <TableCell>${coupon.price ? coupon.price.toFixed(2) : 'N/A'}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => removeCoupon(coupon.id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>No coupons purchased yet. Why not explore our <a href="#all-coupons">available coupons</a>?</Typography>
            )}
          </Box>
        ) : (
          <Typography variant="body1" color="textSecondary">Please log in as a customer to view your customer details and coupons.</Typography>
        )}
      </SectionCard>

      <SectionCard id="all-coupons" title="All Available Coupons" color="success" sx={{ backgroundColor: '#e8f5e9', borderColor: '#a5d6a7' }}>
        {allCoupons.length > 0 ? (
          <TableContainer component={Paper} sx={{ maxHeight: 400, borderRadius: 1, border: '1px solid #c8e6c9' }}>
            <Table stickyHeader aria-label="all coupons table" size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#c8e6c9' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Discount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Expiry Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allCoupons.map((coupon) => (
                  <TableRow hover key={coupon.id}>
                    <TableCell>{coupon.id}</TableCell>
                    <TableCell>{coupon.title}</TableCell>
                    <TableCell>{coupon.description}</TableCell>
                    <TableCell>{coupon.category}</TableCell>
                    <TableCell>{coupon.discount ? `${(coupon.discount * 100).toFixed(0)}%` : 'N/A'}</TableCell>
                    <TableCell>{coupon.amount}</TableCell>
                    <TableCell>{coupon.expiryDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="textSecondary">No coupons found or failed to load coupons. Try again later.</Typography>
        )}
      </SectionCard>

      <SectionCard title="Purchase a Coupon" color="secondary" sx={{ backgroundColor: '#fff3e0', borderColor: '#ffcc80' }}>
        <Box component="form" onSubmit={(e) => { e.preventDefault(); purchaseCoupon(); }} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="Coupon ID to Purchase"
            value={couponIdToPurchase}
            onChange={(e) => setCouponIdToPurchase(e.target.value)}
            type="number"
            variant="outlined"
            size="small"
            fullWidth
            inputProps={{ min: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={!loggedInCustomerId || !couponIdToPurchase}
            sx={{ height: '40px', minWidth: '120px' }}
          >
            Purchase
          </Button>
        </Box>
        {!loggedInCustomerId && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Please log in as a customer to purchase coupons.
          </Typography>
        )}
      </SectionCard>
    </Container>
  );
};

export default CustomersAndCouponsComponent;
