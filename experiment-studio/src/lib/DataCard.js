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

  const color = () => {
    switch(props.index) {
      case 0:
        return " purple";
        break;
      case 1:
        return " blue";
        break;
      case 2:
        return " green";
        break;
      case 3:
        return " yellow";
        break;
      case 4:
        return " red";
        break;
      case 5:
        return " magenta";
        break;
      case 6:
        return " peach";
        break;
      case 7:
        return " mauve";
        break;
      default:
        return "";
        break;
    }
  };

  return(
    <Card className={"data-card" + color()}>
      <div className="card-header"><p>{getDate()}</p><CloseOutlined onClick={() => props.onRemove(props.index)} style={{ fontSize: 14 }} /></div>
      <Graph data={props.data} index={props.index} width={props.width} height={100} />
    </Card>
  );
}
