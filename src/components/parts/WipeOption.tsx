import React from "react";
import {sweetHome} from '../../looseend/home';
import "../commands/commands.css";
import { createStyles, makeStyles } from '@mui/styles';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {ItemType} from "../common/types";

const useStyles = makeStyles((theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(0),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(0),
    },
  }),
);




//  title={"Wipe"} wipeOption={wipeOption} wipeOptionChanged={this.selectWipe.bind(this)} wipeOptionsChanged={this.setWipeOptions.bind(this)}
// <WipeOption title={"Wipe"} wipeOption={wipeOption} wipeOptionChanged={this.selectWipe.bind(this)} wipeOptionsChanged={this.setWipeOptions.bind(this)}/>

export default function WipeOption({title, wipeOption, wipeOptionChanged, wipeOptionsChanged} : {
  title: string,
  wipeOption: ItemType|undefined,
  wipeOptionChanged: (item: ItemType|undefined) => void,
  wipeOptionsChanged: (items: ItemType[]) => void
}) {
  const classes = useStyles();
  const [wipeOptionsLoading, setWipeOptionsLoading] = React.useState(true);
  const [wipeOptions, setWipeOptions] = React.useState<ItemType[]>([]);


  function fetchWipeOptions() {
    setWipeOptionsLoading(true);

    fetch(sweetHome.backendUrl + "/dispatch/wipe-types.json").then(rep => rep.json()).then(res => {
      console.log(res.wipeTypes);
      const wipeTypes : {name: string, id: string}[] = res.wipeTypes as any;
      const wipeOptions = wipeTypes.map(rt => ({label: rt.name, value: rt.id}));
      setWipeOptions(wipeOptions);
      wipeOptionChanged(undefined);
      wipeOptionsChanged(wipeOptions);
    }).finally( () => {
      setWipeOptionsLoading(false);
    });
  }

  React.useEffect(() => {
    console.log("loading wipe options");
    fetchWipeOptions();
  }, []);

  const handleChange = (event: React.ChangeEvent<{ value: any }>) => {
    if (!event) return;
    if (!event.target) return;
    // setWipeOption(event.target.value);
    if (wipeOptionChanged) wipeOptionChanged(event.target.value);
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="wipe-option-select-label">{title}</InputLabel>
        <Select
          labelId="wipe-option-select-label"
          // handing down undefined doesn't change the selection. Dummy value '' sets it.
          value={wipeOption?.value||"nowipe"}
          style={{fontSize: 12, textAlign: "left"}}
          children={wipeOptions.map( item => <MenuItem value={item.value}>{item.label}</MenuItem>)}
          onChange={handleChange}
        />
      </FormControl>

    </div>
  );
}
