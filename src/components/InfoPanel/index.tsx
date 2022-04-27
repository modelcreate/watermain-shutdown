import React from "react";

import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";

import SmallGraph from "../SmallGraph";
import PropertyTable from "../PropertyTable";

import useEpanet from "../../hooks/useEpanet";
import { SelectedAssetInfo } from "../../context/EpanetContext";

const useStyles = makeStyles((theme) => ({
  debugInfo: {
    position: "absolute",
    marginTop: "65px",
    marginRight: "15px",
    zIndex: 2,
    width: "340px",
    background: "#fff",
    borderRadius: "1px",
    right: 0,
  },
  featureTitle: {
    padding: "10px 10px",

    background: "#f5f5f5",
  },
  featureTitleText: {
    color: "black",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: "18px",
  },
}));

interface InfoPanelProps {
  selectedAsset: SelectedAssetInfo;
  currentSelectedNode: [number[], undefined] | [number[], number[]];
}

function InfoPanel({ selectedAsset, currentSelectedNode }: InfoPanelProps) {
  const classes = useStyles();

  const { setSelectedAsset } = useEpanet()!;

  const axisLabel =
    selectedAsset.type === "link" ? "Flow (l/s)" : "Pressure (m)";

  return (
    currentSelectedNode &&
    selectedAsset && (
      <Paper className={classes.debugInfo} elevation={3}>
        <Grid container className={classes.featureTitle} alignItems="center">
          <Grid item xs={11}>
            <Typography variant="h3" className={classes.featureTitleText}>
              {selectedAsset.type.charAt(0).toUpperCase() +
                selectedAsset.type.substr(1).toLowerCase()}
              : {selectedAsset.id}
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <IconButton
              color="primary"
              size="small"
              style={{ color: "#737373" }}
              onClick={() => {
                setSelectedAsset(undefined);
              }}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
        <SmallGraph modelData={currentSelectedNode} axisLabel={axisLabel} />
        <PropertyTable data={selectedAsset.properties} />
      </Paper>
    )
  );
}

export default InfoPanel;
