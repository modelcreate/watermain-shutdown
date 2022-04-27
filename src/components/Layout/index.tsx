import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Drawer from "@material-ui/core/Drawer";

import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

import VectorMap from "../VectorMap";
import BurstPanel from "../BurstPanel";

import useEpanet from "../../hooks/useEpanet";
import useModel from "../../hooks/useModel";

const drawerWidth = 400;

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    boxShadow:
      "0px 6px 6px -3px rgba(0,0,0,0.2), 0px 10px 14px 1px rgba(0,0,0,0.14), 0px 4px 18px 3px rgba(0,0,0,0.12)",
    background: "#1e1e1e",
  },
  appContainer: {
    paddingLeft: drawerWidth,
    height: "100vh",
  },
}));

function Layout() {
  const { isModelError, setIsModelError } = useEpanet()!;
  const { modelViewport } = useModel()!;

  const handleClose = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setIsModelError(false);
  };

  const classes = useStyles();

  return (
    <React.Fragment>
      <Drawer
        elevation={16}
        className={classes.drawer}
        classes={{
          paper: classes.drawerPaper,
        }}
        variant="permanent"
        anchor="left"
      >
        <BurstPanel />
      </Drawer>
      <Container
        className={classes.appContainer}
        maxWidth={false}
        disableGutters
      >
        <VectorMap modelViewport={modelViewport} />
      </Container>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={isModelError}
        autoHideDuration={6000}
        onClose={handleClose}
        message="Model could not be simulated"
        action={
          <React.Fragment>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </React.Fragment>
  );
}

export default Layout;
