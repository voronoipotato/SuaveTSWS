import * as React from "react";
import * as ReactDom from "react-dom";
import * as Rx from "rxjs";
import {Hey} from "./components/ws";

const ws = new WebSocket("ws://localhost:8080/websocket")
var $messages = Rx.Observable.create(
  (obs :Rx.Observer<MessageEvent>) => {
  ws.onmessage = obs.next.bind(obs);
  ws.onerror = obs.error.bind(obs);
  ws.onclose = obs.complete.bind(obs);
 return ws.close.bind(ws);
}
);

interface WSMessage {data:string}
$messages.subscribe((a :WSMessage) => ReactDom.render(
  <Hey echo={a.data} />, 
  document.getElementById('container')
));

ws.onopen = function (ev) {
  ws.send("this is a test")
};
