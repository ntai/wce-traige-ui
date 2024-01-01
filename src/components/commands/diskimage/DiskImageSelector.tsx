import React from 'react';
import { createStyles, makeStyles } from '@mui/styles';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import {ItemType, DiskImageType} from "../../common/types";
import { Theme } from '@mui/material/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(0),
      minWidth: 350,
    },
    selectEmpty: {
      marginTop: theme.spacing(0),
    },
  }),
);

// This is internally used.
// This exists so that you can feed this to menu items.
export type SourceType = ItemType & {
    // label: string;
    // value: string; // url - "http://horus:8312/wce/wce-disk-images/wce-20/wce-20-2021-10-10.ext4.partclone.gz"
    filesize: number;
    mtime: string; // timestamp
    restoreType: string; // "wce-20", etc.
    index: number;
}

export function ToDiskSources( diskImages: DiskImageType[], start?: number) : SourceType[] {
    const base = start ? start : 0;
    return diskImages.map( (src, index) => ({value: src.fullpath, label: src.name, filesize: src.size, mtime: src.mtime, restoreType: src.restoreType, index: index + base}));
}

// <DiskImageSelector setSource={this.setSource.bind(this)} sources={subsetSources} source={source} />

export default function DiskImageSelector( { restoreType, setSource, sources, source } : {
    restoreType?: string,
    setSource: (source?: SourceType) => void,
    sources: SourceType[],
    source?: SourceType
} ) {
  const classes = useStyles();

  const handleChange = (event: SelectChangeEvent) => {
      const value = event.target.value;
      setSource(sources.find( (src) => {return src.value === value;}));
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="source-select-label">Disk Image Source</InputLabel>
        <Select
          disabled={!restoreType}
          labelId="source-select-label"
          value={source?.value || ''}
          style={{fontSize: 13, textAlign: "left"}}
          children={sources.map( item => <MenuItem value={item.value} key={item.value}>{item.label}</MenuItem>)}
          onChange={handleChange}
          variant={"standard"} sx={{m: 1}}
        />
      </FormControl>

    </div>
  );
}