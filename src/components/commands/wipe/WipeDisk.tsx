import React from "react";
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
//
import {sweetHome} from '../../../looseend/home';
import Disks from "../../parts/Disks";
import "../commands.css";
import {io} from "socket.io-client";
import DeleteIcon from '@material-ui/icons/Delete';
import RefreshIcon from "@material-ui/icons/Refresh";
import CancelIcon from "@material-ui/icons/Cancel";
import ErrorMessageModal from "../../ErrorMessageDialog";
import {DeviceSelectionType, DiskType, RunReportType} from "../../common/types";

type WipeDiskStateType = {
  /* target disks */
  targetDisks: DeviceSelectionType<DiskType>;
  diskWiping: boolean;
  runningStatus?: RunReportType;

  /* Error message modal dialog */
  modaling: boolean;
  errorMessage: string;
  errorTitle: string;
  resetting : boolean;
};


export default class WipeDisk extends React.Component<any, WipeDiskStateType> {
  constructor(props:any) {
    super(props);
    this.state = {
      /* target disks */
      targetDisks: {},
      diskWiping: false,

      /* Error message modal dialog */
      modaling: false,
      errorMessage: "",
      errorTitle: "",

      resetting : false
    };

    this.diskSelectionChanged = this.diskSelectionChanged.bind(this);
    this.did_reset = this.did_reset.bind(this);
  }

  componentDidMount() {
    const loadWock = io(sweetHome.websocketUrl);
    loadWock.on("zerowipe", this.onRunnerUpdate.bind(this));
  }

  onRunnerUpdate(update: RunReportType) {
    this.setState({runningStatus: update, diskWiping: update.device !== ''});
  }

  diskSelectionChanged(selectedDisks: DeviceSelectionType<DiskType>, clicked?: DiskType) {
    if (!clicked)
      return;

    if (this.state.targetDisks[clicked.deviceName]) {
      let targetDisks = Object.assign( {}, this.state.targetDisks);
      delete targetDisks[clicked.deviceName];
      this.setState({targetDisks});
    }
    else {
      if (!clicked.mounted) {
        let targetDisks = Object.assign({}, this.state.targetDisks);
        targetDisks[clicked.deviceName] = clicked;
        this.setState({targetDisks});
      }
    }
  }

  did_reset() {
    this.setState( {resetting: false});
  }

  onReset() {
    this.setState( {resetting: true});
  }


  getWipeUrl() {
    const targetDisks = Object.keys(this.state.targetDisks).filter( devName => this.state.targetDisks[devName]);

    if (targetDisks.length === 0) {
      return undefined;
    }

    if (targetDisks.length > 1) {
      let url = sweetHome.backendUrl + "/dispatch/wipe?deviceNames=";
      let sep = "";
      let targetDisk;
      for (targetDisk of targetDisks) {
        url = url + sep + targetDisk;
        sep = ",";
      }
      return url;
    }
    else {
      const targetDisk = targetDisks[0];
      return sweetHome.backendUrl + "/dispatch/wipe?deviceName=" + targetDisk;
    }
  }

  
  onWipe() {
    const wipeUrl = this.getWipeUrl();

    if (wipeUrl === undefined) {
      ErrorMessageModal("Please select...", "No disk, source or restore type targetDisks.");
      return;
    }

    console.log(wipeUrl);
    fetch(wipeUrl, {"method":"POST"}).then(_ => {
      // Now just get the rows of disks to your React Table (and update anything else like total pages or loading)
      this.setState({diskWiping: true});
    });
  }


  onAbort() {
    fetch(sweetHome.backendUrl + "/dispatch/stop-wipe", {"method":"POST"}).then(_ => {
      this.setState({
        diskWiping: false,
      });
    });
  }


  render() {
    const { resetting, diskWiping, targetDisks, runningStatus } = this.state;
    const wipeUrl = this.getWipeUrl();

    return (
      <div>
        <Grid container>
          <Grid item xs={2}>
              <Button variant="contained" color="secondary" onClick={() => this.onWipe()} disabled={wipeUrl === undefined} startIcon={<DeleteIcon />}>Wipe</Button>
          </Grid>
          <Grid item xs={2}>
            <Button startIcon={<CancelIcon />} variant="contained" color="secondary" onClick={() => this.onAbort()} disabled={!diskWiping}>Abort</Button>
          </Grid>
          <Grid item xs={2}>
              <Button startIcon={<RefreshIcon />} variant="contained" color="primary" onClick={() => this.onReset()}>Reset</Button>
          </Grid>
          <Grid item xs={12}>
            <Disks runningStatus={runningStatus} selected={targetDisks} resetting={resetting} did_reset={this.did_reset} diskSelectionChanged={this.diskSelectionChanged} running={diskWiping}/>
          </Grid>
	    </Grid>
      </div>
    );
  }
}

