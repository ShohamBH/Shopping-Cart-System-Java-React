// import React, { useState } from 'react';
// import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
// import AdminComponent from './adminComponent';
// import CompanyComponent from './CompanyComponent';
// import CustomersComponent from './CustomersComponent';
// import AuthComponent from './LoginComponent';

// function App() {
//   const [selectedComponent, setSelectedComponent] = useState('auth');

//   const renderComponent = () => {
//     switch (selectedComponent) {
//       case 'admin':
//         return <AdminComponent />;
//       case 'company':
//         return <CompanyComponent />;
//       case 'customers':
//         return <CustomersComponent />;
//       case 'auth':
//         return <AuthComponent setSelectedComponent={setSelectedComponent} />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <AppBar position="static">
//         <Toolbar>
//           <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
//             Management System
//           </Typography>
//         </Toolbar>
//       </AppBar>
//       <Container style={{ marginTop: '20px' }}>
//         {renderComponent()}
//       </Container>
//     </>
//   );
// }

// export default App;

import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import AdminComponent from './admin/adminComponent';
import CompanyComponent from './CompanyComponent';
import CustomersComponent from './CustomersComponent';
import AuthComponent from './LoginComponent';

function App() {
  const [selectedComponent, setSelectedComponent] = useState('auth'); // מתחילים עם רכיב ההתחברות

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'admin':
        return <AdminComponent />;
      case 'company':
        return <CompanyComponent />;
      case 'customers':
        return <CustomersComponent />;
      case 'auth':
        return <AuthComponent setSelectedComponent={setSelectedComponent} />;
      default:
        return null;
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Management System
          </Typography>
          {/* הוספת כפתורים לבחירה ידנית של קומפוננטה לצורך בדיקה
          <Button color="inherit" onClick={() => setSelectedComponent('admin')}>
            Admin
          </Button>
          <Button color="inherit" onClick={() => setSelectedComponent('company')}>
            Company
          </Button>
          <Button color="inherit" onClick={() => setSelectedComponent('customers')}>
            Customers
          </Button> */}
          <Button color="inherit" onClick={() => setSelectedComponent('auth')}>
            Login
          </Button>
        </Toolbar>
      </AppBar>
      <Container style={{ marginTop: '20px' }}>
        {renderComponent()}
      </Container>
    </>
  );
}

export default App;