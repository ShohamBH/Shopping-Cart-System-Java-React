import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
} from "@mui/material";

function CouponsComponent() {
    const [coupons, setCoupons] = useState([]); // All coupons
    const [searchId, setSearchId] = useState(""); // ID for search
    const [coupon, setCoupon] = useState(null); // Coupon to fetch by ID
    const [newCoupon, setNewCoupon] = useState({ id: "", name: "", description: "", discount: 0, amount: 0, image: "", title: "" }); // New coupon to add
    const [updateCoupon, setUpdateCoupon] = useState({ id: "", name: "", description: "", discount: 0, amount: 0, image: "", title: "" }); // Coupon to update
    const [isEditing, setIsEditing] = useState(false); // Control editing mode
    const [errorMessage, setErrorMessage] = useState(""); // Store error message

    // Fetch all coupons
    const fetchCoupons = () => {
        axios
            .get("http://localhost:8080/coupon/getAll")
            .then((response) => setCoupons(response.data))
            .catch((error) => console.error("Error fetching coupons:", error));
    };

    // Fetch coupon by ID
    const fetchCouponById = (id) => {
        axios
            .get(`http://localhost:8080/coupon/getById/${id}`)
            .then((response) => {
                if (response.data) {
                    setCoupon(response.data);
                    setUpdateCoupon(response.data); // Update for editing
                    setIsEditing(false); // Reset editing mode
                    setErrorMessage(""); // Clear error message
                } else {
                    setCoupon(null); // Clear any existing coupon
                    setErrorMessage("Coupon does not exist."); // Set error message
                    setIsEditing(false); // Close editing mode if opened
                }
            })
            .catch((error) => {
                console.error("Error fetching coupon by ID:", error);
                setErrorMessage("Error attempting to retrieve the coupon."); // Generic error message
            });
    };

    // Add a new coupon
    const addCoupon = () => {
        axios
            .post("http://localhost:8080/coupon/add", newCoupon)
            .then(() => {
                alert("Coupon added successfully!");
                setNewCoupon({ id: "", name: "", description: "", discount: 0, amount: 0, image: "", title: "" });
                fetchCoupons(); // Update the list
            })
            .catch((error) => console.error("Error adding coupon:", error));
    };

    // Delete coupon by ID
    const deleteCoupon = (id) => {
        axios
            .delete(`http://localhost:8080/coupon/deleteById?id=${id}`)
            .then(() => {
                alert("Coupon deleted successfully!");
                fetchCoupons(); // Update the list
            })
            .catch((error) => console.error("Error deleting coupon:", error));
    };

    // Update coupon by ID
    const updateCouponById = (id) => {
        axios
            .put(`http://localhost:8080/coupon/update/${id}`, updateCoupon)
            .then(() => {
                alert("Coupon updated successfully!");
                setIsEditing(false); // Exit editing mode
                fetchCoupons(); // Update the list to reflect the updated coupon
                setCoupon(updateCoupon); // Update coupon display after editing
            })
            .catch((error) => console.error("Error updating coupon:", error));
    };

    // Load all coupons on component mount
    useEffect(() => {
        fetchCoupons();
    }, []);

    return (
        <>
            <AppBar position="static" style={{ backgroundColor: "#6200ea" }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Coupons Management
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container style={{ marginTop: "20px" }}>
                {/* Search coupon by ID */}
                <Card style={{ backgroundColor: "#fff3e0", padding: "20px", marginBottom: "20px" }}>
                    <CardContent>
                        <Typography variant="h5">Search Coupon by ID:</Typography>
                        <TextField
                            label="Enter Coupon ID"
                            variant="outlined"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            style={{ marginBottom: "10px", marginRight: "10px" }}
                        />
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => fetchCouponById(searchId)}
                            disabled={!searchId}
                        >
                            Search
                        </Button>
                        {errorMessage && (
                            <Typography color="error" style={{ marginTop: "10px" }}>
                                {errorMessage} {/* Display error message */}
                            </Typography>
                        )}
                        {coupon && (
                            <Card style={{ backgroundColor: "#e1f5fe", padding: "20px", marginTop: "20px" }}>
                                <CardContent>
                                    <Typography variant="h6">Coupon Details:</Typography>
                                    <Typography>Name: {coupon.name}</Typography>
                                    <Typography>Description: {coupon.description}</Typography>
                                    <Typography>Discount: {coupon.discount}%</Typography>
                                    <Typography>Amount: {coupon.amount}</Typography>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => deleteCoupon(coupon.id)}
                                        style={{ marginTop: "10px", marginRight: "10px" }}
                                    >
                                        Delete Coupon
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => {
                                            setUpdateCoupon(coupon); // Prepare the update fields
                                            setIsEditing(true); // Enable editing mode
                                        }}
                                        style={{ marginTop: "10px" }}
                                    >
                                        Update Coupon
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </CardContent>
                </Card>

                {/* Show update fields only if in editing mode */}
                {isEditing && (
                    <Card style={{ backgroundColor: "#ffe0b2", padding: "20px", marginBottom: "20px" }}>
                        <CardContent>
                            <Typography variant="h5">Update Coupon:</Typography>
                            <TextField
                                label="ID"
                                variant="outlined"
                                value={updateCoupon.id}
                                readOnly
                                style={{ marginBottom: "10px", marginRight: "10px" }}
                            />
                            <TextField
                                label="Name"
                                variant="outlined"
                                value={updateCoupon.name}
                                onChange={(e) => setUpdateCoupon({ ...updateCoupon, name: e.target.value })}
                                style={{ marginBottom: "10px", marginRight: "10px" }}
                            />
                            <TextField
                                label="Description"
                                variant="outlined"
                                value={updateCoupon.description}
                                onChange={(e) => setUpdateCoupon({ ...updateCoupon, description: e.target.value })}
                                style={{ marginBottom: "10px", marginRight: "10px" }}
                            />
                            <TextField
                                label="Discount"
                                variant="outlined"
                                type="number"
                                value={updateCoupon.discount}
                                onChange={(e) => setUpdateCoupon({ ...updateCoupon, discount: e.target.value })}
                                style={{ marginBottom: "10px", marginRight: "10px" }}
                            />
                            <TextField
                                label="Amount"
                                variant="outlined"
                                type="number"
                                value={updateCoupon.amount}
                                onChange={(e) => setUpdateCoupon({ ...updateCoupon, amount: e.target.value })}
                                style={{ marginBottom: "10px", marginRight: "10px" }}
                            />
                            <TextField
                                label="Image URL"
                                variant="outlined"
                                value={updateCoupon.image}
                                onChange={(e) => setUpdateCoupon({ ...updateCoupon, image: e.target.value })}
                                style={{ marginBottom: "10px", marginRight: "10px" }}
                            />
                            <TextField
                                label="Title"
                                variant="outlined"
                                value={updateCoupon.title}
                                onChange={(e) => setUpdateCoupon({ ...updateCoupon, title: e.target.value })}
                                style={{ marginBottom: "10px", marginRight: "10px" }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => updateCouponById(updateCoupon.id)} // Use the current ID to update
                                style={{ marginTop: "10px" }}
                            >
                                Save Changes
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => setIsEditing(false)} // Close editing mode
                                style={{ marginTop: "10px", marginLeft: "10px" }}
                            >
                                Cancel
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Add a new coupon */}
                <Card style={{ backgroundColor: "#e8f5e9", padding: "20px", marginBottom: "20px" }}>
                    <CardContent>
                        <Typography variant="h5">Add a New Coupon:</Typography>
                        <TextField
                            label="ID"
                            variant="outlined"
                            value={newCoupon.id}
                            onChange={(e) => setNewCoupon({ ...newCoupon, id: e.target.value })}
                            style={{ marginBottom: "10px", marginRight: "10px" }}
                        />
                        <TextField
                            label="Name"
                            variant="outlined"
                            value={newCoupon.name}
                            onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value })}
                            style={{ marginBottom: "10px", marginRight: "10px" }}
                        />
                        <TextField
                            label="Description"
                            variant="outlined"
                            value={newCoupon.description}
                            onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                            style={{ marginBottom: "10px", marginRight: "10px" }}
                        />
                        <TextField
                            label="Discount"
                            variant="outlined"
                            type="number"
                            value={newCoupon.discount}
                            onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                            style={{ marginBottom: "10px", marginRight: "10px" }}
                        />
                        <TextField
                            label="Amount"
                            variant="outlined"
                            type="number"
                            value={newCoupon.amount}
                            onChange={(e) => setNewCoupon({ ...newCoupon, amount: e.target.value })}
                            style={{ marginBottom: "10px", marginRight: "10px" }}
                        />
                        <TextField
                            label="Image URL"
                            variant="outlined"
                            value={newCoupon.image}
                            onChange={(e) => setNewCoupon({ ...newCoupon, image: e.target.value })}
                            style={{ marginBottom: "10px", marginRight: "10px" }}
                        />
                        <TextField
                            label="Title"
                            variant="outlined"
                            value={newCoupon.title}
                            onChange={(e) => setNewCoupon({ ...newCoupon, title: e.target.value })}
                            style={{ marginBottom: "10px", marginRight: "10px" }}
                        />
                        <Button variant="contained" color="success" onClick={addCoupon}>
                            Add Coupon
                        </Button>
                    </CardContent>
                </Card>

                {/* View all coupons */}
                <Typography variant="h5" style={{ marginBottom: "10px" }}>
                    All Coupons:
                </Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Discount</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Image</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {coupons.map((coupon) => (
                                <TableRow key={coupon.id}>
                                    <TableCell>{coupon.id}</TableCell>
                                    <TableCell>{coupon.name}</TableCell>
                                    <TableCell>{coupon.description}</TableCell>
                                    <TableCell>{coupon.discount}</TableCell>
                                    <TableCell>{coupon.amount}</TableCell>
                                    <TableCell>{coupon.title}</TableCell>
                                    <TableCell>{coupon.image}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </>
    );
}

export default CouponsComponent;