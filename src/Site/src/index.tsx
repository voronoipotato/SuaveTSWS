import * as React from "react";
import * as ReactDom from "react-dom";
import * as Rx from "rxjs";
import {Hey} from "./components/ws";

const ws = new WebSocket("ws://localhost:8080/websocket")
const container = document.getElementById('container')

var $click = Rx.Observable.fromEvent(container, 'click')
  .map(x => new Date().getTime());

const create$fromWebSocket = (ws :WebSocket) => 
  Rx.Observable.create(
    (obs :Rx.Observer<MessageEvent>) => {
    ws.onmessage = obs.next.bind(obs);
    ws.onerror = obs.error.bind(obs);
    ws.onclose = obs.complete.bind(obs);
    return ws.close.bind(ws);
    }
  );

interface WSMessage {data:string}

var $messages = create$fromWebSocket(ws).startWith({data:"Click Me"});
$messages.subscribe((a :WSMessage) => ReactDom.render(
  <Hey echo={a.data} />, 
  container
));

//When the websocket is available send messages
ws.onopen = function (ev) {
  $click.subscribe(ws.send.bind(ws));
};
