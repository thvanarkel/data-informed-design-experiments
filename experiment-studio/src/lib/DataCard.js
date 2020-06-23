import React from 'react';
import { Card } from 'antd';
import Graph from './Graph';
import moment from 'moment';
import { CloseOutlined } from '@ant-design/icons';

const closeIcon = <CloseOutlined style={{ fontSize: 12 }} />;

export default function DataCard(props) {

  const getDate = () => {
    const d = moment(props.data[0]._start).format("ddd DD.MM.YYYY");
    return d;
  }

  return(
    <Card className="data-card">
      <div className="card-header"><p>{getDate()}</p><CloseOutlined onClick={() => props.onRemove(props.index)} style={{ fontSize: 14 }} /></div>
      <Graph data={props.data} index={props.index} width={props.width} height={200} />
    </Card>
  );
}
