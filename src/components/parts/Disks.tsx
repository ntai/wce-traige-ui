import React from "react";
import {sweetHome} from '../../looseend/home';
import "../commands/commands.css";
import Mui5Table from "./Mui5Table";
import OperationProgressBar from './OperationProgressBar';
import DiskDetails from "./DiskDetails";
import {DeviceSelectionType, DiskType, ItemType, RunReportType, WipeType} from "../common/types";
import UsbIcon from '@mui/icons-material/Usb';

type DisksPropsType = {
  diskSelectionChanged: (selected: DeviceSelectionType<DiskType>, clicked?: DiskType) => void;
  running: boolean;
  resetting: boolean;
  did_reset: () => void;
  selected: DeviceSelectionType<DiskType>;
  runningStatus?: RunReportType;
};

type DisksStateType = {
  /* Raw disks */
  disks: DiskType[];
  /* Disk table - page 1 always */
  diskPages: number;
  /* Fetching list of disks */
  diskStatusLoading: boolean;

  /* disk loading update sequence number */
  sequenceNumber?: number;

  /* Mounted disks */
  mounted: DeviceSelectionType<boolean>;

  /* Wipe options */
  wipeOptions: ItemType[];
  wipeOptionsLoading: boolean;
};


export default class Disks extends React.Component<DisksPropsType, DisksStateType> {
  constructor(props: any) {
    super(props);
    this.state = {
      /* Raw disks */
      disks: [],
      /* Disk table - page 1 always */
      diskPages: 1,

      /* Fetching list of disks */
      diskStatusLoading: true,

      /* disk loading update sequence number */
      sequenceNumber: undefined,

      /* Mounted disks */
      mounted: {},

      /* Wipe options */
      wipeOptions: [],
      wipeOptionsLoading: true,
    };

    this.fetchDisks = this.fetchDisks.bind(this);
  }


  fetchDisks() {
    // Whenever the table model changes, or the user sorts or changes pages, this method gets called and passed the current table model.
    // You can set the `loading` prop of the table to true to use the built-in one or show you're own loading bar if you want.
    this.setState({diskStatusLoading: true});
    // Request the data however you want.  Here, we'll use our mocked service we created earlier

    fetch(sweetHome.backendUrl + "/dispatch/disks.json")
        .then( reply => reply.json())
        .then(res => {
          // Now just get the rows of disks to your React Table (and update anything else like total pages or loading)
          let mounted: DeviceSelectionType<boolean> = {};
          let selected: DeviceSelectionType<DiskType> = {};
          let disk: DiskType;
          for (disk of res.disks) {
            mounted[disk.deviceName] = disk.mounted;
          }
          this.setState({
            disks: res.disks,
            mounted: mounted
          });
          this.props.diskSelectionChanged(selected);
        })
        .finally(() => {this.setState({diskStatusLoading: false})});
  }

  fetchWipeOptions() {
    this.setState({wipeOptionsLoading: true});
    // Request the data however you want.  Here, we'll use our mocked service we created earlier

    fetch(sweetHome.backendUrl + "/dispatch/wipe-types.json")
      .then(reply => reply.json())
      .then(res => {
        const wipeOptions = res.wipeTypes.map((rt: WipeType) => ({label: rt.name, value: rt.id}));
        this.setState({wipeOptions: wipeOptions, wipeOptionsLoading: false});
      });
  }


  componentDidMount() {
    this.fetchWipeOptions();
    this.fetchDisks();
  }

  onReset() {
    this.setState(  {
      /* Raw disks */
      disks: [],
      /* Fetching list of disks */
      diskStatusLoading: true,

      /* Mounted disks */
      mounted: {},

      /* available wipeOptions */
      wipeOptions: [],

    });
    this.fetchDisks();
    this.props.did_reset();
  }

  componentDidUpdate() {
    let disk : DiskType;
    let disks: DiskType[] = JSON.parse(JSON.stringify(this.state.disks));
    let target_update = false;

    if (this.props.resetting)
      this.onReset();

    for (disk of disks) {
      const is_target = this.props.selected[disk.deviceName] ? 1 : 0;
      if (disk['target'] !== is_target) {
        target_update = true;
        break;
      }
    }

    if (target_update) {
      for (disk of disks) {
        const is_target = this.props.selected[disk.deviceName] ? 1 : 0;
        disk['target'] = is_target;
      }
      this.setState({disks: disks});
    }
    else {
      if (this.props.runningStatus === undefined) {
        return;
      }

      if (this.state.sequenceNumber === this.props.runningStatus._sequence_)
        return;

      this.setState({sequenceNumber: this.props.runningStatus._sequence_});

      if (this.props.runningStatus.device && this.props.runningStatus.runEstimate && this.props.runningStatus.runTime) {
        const devname = this.props.runningStatus.device;
        const runTime = this.props.runningStatus.runTime;
        const runEstimate = this.props.runningStatus.runEstimate;
        const runMessage = this.props.runningStatus.runMessage;
        for (disk of disks) {
          if (disk.deviceName === devname) {
            // Little trick to show "some" progress if run time is smol and run estimate is big.
            // cuz, after rounded, it can be zero and no visible bar on the screen and that's annoying.
            if (this.props.runningStatus.runStatus === "Preflight")
              disk.progress = 0;
            if (this.props.runningStatus.runStatus === "Running")
              disk.progress = Math.max(runTime > 0 ? 1 : 0, Math.min(99, Math.round(runTime / runEstimate * 100)));
            if (this.props.runningStatus.runStatus === "Success")
              disk.progress = 100;
            if (this.props.runningStatus.runStatus === "Failed")
              disk.progress = 999;

            disk.runEstimate = runEstimate;
            disk.runTime = runTime;
            disk.runMessage = runMessage;
            break;
          }
        }
      }
      this.setState({disks: disks});
    }
  }

