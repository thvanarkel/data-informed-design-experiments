import React from 'react';
import { Card, Dropdown, Menu, Spin } from 'antd';
import { AccelChart, LineChart, BlockChart } from './Chart';
import moment from 'moment';
import { DeleteOutlined, MoreOutlined, LoadingOutlined } from '@ant-design/icons';

import { LampChart } from './LampChart'
import { BotChart } from './BotChart'
import { OverviewChart } from './OverviewChart'

// const closeIcon = <CloseOutlined style={{ fontSize: 12 }} />;

export default function OverviewCard(props) {

  const exportCard = () => {
    chartRef.current.export();
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
      <Menu.Item onClick={exportCard}>Export</Menu.Item>
      <Menu.Item danger onClick={(e) => props.onRemove(props.index, e)}><DeleteOutlined />Remove card</Menu.Item>
    </Menu>
  );

  const dropdown = (
    <Dropdown overlay={menu}>
      <MoreOutlined style={{ fontSize: 20, transform: `translate(-15px, -10px) rotate(90deg)` }} />
    </Dropdown>
  );

  const loadIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  const chartRef = React.createRef();

  return(
    <Spin indicator={loadIcon} spinning={false}>
      <Card className={"data-card"}>
        <div className="card-header"><p>Overview</p>{dropdown}</div>
        { !isNaN(props.width) &&
          <OverviewChart ref={chartRef} width={props.width} height={props.height} />
        }
      </Card>
    </Spin>
  );
}
// { !isNaN(props.width) &&
// *<BlockChart ref={chartRef}
//             data={props.data}
//             measurement={measurement}
//             thing={thing}
//             yAxis={config.yAxis}
//             range={props.range}
//             index={props.index}
//             width={props.width}
//             discrete={config.discrete}
//             height={config.height !== undefined ? config.height : 75}
//             gradient={config.gradient}
//             fixedHeight={config.fixedHeight}
//          />
//  }
