import React from "react";
import InfoIcon from "@material-ui/icons/Info";
import BuildIcon from "@material-ui/icons/Build";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import useModel from "../../../hooks/useModel";

const useStyles = makeStyles((theme) => ({
  textInfo: {
    marginLeft: "5px",
  },
  textShutdown: {
    marginLeft: "5px",
    marginRight: "5px",
  },
  toggleButton: {
    "&.MuiToggleButton-root.Mui-selected": {
      color: "rgba(255, 255, 255, 0.9)",
    },
  },
}));

export default function SelectType() {
  const { selectionMode, setSelectionMode } = useModel()!;

  //const [view, setView] = React.useState('info');

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    nextView: string
  ) => {
    if (nextView === "info" || nextView === "break") {
      setSelectionMode(nextView);
    }
  };

  const classes = useStyles();

  return (
    <ToggleButtonGroup
      size="small"
      value={selectionMode}
      exclusive
      onChange={handleChange}
    >
      <ToggleButton
        value="info"
        aria-label="info"
        className={classes.toggleButton}
      >
        <InfoIcon />
        <Typography variant="h6" className={classes.textInfo}>
          Info
        </Typography>
      </ToggleButton>
      <ToggleButton
        value="break"
        aria-label="break"
        className={classes.toggleButton}
      >
        <BuildIcon />
        <Typography variant="h6" className={classes.textShutdown}>
          Shutdown
        </Typography>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
