

import React, { useState } from "react";
import {
    ThemeProvider,
    AppBar,
    Toolbar,
    Typography,
    Container,
    Alert,
    Tabs,
    Tab,
    Box
} from "@mui/material";
import theme from "./theme"; // תוודא שזה הנתיב הנכון לקובץ ה-theme שלך
import CustomerManagement from "./CustomerManegment";
import CompanyManagement from "./CompanyManegment";
// import CouponManagement from "./components/CouponManagement"; // אם יש לך קופונים

function AdminComponent() {
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [tabIndex, setTabIndex] = useState(0);

    const handleError = (msg) => {
        setSuccessMessage("");
        setErrorMessage(msg);
    };

    const handleSuccess = (msg) => {
        setErrorMessage("");
        setSuccessMessage(msg);
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
        setErrorMessage("");
        setSuccessMessage("");
    };

    return (
        <ThemeProvider theme={theme}>
            <AppBar position="static" color="primary">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Admin Management Panel
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container sx={{ mt: 4, p: 3, borderRadius: '8px' }}>
                {successMessage && <Alert severity="success">{successMessage}</Alert>}
                {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

                {/* Tabs */}
                <Tabs value={tabIndex} onChange={handleTabChange} centered>
                    <Tab label="לקוחות" />
                    <Tab label="חברות" />
                  
                </Tabs>

                {/* Tab Panels */}
                <Box mt={3}>
                    {tabIndex === 0 && (
                        <CustomerManagement
                            theme={theme}
                            onSuccess={handleSuccess}
                            onError={handleError}
                        />
                    )}
                    {tabIndex === 1 && (
                        <CompanyManagement
                            theme={theme}
                            onSuccess={handleSuccess}
                            onError={handleError}
                        />
                    )}
                   
                </Box>
            </Container>
        </ThemeProvider>
    );
}

export default AdminComponent;
