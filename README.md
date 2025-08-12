"# Shopping-Cart-System-Java-React"  
Shopping Cart & Coupons Management System
A system built with Spring Boot (Backend) and React (Frontend) for managing coupons, companies, and customers.

Backend
Java Spring Boot REST API

CRUD operations for companies, coupons, and customers

User authentication with JWT

Business logic for managing shopping carts and coupons

Frontend
React with Material UI for a clean and efficient user interface

Axios for communication with the backend API

Company management including search, add, update, and delete

Display of coupons and customer details

How to Run
Start the Spring Boot backend server.

Run the React frontend project:

npm install
npm run dev

Make sure the backend API is available at http://localhost:8080/Admin.

Store the JWT token in localStorage under the key token.

Notes
Ensure the data structure matches between frontend and backend, especially the credentional object containing email and password.

Error handling and user notifications are implemented for a better user experience.
