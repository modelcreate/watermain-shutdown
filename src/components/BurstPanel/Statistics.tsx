import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import CustListDialog from "../CustListDialog";

import { ShutOffBlockInfo } from "../../utils/Trace";

import { NetworkIssueSummary } from "../../context/EpanetContext";

interface Statrops {
  title: string;
  singleTitle?: string;
  value: number;
  onMouseOver: () => void;
  onMouseOut: () => void;
}

function Stat({
  title,
  value,
  singleTitle,
  onMouseOver,
  onMouseOut,
}: Statrops) {
  const classes = useStyles();
  return (
    <Grid container onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
      <Grid item xs={2}>
        <Typography
          variant="body1"
          display="block"
          align="right"
          className={classes.statText}
        >
          {value}
        </Typography>
      </Grid>

      <Grid item xs={10}>
        <Typography
          variant="body2"
          display="block"
          color="textSecondary"
          className={classes.statTextTitle}
        >
          {value === 1 && singleTitle ? singleTitle : title}
        </Typography>
      </Grid>
    </Grid>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  header: {
    fontWeight: 700,
    margin: "10px 0px",
    fontSize: "24px",
  },
  statText: {
    fontSize: "18px",
    fontWeight: 700,
    lineHeight: "1.334",
    letterSpacing: "-0.05px",
  },
  statTextTitle: {
    fontSize: "18px",
    lineHeight: "1.334",
    letterSpacing: "-0.05px",
    paddingLeft: "6px",
    color: "#83858e",
    cursor: "pointer",
    "&:hover": {
      color: "white",
    },
  },
}));

interface StatisticsProps {
  shutOffBlockInfo: ShutOffBlockInfo;
  networkIssueSummary: NetworkIssueSummary;
  setStatHighlight: (id: string | undefined) => void;
}

interface StatSummary {
  withoutSupply: number;
  alternativeSupply: number;
  hydrantsOffline: number;
}
function getStats(shutOffBlockInfo: ShutOffBlockInfo): StatSummary {
  const layers = [
    "shutOffBlock",
    "downstreamIsolated",
    "altSupplyAvailable",
  ] as ("shutOffBlock" | "downstreamIsolated" | "altSupplyAvailable")[];

  const withoutSupply = layers.reduce((acc, l) => {
    return acc + shutOffBlockInfo[l].customers.length;
  }, 0);

  const alternativeSupply =
    shutOffBlockInfo.altSupplyAvailable.customers.length;

  const hydrantsOffline = layers.reduce((acc, l) => {
    return acc + shutOffBlockInfo[l].hydrants.length;
  }, 0);

  return {
    withoutSupply,
    alternativeSupply,
    hydrantsOffline,
  };
}

function Statistics({
  shutOffBlockInfo,
  networkIssueSummary,
  setStatHighlight,
}: StatisticsProps) {
  const classes = useStyles();

  const stats = getStats(shutOffBlockInfo);

  return (
    <>
      <Grid container direction="row" alignItems="center">
        <Grid item>
          <Typography
            variant="h3"
            display="block"
            gutterBottom
            className={classes.header}
          >
            Supply Interruptions
          </Typography>
        </Grid>
        <Grid item>
          <CustListDialog
            customers={[
              ...shutOffBlockInfo.shutOffBlock.customers,
              ...shutOffBlockInfo.downstreamIsolated.customers,
              ...shutOffBlockInfo.altSupplyAvailable.customers,
            ]}
          />
        </Grid>
      </Grid>
      <Stat
        title="properties isolated"
        value={stats.withoutSupply}
        onMouseOver={() => {
          setStatHighlight(undefined);
        }}
        onMouseOut={() => {
          setStatHighlight(undefined);
        }}
      />
      {stats.alternativeSupply > 0 && (
        <Stat
          title="with an alternative supply"
          value={stats.alternativeSupply}
          onMouseOver={() => {
            setStatHighlight(undefined);
          }}
          onMouseOut={() => {
            setStatHighlight(undefined);
          }}
        />
      )}

      <Typography
        variant="h3"
        display="block"
        gutterBottom
        className={classes.header}
      >
        Network Issues
      </Typography>
      <Stat
        title="hydrants offline"
        singleTitle="hydrant offline"
        value={stats.hydrantsOffline}
        onMouseOver={() => {
          setStatHighlight(undefined);
        }}
        onMouseOut={() => {
          setStatHighlight(undefined);
        }}
      />

      <Stat
        title="with inadequate pressure"
        value={networkIssueSummary.below15.length}
        onMouseOver={() => {
          setStatHighlight("below15");
        }}
        onMouseOut={() => {
          setStatHighlight(undefined);
        }}
      />

      <Stat
        title="low customer pressure"
        value={networkIssueSummary.reducedBy10.length}
        onMouseOver={() => {
          setStatHighlight("reducedBy10");
        }}
        onMouseOut={() => {
          setStatHighlight(undefined);
        }}
      />
      <Stat
        title="high customer pressure"
        value={networkIssueSummary.increasedBy10.length}
        onMouseOver={() => {
          setStatHighlight("increasedBy10");
        }}
        onMouseOut={() => {
          setStatHighlight(undefined);
        }}
      />
      <Stat
        title="flow reversals"
        value={networkIssueSummary.flowReversals.length}
        onMouseOver={() => {
          setStatHighlight("flowReversals");
        }}
        onMouseOut={() => {
          setStatHighlight(undefined);
        }}
      />
      <Stat
        title="sedementation lift"
        value={networkIssueSummary.highVelocity.length}
        onMouseOver={() => {
          setStatHighlight("highVelocity");
        }}
        onMouseOut={() => {
          setStatHighlight(undefined);
        }}
      />
    </>
  );
}

export default Statistics;
