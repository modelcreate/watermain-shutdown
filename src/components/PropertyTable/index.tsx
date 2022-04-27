import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles({
  tableCell: {
    //minWidth: 650,
    color: "#000",
    borderBottom: "1px solid rgb(232 232 232)",
  },
  tableContainer: {
    background: "#fff",
    color: "#000",
  },
});

interface PropertyTableProps {
  data: {
    [name: string]: any;
  };
}

function isNumber(n: any) {
  return !isNaN(parseFloat(n)) && !isNaN(n - 0);
}

export default function PropertyTable({ data }: PropertyTableProps) {
  const classes = useStyles();

  return (
    <TableContainer component={Paper} className={classes.tableContainer}>
      <Table size="small">
        <TableBody>
          {Object.entries(data).map(([key, values]) => (
            <TableRow key={key}>
              <TableCell
                component="th"
                scope="row"
                className={classes.tableCell}
              >
                {key}
              </TableCell>
              <TableCell align="right" className={classes.tableCell}>
                {isNumber(values) ? Math.round(values * 100) / 100 : values}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
