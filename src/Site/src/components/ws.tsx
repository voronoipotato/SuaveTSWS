import * as React from "react";
export interface HeyProps { echo: string }
export const Hey = (props :HeyProps) => <h1> {props.echo}</h1>;