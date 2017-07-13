import * as React from "react";
import * as ReactDom from "react-dom";
import * as Rx from "rxjs";
import {Hey} from "./components/ws";

const ws = new WebSocket("ws://localhost:8080/websocket")
//javascript string interpolation

var getTime = (d :Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDay()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}` 
var $timer = Rx.Observable.interval(50).map(x => new Date().getTime());
var $click = Rx.Observable.fromEvent(document.getElementById('container'), 'click')
  .map(x => new Date().getTime());
//This is how we turn our websocket connection into an observable
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
ReactDom.render(
<Hey echo="Click me" />,
document.getElementById('container')
)
//When the websocket is available send messages every 50ms
ws.onopen = function (ev) {
  $click.subscribe(ws.send.bind(ws));
};
