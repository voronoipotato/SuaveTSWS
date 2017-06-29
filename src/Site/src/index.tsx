import * as React from "react";
import * as ReactDom from "react-dom";

import {Hey} from "./components/ws";

ReactDom.render(
  <Hey echo="test"/>, 
  document.getElementById('container')
);