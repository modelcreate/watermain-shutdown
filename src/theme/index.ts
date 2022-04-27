/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */

import { createMuiTheme, ThemeOptions } from "@material-ui/core";

const typography = {
  fontFamily: `'Lato',"Roboto", "Helvetica", "Arial", sans-serif`,
  h1: {
    fontFamily: `'Montserrat',"Roboto", "Helvetica", "Arial", sans-serif`,
    fontWeight: 700,
    fontSize: 35,
    letterSpacing: "-0.24px",
  },
  h2: {
    fontFamily: `'Montserrat',"Roboto", "Helvetica", "Arial", sans-serif`,

    fontWeight: 700,
    fontSize: 29,
    letterSpacing: "-0.24px",
  },
  h3: {
    fontFamily: `'Montserrat',"Roboto", "Helvetica", "Arial", sans-serif`,

    fontWeight: 500,
    fontSize: 24,
    letterSpacing: "-0.06px",
  },
  h4: {
    fontFamily: `'Montserrat',"Roboto", "Helvetica", "Arial", sans-serif`,

    fontWeight: 500,
    fontSize: 20,
    letterSpacing: "-0.06px",
  },
  h5: {
    fontFamily: `'Montserrat',"Roboto", "Helvetica", "Arial", sans-serif`,

    fontWeight: 500,
    fontSize: 16,
    letterSpacing: "-0.05px",
  },
  h6: {
    fontFamily: `'Montserrat',"Roboto", "Helvetica", "Arial", sans-serif`,
    fontWeight: 500,
    fontSize: 14,
    letterSpacing: "-0.05px",
  },
  overline: {
    fontWeight: 500,
  },
};

const themeConfig: ThemeOptions = {
  typography,
  overrides: {
    MuiLinearProgress: {
      root: {
        borderRadius: 3,
        overflow: "hidden",
      },
    },
    MuiListItemIcon: {
      root: {
        minWidth: 32,
      },
    },
    MuiChip: {
      root: {
        backgroundColor: "rgba(0,0,0,0.075)",
      },
    },
  },
  //name: "Dark",
  palette: {
    type: "dark",
    action: {
      active: "rgba(255, 255, 255, 0.54)",
      hover: "rgba(255, 255, 255, 0.04)",
      selected: "rgba(255, 255, 255, 0.08)",
      disabled: "rgba(255, 255, 255, 0.26)",
      disabledBackground: "rgba(255, 255, 255, 0.12)",
      focus: "rgba(255, 255, 255, 0.12)",
    },
    background: {
      default: "#282C34",
      //dark: "#1c2025",
      paper: "#282C34",
    },
    primary: {
      main: "#8a85ff",
    },
    secondary: {
      main: "#8a85ff",
    },
    text: {
      primary: "#e6e5e8",
      secondary: "#adb0bb",
    },
  },
};

export function createTheme() {
  const theme = createMuiTheme(themeConfig);

  return theme;
}
