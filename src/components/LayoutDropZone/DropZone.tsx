import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Drawer from "@material-ui/core/Drawer";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardMedia from "@material-ui/core/CardMedia";
import SnackbarContent from "@material-ui/core/SnackbarContent";

import { useDropzone } from "react-dropzone";

import JSZIP from "jszip";

import useModel from "../../hooks/useModel";
import useData from "../../hooks/useData";

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
    backgroundColor: "#ffffff",
  },

  header: {
    padding: "12px 24px",
    flexBasis: "unset",
  },
  burstPanelContainer: {
    height: "100vh",
    flexWrap: "unset",
  },
  ctaButton: {
    color: "#e91e63",
  },

  dropzone: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    borderWidth: "2px",
    borderRadius: "2px",
    borderColor: "#eeeeee",
    borderStyle: "dashed",
    backgroundColor: "#f5f5f5",
    color: "#5d5d5d",
    outline: "none",
    transition: "border .24s ease-in-out",
    minHeight: "200px",
    fontSize: "20px",
    fontFamily: "'Montserrat','Roboto', 'Helvetica', 'Arial', sans-serif",
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "-0.24px",
    marginBottom: "20px",
    marginTop: "20px",
  },

  snackBar: {
    backgroundColor: "rgb(50, 50, 50)",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: 400,
  },

  dropContainer: {
    padding: "30px",
  },

  debugInfo: {
    position: "absolute",
    margin: "15px",
    zIndex: 2,
    width: "340px",
    background: "#fff",
    borderRadius: "0px",
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
  media: {
    height: 140,
  },
}));

function DropZone() {
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
        <Basic />
      </Container>
    </React.Fragment>
  );
}

function BurstPanel() {
  const classes = useStyles();

  return (
    <Container
      className={classes.burstPanelContainer}
      maxWidth={false}
      disableGutters
    >
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
            Load a model to start using the app
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
}

interface FileNameLookup {
  [name: string]: string;
}

const action = (
  <Button className="ctaButton" size="small">
    Find out more
  </Button>
);

function Basic() {
  const { loadModelData } = useData()!;

  const [isDemoLoading, setIsDemoLoading] = React.useState(false);

  const handleLoadDemo = () => {
    setIsDemoLoading(true);
    fetch("./demo/demoModel.zip")
      .then((result) => result.blob())
      .then((result) => {
        const fileNameLookup: FileNameLookup = {
          "buildings.json": "buildings",
          "custLookup.json": "custLookup",
          "dma.json": "dma",
          "model.json": "modelJSON",
          "model.inp": "modelinp",
        };

        const jsZip = new JSZIP();
        jsZip.loadAsync(result).then(function (zip) {
          Object.keys(zip.files).forEach(function (filename) {
            zip.files[filename].async("string").then(function (fileData) {
              const type = fileNameLookup[filename];
              //@ts-ignore
              loadModelData(fileData, type);
            });
          });
        });
      });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (files) => {
      const fileNameLookup: FileNameLookup = {
        "buildings.json": "buildings",
        "custLookup.json": "custLookup",
        "dma.json": "dma",
        "model.json": "modelJSON",
        "model.inp": "modelinp",
      };

      const jsZip = new JSZIP();
      jsZip.loadAsync(files[0]).then(function (zip) {
        Object.keys(zip.files).forEach(function (filename) {
          zip.files[filename].async("string").then(function (fileData) {
            const type = fileNameLookup[filename];
            //@ts-ignore
            loadModelData(fileData, type);
          });
        });
      });

      //setModelLoaded(true)
    },
  });
  const classes = useStyles();

  return (
    <section className={classes.dropContainer}>
      <SnackbarContent
        className={classes.snackBar}
        message="I'm working on something new... Qatium - an open and collaborative water management platform."
        action={
          <Button
            className={classes.ctaButton}
            color="primary"
            size="small"
            target="_blank"
            href="https://qatium.com"
          >
            Find out more
          </Button>
        }
      />
      <div className={classes.dropzone} {...getRootProps()}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop zip to load model, or click to select file</p>
      </div>

      <Grid container>
        <Grid item xs={6}>
          <Card>
            <CardActionArea onClick={handleLoadDemo}>
              <CardMedia
                className={classes.media}
                image="/img/demoScreenshot.png"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  Demo Model
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  Click on this card to load a demo model into the Watermain
                  shutdown app
                </Typography>
                {isDemoLoading ? <CircularProgress /> : undefined}
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </section>
  );
}

export default DropZone;
