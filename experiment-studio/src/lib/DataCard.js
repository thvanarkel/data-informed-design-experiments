import React from 'react';
import { Card, Dropdown, Menu, Spin } from 'antd';
import { BarChart, BlockChart } from './Chart';
import moment from 'moment';
import { DeleteOutlined, MoreOutlined, LoadingOutlined } from '@ant-design/icons';

// const closeIcon = <CloseOutlined style={{ fontSize: 12 }} />;

export default function DataCard(props) {

  const getDate = () => {
    const d = moment(props.data[0]._start).format("ddd DD.MM.YYYY");
    return d;
  }

  const menu = (
    <Menu style={{ transform: `translateY(-0px)` }}>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer" href="http://www.alipay.com/">
          1st menu item
        </a>
      </Menu.Item>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer" href="http://www.taobao.com/">
          2nd menu item
        </a>
      </Menu.Item>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer" href="http://www.tmall.com/">
          3rd menu item
        </a>
      </Menu.Item>
      <Menu.Item danger onClick={(e) => props.onRemove(props.index, e)}><DeleteOutlined />Remove card</Menu.Item>
    </Menu>
  );

  const dropdown = (
    <Dropdown overlay={menu}>
      <MoreOutlined style={{ fontSize: 20, transform: `translate(-15px, -10px) rotate(90deg)` }} />
    </Dropdown>
  );

  const loadIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return(
    <Spin indicator={loadIcon} spinning={false}>
      <Card className="data-card">
        <div className="card-header"><p>{getDate()}</p>{dropdown}</div>
        { !isNaN(props.width) &&
          <BlockChart data={props.data} yAxis={true} range={props.range} index={props.index} width={props.width} height={100} />
        }
      </Card>
    </Spin>
  );
}
