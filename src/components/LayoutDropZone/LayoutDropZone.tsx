import React from "react";

import { ThemeProvider } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import DropZone from "./DropZone";
import { createTheme } from "../../theme";

function LayoutDropZone() {
  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <DropZone />
    </ThemeProvider>
  );
}

export default LayoutDropZone;