  setNewSelection(disks: DiskType[], clicked?: DiskType) {
    const selection: DeviceSelectionType<DiskType> = {};

    for (let disk of disks) {
      selection[disk.deviceName] = disk;
    }
    this.props.diskSelectionChanged(selection, clicked);
  }

  requestUnmountDisk(deviceName: string, mountState: boolean) {
    // Request the data however you want.  Here, we'll use our mocked service we created earlier
    fetch(sweetHome.backendUrl + "/dispatch/unmount?deviceName=" + deviceName + "&mount=" + mountState,
      { method: "POST" })
      .then( reply => {
        this.onReset();
      });
  }

  render() {
    const { disks, diskStatusLoading } = this.state;

    return (
      <React.Fragment>
        <Mui5Table<DiskType>
          style={ {marginTop: 1, marginBottom: 1, marginLeft: 0, marginRight: 0} }
          onSelectionChange={this.setNewSelection.bind(this)}
          columns={[
            {
              title: "Disk",
              render: (row, index) => row.deviceName,
              cellStyle: {
                backgroundColor: '#eeeeee',
                width: 120,
                maxWidth: 120,
                paddingTop: 2, paddingBottom: 2, 
              },
              headerStyle: {
                backgroundColor: '#eeeeee',
              }
            },
            {
              title: "Mounted",
              render: (row, index) => (<input
                      type="checkbox"
                      className="checkbox"
                      checked={this.state.mounted[row.deviceName] === true ? true : false}
                      onChange={() => this.requestUnmountDisk(row.deviceName, this.state.mounted[row.deviceName])}
                  />),
              cellStyle: { width: 30, maxWidth: 30, paddingTop: 2, paddingBottom: 2,},
              headerStyle: {maxWidth: 75,},
            },
            {
              title: "Bus",
              render: (row, index) => row.bus === "usb" ? (<UsbIcon>USB</UsbIcon>) : "ATA",
              cellStyle: { width: 40, maxWidth: 40,  paddingTop: 2, paddingBottom: 2,  },
              headerStyle: { maxWidth: 40, },
            },
            {
              title: "Model",
              render: (row, index) => row.model,
              cellStyle: { width: 300, maxWidth: 300, paddingTop: 2, paddingBottom: 2,  },
              headerStyle: {width: 300,},
            },
            {
              title: "Estimate",
              render: (row, index) => `${row.runEstimate}`,
              cellStyle: { width: 80, textAlign: 'center', maxWidth: 80,
                paddingTop: 2, paddingBottom: 2,  },
              headerStyle: {
                maxWidth: 80,
              },
            },
            {
              title: "Elapsed",
              render: (row, index) => `${row.runTime}`,
              cellStyle: { width: 80, textAlign: 'center', maxWidth: 80,
                paddingTop: 2, paddingBottom: 2,   },
              headerStyle: {
                maxWidth: 80,
              },
            },
            {
              title: "Status",
              render: (row, index) => row.runMessage,
              cellStyle: { minWidth: 200, paddingTop: 2, paddingBottom: 2,  },
              headerStyle: {
                minWidth: 200,
              },
            },
            {
              title: 'Progress',
              cellStyle: { minWidth: 120,
                paddingTop: 2, paddingBottom: 2,  },
              headerStyle: {minWidth: 120, maxWidth: 200},
              render: (row, index) => (<OperationProgressBar value={row.progress} />)
            }
            ] }
          rows={disks}
          isLoading={diskStatusLoading} // Display the loading overlay when we need it
          options={{
            selection: true,
            selectionProps: (rowData, index) => ({disabled: rowData.mounted, checked: rowData.target ? true : false }),
            rowStyle: (rowData, index) => ({backgroundColor: rowData.target ? '#37b15933' : '', paddingTop: 2, paddingBottom: 2,}),
            paging: false,
            draggable: false,
            toolbar: false,
            search: false,
            showTitle: false,
            detailPanelColumnAlignment: "left"
          }}
          detailPanel={[
            {
              render: (row, index) => (<DiskDetails disk={row} />)
            }
          ]}
        />
      </React.Fragment>
    );
  }
}

