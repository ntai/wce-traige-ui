import * as React from 'react';
import Commands from './components/Commands';
import './App.css';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import {sweetHome} from "./looseend/home";
import CssBaseline from '@mui/material/CssBaseline';
import wcelogo from './wcelogo.svg';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {blue, green, grey, red} from "@mui/material/colors";

/*
const styles = StyleSheet.create({
  WCE: {
    fontWeight: 'bold',
    fontSize: 30,
  },
  Version: {
    align: "right",
    marginTop: 30,
    marginLeft: 40,
    verticalAlign: "bottom",
    fontSize: 14,
    color: "grey",
  },
  Logo: {width: 500, height: 80, resizeMode: "contain", scale: 1},

  WholeView: {
    marginTop: 0,
    marginLeft: 10,
  },

});
 */

type AppState = {
    frontendVersion: string;
    backendVersion: string;
};

const muiTheme = createTheme({
    palette: {
        secondary: red,
    },
    components: {
        MuiSelect: {
            styleOverrides: {
                select: { paddingTop: "6px", paddingBottom: "6px"},
            }
        }
    },
});


export default function App()
{
    const [state, setState] = React.useState<AppState>(
        { frontendVersion: "",
            backendVersion: ""});

    React.useEffect( ()  => {
        fetch(sweetHome.backendUrl + "/version")
            .then(res => {
                if (res.ok)
                    return res.json();
                if (res.status === 404) {
                    setState({
                        backendVersion: "Backend version is too old",
                        frontendVersion: "Uknown"
                    })
                }
            })
            .then(result => {
                console.log(result);
                setState({
                    backendVersion: result.version.backend,
                    frontendVersion: result.version.frontend
                })
            })
            .catch((reason) => {
                console.log("/version: " + reason);
                setState({
                    backendVersion: "Network Error - is the backend running on 10600?",
                    frontendVersion: "?"
                })
            });
    }, []);

    return (
        <div className="App bg-white">
            <CssBaseline/>
            <ThemeProvider theme={muiTheme}>
                <Container maxWidth={false}>
                    <Grid container item xs={12}>
                        <Grid container item xs={6}>
                            <img src={wcelogo} className="App-logo" alt="wcelogo"/>
                        </Grid>
                        <Grid item>
                            <Typography>WCE Triage {state.frontendVersion}/{state.backendVersion}</Typography>
                        </Grid>
                    </Grid>

                    <Grid item xs={12}>
                        <Commands/>
                    </Grid>
                </Container>
            </ThemeProvider>
        </div>
    );
}
