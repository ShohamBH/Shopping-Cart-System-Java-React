import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light", // או "dark" אם אתה מעדיף
    primary: {
      main: "#1976d2", // כחול
    },
    secondary: {
      main: "#f50057", // ורוד
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
