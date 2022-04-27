import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Switch from "@material-ui/core/Switch";
import CircularProgress from "@material-ui/core/CircularProgress";
import CheckIcon from "@material-ui/icons/Check";
import WarningIcon from "@material-ui/icons/Warning";

import ShutValves from "./ShutValves";
import Statistics from "./Statistics";

import useModel from "../../hooks/useModel";
import useEpanet from "../../hooks/useEpanet";

const useStyles = makeStyles((theme) => ({
  appContainer: {
    height: "100vh",
    flexWrap: "unset",
  },
  horizontalRule: {
    borderColor: "#545454",
    margin: "20px 10px",
  },
  header: {
    padding: "12px 24px",
    flexBasis: "unset",
  },
  gridGutters: {
    paddingLeft: "24px",
    paddingRight: "24px",
  },
  featureTitleText: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
}));

function BurstPanel() {
  const classes = useStyles();

  const {
    isolationAsset,
    isolationArea,
    setIsolationValveHighlight,
    setStatHighlight,
  } = useModel()!;

  const {
    isModelRunning,
    isAltModelRunning,
    isModelError,
    networkIssueSummary,
  } = useEpanet()!;
  //;
  return (
    <Container className={classes.appContainer} maxWidth={false} disableGutters>
      <Grid
        container
        direction="column"
        justify="space-between"
        alignItems="stretch"
        style={{ height: "100vh", flexWrap: "unset" }}
      >
        <Grid item xs={12} className={classes.header}>
          <Typography variant="h2" gutterBottom>
            Watermain Shutdown
          </Typography>
          <Typography variant="body1" gutterBottom>
            Isolate a watermain by selecting it on the right.
          </Typography>
          <Grid container>
            <Grid item xs={11}>
              <Typography variant="body1" className={classes.featureTitleText}>
                Base Model - {isModelRunning ? "Running" : "Done"}
              </Typography>
            </Grid>
            <Grid item xs={1}>
              {isModelRunning ? (
                <CircularProgress size={18} />
              ) : (
                <CheckIcon fontSize={"small"} />
              )}
            </Grid>
          </Grid>
          {isolationAsset && (
            <>
              <Grid container>
                <Grid item xs={11}>
                  <Typography
                    variant="body1"
                    className={classes.featureTitleText}
                  >
                    Incident ({isolationAsset})-{" "}
                    {isAltModelRunning ? "Running" : "Done"}
                  </Typography>
                </Grid>
                <Grid item xs={1}>
                  {isAltModelRunning ? (
                    <CircularProgress size={18} />
                  ) : isModelError ? (
                    <WarningIcon fontSize={"small"} />
                  ) : (
                    <CheckIcon fontSize={"small"} />
                  )}
                </Grid>
              </Grid>
            </>
          )}
        </Grid>

        {isolationArea && (
          <Grid item xs={12} style={{ flexGrow: 1, overflow: "auto" }}>
            <ShutValves
              shutOffBlockInfo={isolationArea}
              setIsolationValveHighlight={setIsolationValveHighlight}
            />
          </Grid>
        )}
        {isolationArea && (
          <Grid item xs={12} className={classes.header}>
            <Statistics
              shutOffBlockInfo={isolationArea}
              networkIssueSummary={networkIssueSummary}
              setStatHighlight={setStatHighlight}
            />
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default BurstPanel;
