import React from 'react';
import { Card } from 'antd';
import Graph from './Graph';
import moment from 'moment';

export default function DataCard(props) {

  const getDate = () => {
    const d = moment(props.data[0]._start).format("ddd DD.MM.YYYY");
    return d;
  }

  return(
    <Card className="data-card">
      <p>{getDate()}</p>
      <Graph data={props.data} index={props.index} width={props.width} height={200} />
    </Card>
  );
}
