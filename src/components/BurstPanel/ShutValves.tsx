import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Switch from "@material-ui/core/Switch";
import { ShutOffBlockInfo } from "../../utils/Trace";
import Divider from "@material-ui/core/Divider";
import useModel from "../../hooks/useModel";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    paddingTop: "6px",
    paddingBottom: "6px",
  },
  padding: {
    paddingLeft: "24px",
    paddingRight: "24px",
  },
}));

interface ShutValvesProps {
  shutOffBlockInfo: ShutOffBlockInfo;
  setIsolationValveHighlight: (id: string | undefined) => void;
}

function ShutValves({
  shutOffBlockInfo,
  setIsolationValveHighlight,
}: ShutValvesProps) {
  const classes = useStyles();
  const [checked, setChecked] = React.useState(["wifi"]);

  const {
    inoperableValves,
    handleInoperableValveChange,
    altSupplyValves,
    handleAltSupplyValvesChange,
  } = useModel()!;

  const handleToggle = (value: string) => () => {
    console.log(checked);
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  return (
    <List dense disablePadding className={classes.root}>
      <ListSubheader>Isolation Valves:</ListSubheader>

      {shutOffBlockInfo.isolationValves.map((v: string, i: number) => {
        const valveAssetId = shutOffBlockInfo.isolationValvesAltIds[i][1];
        return (
          <ListItem
            button
            onMouseEnter={() => setIsolationValveHighlight(v)}
            onMouseOut={() => setIsolationValveHighlight(undefined)}
            key={v}
            className={classes.padding}
          >
            <ListItemText
              id="switch-list-label-wifi"
              primary={`V${valveAssetId}`}
            />
            <ListItemSecondaryAction>
              <Switch
                size="small"
                color="secondary"
                edge="end"
                onChange={handleInoperableValveChange}
                checked={inoperableValves[v]}
                name={v}
                inputProps={{ "aria-labelledby": "switch-list-label-wifi" }}
              />
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
      {shutOffBlockInfo.altSupplyValve.length > 0 && (
        <>
          <Divider />

          <ListSubheader>Alternative Supplies:</ListSubheader>
        </>
      )}
      {shutOffBlockInfo.altSupplyValve.map((v, i) => {
        const valveAssetId = shutOffBlockInfo.altSupplyValvesAltIds[i][1];
        const valveModelId = shutOffBlockInfo.altSupplyValvesAltIds[i][0];
        return (
          <ListItem
            button
            key={v.id}
            onMouseOver={() => setIsolationValveHighlight(v.id)}
            onMouseOut={() => setIsolationValveHighlight("0546z")}
            className={classes.padding}
          >
            <ListItemText
              id="switch-list-label-wifi"
              primary={`V${valveAssetId}`}
            />
            <ListItemSecondaryAction>
              <Switch
                size="small"
                color="secondary"
                edge="end"
                onChange={handleAltSupplyValvesChange}
                checked={altSupplyValves[v.id]}
                name={valveModelId}
                inputProps={{ "aria-labelledby": "switch-list-label-wifi" }}
              />
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
  );
}

export default ShutValves;
