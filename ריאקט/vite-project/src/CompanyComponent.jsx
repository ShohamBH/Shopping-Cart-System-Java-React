

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    AppBar, Toolbar, Typography, Container, TextField, Button, Box,
    Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody,
    Paper, Snackbar, Alert, Grid, InputLabel, Select, MenuItem, FormControl
} from "@mui/material";
import TableContainer from '@mui/material/TableContainer';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// הגדרת קטגוריות הקופונים
const COUPON_CATEGORIES = [
    "FOOD", "ELECTRONIC", "RESTAURANT", "VACATION", "HEALTH", "SPORT", "CAMPING", "FASHION", "HOME", "OTHER"
];

const CompanyComponent = () => {
    const [message, setMessage] = useState({ text: "", type: "" });
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const [loggedInCompanyId, setLoggedInCompanyId] = useState(() => {
        const storedId = localStorage.getItem('loggedInCompanyId');
        return storedId ? parseInt(storedId) : null;
    });
    const [loggedInCompanyDetails, setLoggedInCompanyDetails] = useState(null);
    const [isEditingCompanyDetails, setIsEditingCompanyDetails] = useState(false);
    const [companyUpdateData, setCompanyUpdateData] = useState({ name: "" });

    const [allCoupons, setAllCoupons] = useState([]);
    const [newCouponData, setNewCouponData] = useState({
        id: "", // *** שדה ID חדש: מאפשר למשתמש להכניס ID ידנית ***
        name: "",
        title: "",
        description: "",
        amount: 0,
        discount: 0,
        category: "",
        expiryDate: dayjs().add(1, 'month').format('YYYY-MM-DD'),
        image: "",
        companyID: loggedInCompanyId || 0,
    });
    
    const [couponToUpdate, setCouponToUpdate] = useState(null);
    const [isUpdatingCoupon, setIsUpdatingCoupon] = useState(false);
    const [couponIdToDelete, setCouponIdToDelete] = useState("");

    const [searchCouponName, setSearchCouponName] = useState("");
    const [filteredCouponsByName, setFilteredCouponsByName] = useState([]);
    const [searchExpiryStartDate, setSearchExpiryStartDate] = useState(null);
    const [searchExpiryEndDate, setSearchExpiryEndDate] = useState(null);
    const [filteredCouponsByExpiryDate, setFilteredCouponsByExpiryDate] = useState([]);
    const [deleteExpiryDate, setDeleteExpiryDate] = useState(null);

    const API_COMPANY_URL = "http://localhost:8080/Company";

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

    const fetchMyCoupons = async () => {
        if (!loggedInCompanyId) {
            showMessage("Company ID is required to fetch coupons.", "error");
            setAllCoupons([]);
            return;
        }
        try {
            const headers = getAuthHeaders();
            const res = await axios.get(`${API_COMPANY_URL}/getMyCoupons`, { headers });
            setAllCoupons(res.data);
            showMessage(`Coupons for company ${loggedInCompanyId} loaded successfully.`, "success");
        } catch (err) {
            handleError(err, `Error loading coupons for company ${loggedInCompanyId}.`);
            setAllCoupons([]);
        }
    };

    const fetchLoggedInCompanyDetails = async () => {
        const companyId = localStorage.getItem('loggedInCompanyId');
        if (!companyId) {
            showMessage("Logged-in Company ID is missing.", "error");
            setLoggedInCompanyDetails(null);
            return;
        }

        const headers = getAuthHeaders();
        if (!headers || !headers.Authorization) {
            showMessage("Authentication token is missing. Please log in.", "error");
            setLoggedInCompanyDetails(null);
            return;
        }

        try {
            const fullUrl = `http://localhost:8080/Company/getCompanyDetails`;
            console.log("Fetching company details from URL:", fullUrl);
            const res = await axios.get(fullUrl, { headers });
            console.log("Company details fetched successfully:", res.data);
            setLoggedInCompanyDetails(res.data);
        } catch (err) {
            handleError(err, "Failed to load company details.");
            setLoggedInCompanyDetails(null);
        }
    };

    //  *** שינוי עיקרי: תיקון פונקציית הוספת הקופון ***
    const addCoupon = async () => {
        if (!loggedInCompanyId) {
            showMessage("Please log in as a company to add coupons.", "error");
            return;
        }
        try {
            const headers = getAuthHeaders();
            const payloadToSend = {
                // שינוי כאן: לוקח את ה-ID ישירות מה-State החדש
                id: parseInt(newCouponData.id), 
                name: newCouponData.name,
                title: newCouponData.title,
                description: newCouponData.description,
                amount: parseInt(newCouponData.amount), // ודא המרה למספר
                discount: parseFloat(newCouponData.discount), // ודא המרה למספר
                category: newCouponData.category || "OTHER",
                expiryDate: newCouponData.expiryDate,
                image: newCouponData.image,
                companyID: loggedInCompanyId,
            };

            // ודא שה-ID שהוזן הוא מספר תקין ולא אפס, כדי למנוע את השגיאה
            if (!payloadToSend.id || payloadToSend.id <= 0) {
                showMessage("Please enter a valid, unique ID for the new coupon.", "error");
                return;
            }

            console.log("Attempting to add coupon with payload:", payloadToSend);

            await axios.post(`${API_COMPANY_URL}/addCoupon`, payloadToSend, { headers });
            // console.log(res);
            showMessage("Coupon added successfully!", "success");

            // איפוס הנתונים לאחר הוספה, כולל שדה ה-ID החדש
            setNewCouponData({
                id: "",
                name: "",
                title: "",
                description: "",
                amount: 0,
                discount: 0,
                category: "",
                expiryDate: dayjs().add(1, 'month').format('YYYY-MM-DD'),
                image: "",
                companyID: loggedInCompanyId || 0,
            });

            console.log("react res");
            fetchMyCoupons();
        } catch (err) {
            handleError(err, "Failed to add coupon. Please check if the ID or coupon title already exists for this company.");
        }
    };

    const fetchCouponForUpdate = async (couponId) => {
        if (!loggedInCompanyId || !couponId) {
            showMessage("Company ID and Coupon ID are required to fetch a coupon.", "error");
            return;
        }
        try {
            const headers = getAuthHeaders();
            const res = await axios.get(`${API_COMPANY_URL}/getMyCouponById/${couponId}`, { headers });
            if (res.data) {
                setCouponToUpdate({
                    ...res.data,
                    expiryDate: res.data.expiryDate ? dayjs(res.data.expiryDate) : null,
                });
                setIsUpdatingCoupon(true);
            } else {
                showMessage("Coupon not found.", "warning");
                setCouponToUpdate(null);
                setIsUpdatingCoupon(false);
            }
        } catch (err) {
            handleError(err, `Failed to fetch coupon ${couponId} for update.`);
            setCouponToUpdate(null);
            setIsUpdatingCoupon(false);
        }
    };

    const updateCoupon = async () => {
        if (!couponToUpdate || !loggedInCompanyId) {
            showMessage("No coupon selected for update or company not logged in.", "error");
            return;
        }
        try {
            const headers = getAuthHeaders();
            const payload = {
                ...couponToUpdate,
                expiryDate: couponToUpdate.expiryDate ? dayjs(couponToUpdate.expiryDate).format('YYYY-MM-DD') : null,
            };
            await axios.put(`${API_COMPANY_URL}/updateCoupon/${couponToUpdate.id}`, payload, { headers });
            showMessage(`Coupon ${couponToUpdate.id} updated successfully!`, "success");
            setIsUpdatingCoupon(false);
            setCouponToUpdate(null);
            fetchMyCoupons();
        } catch (err) {
            handleError(err, "Failed to update coupon.");
        }
    };

    const deleteCoupon = async (couponId) => {
        if (!couponId) {
            showMessage("Coupon ID is missing.", "error");
            return;
        }
        if (!window.confirm(`Are you sure you want to delete coupon ID ${couponId}? This action cannot be undone.`)) {
            return;
        }
        try {
            const headers = getAuthHeaders();
            await axios.delete(`${API_COMPANY_URL}/deleteById/${couponId}`, { headers });
            showMessage(`Coupon ${couponId} deleted successfully!`, "success");
            fetchMyCoupons();
        } catch (err) {
            handleError(err, "Failed to delete coupon.");
        }
    };

    const updateCompanyDetails = async () => {
        if (!loggedInCompanyId) {
            showMessage("You must be logged in as a company to update your details.", "error");
            return;
        }
        try {
            const headers = getAuthHeaders();
            await axios.put(`${API_COMPANY_URL}/updateCompany`, loggedInCompanyDetails, { headers });
            showMessage("Company details updated successfully!", "success");
            await fetchLoggedInCompanyDetails();
            setIsEditingCompanyDetails(false);
        } catch (err) {
            handleError(err, "Failed to update company details.");
        }
    };

    const getCouponsByName = async () => {
        if (!searchCouponName) {
            showMessage("Please enter a name to search for coupons.", "info");
            setFilteredCouponsByName([]);
            return;
        }
        try {
            const headers = getAuthHeaders();
            const res = await axios.get(`${API_COMPANY_URL}/getByNameContaining`, { headers, params: { name: searchCouponName } });
            setFilteredCouponsByName(res.data);
            showMessage(`Found ${res.data.length} coupons containing "${searchCouponName}".`, "success");
        } catch (err) {
            handleError(err, `Failed to search coupons by name: "${searchCouponName}".`);
            setFilteredCouponsByName([]);
        }
    };

    const deleteCouponsByExpiryDate = async () => {
        if (!deleteExpiryDate) {
            showMessage("Please select an expiry date to delete coupons.", "error");
            return;
        }
        if (!window.confirm(`Are you sure you want to delete all coupons expiring on or before ${dayjs(deleteExpiryDate).format('YYYY-MM-DD')}? This action cannot be undone.`)) {
            return;
        }
        try {
            const headers = getAuthHeaders();
            const formattedDate = dayjs(deleteExpiryDate).format('YYYY-MM-DD');
            await axios.delete(`${API_COMPANY_URL}/deleteByExpiryDate`, { headers, params: { date: formattedDate } });
            showMessage(`Coupons expiring on or before ${formattedDate} deleted successfully!`, "success");
            setDeleteExpiryDate(null);
            fetchMyCoupons();
        } catch (err) {
            handleError(err, "Failed to delete coupons by expiry date.");
        }
    };

    const getCouponsByExpiryDateBetween = async () => {
        if (!searchExpiryStartDate || !searchExpiryEndDate) {
            showMessage("Please select both start and end dates for expiry date range.", "error");
            setFilteredCouponsByExpiryDate([]);
            return;
        }
        try {
            const headers = getAuthHeaders();
            const formattedStartDate = dayjs(searchExpiryStartDate).format('YYYY-MM-DD');
            const formattedEndDate = dayjs(searchExpiryEndDate).format('YYYY-MM-DD');
            const res = await axios.get(`${API_COMPANY_URL}/getByExpiryDateBetween`, {
                headers,
                params: {
                    startDate: formattedStartDate,
                    endDate: formattedEndDate
                }
            });
            setFilteredCouponsByExpiryDate(res.data);
            showMessage(`Found ${res.data.length} coupons expiring between ${formattedStartDate} and ${formattedEndDate}.`, "success");
        } catch (err) {
            handleError(err, "Failed to search coupons by expiry date range.");
            setFilteredCouponsByExpiryDate([]);
        }
    };

    useEffect(() => {
        if (loggedInCompanyId) {
            fetchLoggedInCompanyDetails();
            fetchMyCoupons();
        } else {
            showMessage("Please ensure you are logged in as a company to view your dashboard.", "info");
        }
    }, [loggedInCompanyId]);

    useEffect(() => {
        if (loggedInCompanyDetails) {
            setCompanyUpdateData({
                name: loggedInCompanyDetails.name || ""
            });
        }
    }, [loggedInCompanyDetails]);

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
    
    //  *** תיקון בשדה ה-ID בטופס הוספת קופון ***
    const handleAddCouponChange = (e) => {
        const { name, value } = e.target;
        setNewCouponData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };
    
    //  *** תיקון ב-UI כדי לאפשר הזנת ID ידנית ***
    const handleUpdateCouponChange = (e) => {
        const { name, value } = e.target;
        setCouponToUpdate(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="lg" sx={{ my: 4 }}>
                <AppBar position="static" sx={{ mb: 4, backgroundColor: '#4a148c', borderRadius: 1 }}>
                    <Toolbar>
                        <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'white' }}>
                            Company Dashboard
                        </Typography>
                        {loggedInCompanyId && (
                            <Typography variant="subtitle1" color="inherit">
                                Logged in as Company ID: {loggedInCompanyId}
                            </Typography>
                        )}
                    </Toolbar>
                </AppBar>

                <Snackbar open={openSnackbar} autoHideDuration={message.type === 'error' ? 6000 : 4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert onClose={handleSnackbarClose} severity={message.type} sx={{ width: '100%', boxShadow: 6 }}>
                        {message.text}
                    </Alert>
                </Snackbar>

                {/* --- סקשן 1: פרטי החברה שלי --- */}
                <SectionCard title="My Company Details" color="primary" sx={{ backgroundColor: '#ede7f6', borderColor: '#d1c4e9' }}>
                    {loggedInCompanyDetails ? (
                        <Box>
                            <Typography variant="body1"><strong>ID:</strong> {loggedInCompanyDetails.id}</Typography>
                            <Typography variant="body1"><strong>Email:</strong> {loggedInCompanyDetails.credentional?.email || 'N/A'}</Typography>
                            {isEditingCompanyDetails ? (
                                <Box sx={{ mt: 2 }}>
                                    <TextField
                                        label="Company Name"
                                        value={companyUpdateData.name}
                                        onChange={(e) => setCompanyUpdateData({ ...companyUpdateData, name: e.target.value })}
                                        sx={{ mt: 1, mb: 1 }}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                    />
                                    <Box sx={{ mt: 2 }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={updateCompanyDetails}
                                            sx={{ mr: 1 }}
                                        >
                                            Save Changes
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => {
                                                setIsEditingCompanyDetails(false);
                                                setCompanyUpdateData({ name: loggedInCompanyDetails.name || "" });
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Box>
                                    <Typography variant="body1"><strong>Name:</strong> {loggedInCompanyDetails.name}</Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => setIsEditingCompanyDetails(true)}
                                        sx={{ mt: 2, mb: 3 }}
                                    >
                                        Edit Company Details
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Typography variant="body1" color="textSecondary">Please log in as a company to view your details.</Typography>
                    )}
                </SectionCard>

                {/* --- סקשן 2: ניהול קופונים (הוספה, עדכון, מחיקה) --- */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <SectionCard title="Add New Coupon" color="secondary" sx={{ backgroundColor: '#e8f5e9', borderColor: '#a5d6a7' }}>
                            <Box component="form" onSubmit={(e) => { e.preventDefault(); addCoupon(); }}>
                                <TextField
                                    label="ID"
                                    name="id" // *** הוספת שם לשדה כדי ש-handleAddCouponChange ידע איזה שדה לעדכן ***
                                    type="number"
                                    value={newCouponData.id}
                                    onChange={handleAddCouponChange}
                                    fullWidth margin="normal"
                                    size="small"
                                    inputProps={{ min: 1 }} // מונע הזנת ID 0 או שלילי
                                />
                                <TextField label="Name" name="name" value={newCouponData.name} onChange={handleAddCouponChange} fullWidth margin="normal" size="small" />
                                <TextField label="Title" name="title" value={newCouponData.title} onChange={handleAddCouponChange} fullWidth margin="normal" size="small" />
                                <TextField label="Description" name="description" value={newCouponData.description} onChange={handleAddCouponChange} fullWidth margin="normal" size="small" />
                                <TextField label="Amount" name="amount" type="number" value={newCouponData.amount} onChange={handleAddCouponChange} fullWidth margin="normal" size="small" inputProps={{ min: 0 }} />
                                <TextField label="Discount" name="discount" type="number" value={newCouponData.discount} onChange={handleAddCouponChange} fullWidth margin="normal" size="small" inputProps={{ min: 0, step: "0.01" }} />
                                <FormControl fullWidth margin="normal" size="small">
                                    <InputLabel id="category-select-label">Category</InputLabel>
                                    <Select
                                        labelId="category-select-label"
                                        name="category"
                                        value={newCouponData.category}
                                        label="Category"
                                        onChange={handleAddCouponChange}
                                    >
                                        <MenuItem value=""><em>None</em></MenuItem>
                                        {COUPON_CATEGORIES.map((category) => (
                                            <MenuItem key={category} value={category}>{category}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <DatePicker
                                    label="Expiry Date"
                                    value={dayjs(newCouponData.expiryDate)}
                                    onChange={(newValue) => setNewCouponData({ ...newCouponData, expiryDate: newValue.format('YYYY-MM-DD') })}
                                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" size="small" />}
                                />
                                <TextField label="Image URL" name="image" value={newCouponData.image} onChange={handleAddCouponChange} fullWidth margin="normal" size="small" />
                                <Button type="submit" variant="contained" color="secondary" sx={{ mt: 2 }} disabled={!loggedInCompanyId || !newCouponData.id || !newCouponData.name || !newCouponData.title}>
                                    Add Coupon
                                </Button>
                                {!loggedInCompanyId && <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Please log in as a company to add coupons.</Typography>}
                            </Box>
                        </SectionCard>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <SectionCard title="Update Coupon" color="warning" sx={{ backgroundColor: '#fff3e0', borderColor: '#ffcc80' }}>
                            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                                <TextField
                                    label="Coupon ID to Update"
                                    type="number"
                                    value={couponToUpdate?.id || ""}
                                    onChange={(e) => setCouponToUpdate({ ...couponToUpdate, id: parseInt(e.target.value) || 0 })}
                                    fullWidth
                                    size="small"
                                    disabled={isUpdatingCoupon}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={() => fetchCouponForUpdate(couponToUpdate?.id)}
                                    disabled={isUpdatingCoupon || !couponToUpdate?.id}
                                >
                                    Load
                                </Button>
                            </Box>
                            {isUpdatingCoupon && couponToUpdate && (
                                <Box component="form" onSubmit={(e) => { e.preventDefault(); updateCoupon(); }}>
                                    <TextField label="Name" name="name" value={couponToUpdate.name} onChange={handleUpdateCouponChange} fullWidth margin="normal" size="small" />
                                    <TextField label="Title" name="title" value={couponToUpdate.title} onChange={handleUpdateCouponChange} fullWidth margin="normal" size="small" />
                                    <TextField label="Description" name="description" value={couponToUpdate.description} onChange={handleUpdateCouponChange} fullWidth margin="normal" size="small" />
                                    <TextField label="Amount" name="amount" type="number" value={couponToUpdate.amount} onChange={handleUpdateCouponChange} fullWidth margin="normal" size="small" inputProps={{ min: 0 }} />
                                    <TextField label="Discount" name="discount" type="number" value={couponToUpdate.discount} onChange={handleUpdateCouponChange} fullWidth margin="normal" size="small" inputProps={{ min: 0, step: "0.01" }} />
                                    <FormControl fullWidth margin="normal" size="small">
                                        <InputLabel id="update-category-select-label">Category</InputLabel>
                                        <Select
                                            labelId="update-category-select-label"
                                            name="category"
                                            value={couponToUpdate.category}
                                            label="Category"
                                            onChange={handleUpdateCouponChange}
                                        >
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {COUPON_CATEGORIES.map((category) => (
                                                <MenuItem key={category} value={category}>{category}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <DatePicker
                                        label="Expiry Date"
                                        value={couponToUpdate.expiryDate}
                                        onChange={(newValue) => setCouponToUpdate({ ...couponToUpdate, expiryDate: newValue })}
                                        renderInput={(params) => <TextField {...params} fullWidth margin="normal" size="small" />}
                                    />
                                    <TextField label="Image URL" name="image" value={couponToUpdate.image} onChange={handleUpdateCouponChange} fullWidth margin="normal" size="small" />
                                    <Box sx={{ mt: 2 }}>
                                        <Button type="submit" variant="contained" color="warning" sx={{ mr: 1 }}>
                                            Update Coupon
                                        </Button>
                                        <Button variant="outlined" color="error" onClick={() => setIsUpdatingCoupon(false)}>
                                            Cancel
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </SectionCard>
                    </Grid>
                </Grid>

                {/* --- סקשן 3: מחיקת קופונים --- */}
                <SectionCard title="Delete Coupons" color="error" sx={{ backgroundColor: '#fbe9e7', borderColor: '#ffab91' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>Delete by ID:</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    label="Coupon ID"
                                    type="number"
                                    value={couponIdToDelete}
                                    onChange={(e) => setCouponIdToDelete(e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                                <Button variant="contained" color="error" onClick={() => deleteCoupon(couponIdToDelete)} disabled={!couponIdToDelete}>
                                    Delete
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>Delete by Expiry Date:</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <DatePicker
                                    label="Expiry Date"
                                    value={deleteExpiryDate}
                                    onChange={(newValue) => setDeleteExpiryDate(newValue)}
                                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" size="small" />}
                                />
                                <Button variant="contained" color="error" onClick={deleteCouponsByExpiryDate} disabled={!deleteExpiryDate}>
                                    Delete All
                                </Button>
                            </Box>
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                This will delete all coupons that expire on or before the selected date.
                            </Typography>
                        </Grid>
                    </Grid>
                </SectionCard>

                {/* --- סקשן 4: חיפוש וסינון קופונים --- */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <SectionCard title="Search by Name" color="info" sx={{ backgroundColor: '#e3f2fd', borderColor: '#90caf9' }}>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <TextField
                                    label="Coupon Name"
                                    value={searchCouponName}
                                    onChange={(e) => setSearchCouponName(e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                                <Button variant="contained" color="info" onClick={getCouponsByName}>
                                    Search
                                </Button>
                            </Box>
                            {filteredCouponsByName.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Search Results ({filteredCouponsByName.length})</Typography>
                                    <TableContainer component={Paper}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>ID</TableCell>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Title</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredCouponsByName.map((coupon) => (
                                                    <TableRow key={coupon.id}>
                                                        <TableCell>{coupon.id}</TableCell>
                                                        <TableCell>{coupon.name}</TableCell>
                                                        <TableCell>{coupon.title}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}
                        </SectionCard>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <SectionCard title="Search by Expiry Date Range" color="info" sx={{ backgroundColor: '#e3f2fd', borderColor: '#90caf9' }}>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12} sm={6}>
                                    <DatePicker
                                        label="Start Date"
                                        value={searchExpiryStartDate}
                                        onChange={(newValue) => setSearchExpiryStartDate(newValue)}
                                        renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <DatePicker
                                        label="End Date"
                                        value={searchExpiryEndDate}
                                        onChange={(newValue) => setSearchExpiryEndDate(newValue)}
                                        renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                                    />
                                </Grid>
                            </Grid>
                            <Button variant="contained" color="info" onClick={getCouponsByExpiryDateBetween} disabled={!searchExpiryStartDate || !searchExpiryEndDate}>
                                Search
                            </Button>
                            {filteredCouponsByExpiryDate.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Search Results ({filteredCouponsByExpiryDate.length})</Typography>
                                    <TableContainer component={Paper}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>ID</TableCell>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Expiry Date</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredCouponsByExpiryDate.map((coupon) => (
                                                    <TableRow key={coupon.id}>
                                                        <TableCell>{coupon.id}</TableCell>
                                                        <TableCell>{coupon.name}</TableCell>
                                                        <TableCell>{coupon.expiryDate}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}
                        </SectionCard>
                    </Grid>
                </Grid>

                {/* --- סקשן 5: כל הקופונים שלי (טבלה) --- */}
                <SectionCard title="My Coupons" color="default" sx={{ backgroundColor: '#f5f5f5', borderColor: '#e0e0e0' }}>
                    {allCoupons.length > 0 ? (
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Discount (%)</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Expiry Date</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allCoupons.map((coupon) => (
                                        <TableRow key={coupon.id} hover>
                                            <TableCell>{coupon.id}</TableCell>
                                            <TableCell>{coupon.name}</TableCell>
                                            <TableCell>{coupon.title}</TableCell>
                                            <TableCell>{coupon.description}</TableCell>
                                            <TableCell>{coupon.amount}</TableCell>
                                            <TableCell>{coupon.discount}</TableCell>
                                            <TableCell>{coupon.category}</TableCell>
                                            <TableCell>{coupon.expiryDate}</TableCell>
                                            <TableCell>
                                                <Button variant="outlined" color="warning" onClick={() => fetchCouponForUpdate(coupon.id)} size="small" sx={{ mr: 1 }}>Edit</Button>
                                                <Button variant="outlined" color="error" onClick={() => deleteCoupon(coupon.id)} size="small">Delete</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography variant="body1" color="textSecondary">No coupons found. Start by adding a new coupon above.</Typography>
                    )}
                </SectionCard>
            </Container>
        </LocalizationProvider>
    );
};

export default CompanyComponent;

