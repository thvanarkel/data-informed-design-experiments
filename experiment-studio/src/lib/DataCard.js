import React from 'react';
import { Card } from 'antd';
import Graph from './Graph';

export default function DataCard(props) {


  return(
    <Card>
      <Graph data={props.data} index={props.index} width={props.width} height={200} />
      <p>{props.width}</p>
    </Card>
  );
}
