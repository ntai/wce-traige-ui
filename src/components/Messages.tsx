import React, { Component } from 'react';
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import {sweetHome} from '../looseend/home'
import {io} from 'socket.io-client';

type MessagesStateType = {
  messages: string[];
  start: number,
  count: number
}

export default class Messages extends Component<any, MessagesStateType> {
  constructor(props:any) {
    super(props);
    this.state = {
      start: 0,
      count: 100,
      messages: []
    }
  }

  /* Initial message loading */
  fetchMessages() {
    // Request the data however you want.
    fetch(sweetHome.backendUrl + `/dispatch/messages?start=0&count=${this.state.count}`).then( rep => rep.json()).then(res => {
      this.setState({messages: res.messages});
    });
  }

  /* set up the wock for message */
  componentDidMount() {
    const wock = io(sweetHome.websocketUrl);
    wock.on('message', this.handleMessage.bind(this));
    this.fetchMessages();
  }

  handleMessage(msg: any) {
    const messages = this.state.messages.concat(msg.message);
    console.log("got message." + messages);
    this.setState({messages: messages});
  }

  render() {
    const messages = this.state.messages;

    return (
      <Grid style={{ display: "flex", flex: 1 }} container >
        <Grid style={{ display: "flex", flex: 1 }} item xs={12} sx={{boxShadow: "2"}}>
          <Box  overflow="auto" id="scroll" flex={1} bgcolor="white" height="300px" className="message-font" >
            {messages.map(line => {return (<div>{line}</div>)})}
          </Box>
        </Grid>
      </Grid>
    );
  }
}
