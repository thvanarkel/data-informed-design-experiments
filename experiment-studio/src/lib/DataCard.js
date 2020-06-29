import React from 'react';
import { Card, Dropdown, Menu, Spin } from 'antd';
import { LineChart, BlockChart } from './Chart';
import moment from 'moment';
import { DeleteOutlined, MoreOutlined, LoadingOutlined } from '@ant-design/icons';

// const closeIcon = <CloseOutlined style={{ fontSize: 12 }} />;

export default function DataCard(props) {

  const [config, setConfig] = React.useState({});
  const [measurement, setMeasurement] = React.useState();
  const [thing, setThing] = React.useState();

  React.useEffect(() => {
    var t = props.data[0].thing;
    setThing(t);
    var m = props.data[0]._measurement;
    setMeasurement(m);
    console.log(props.data);
    switch(m) {
      case "light-a":
        setConfig({
          color: "yellow",
          yAxis: false,
          gradient: {min: 0.1, max: 1.0},
          fixedHeight: true,
          discrete: false
        })
        break;
      case "sound":
        setConfig({
          color: "",
          yAxis: false,
          gradient: {min: 0.8, max: 1.0},
          fixedHeight: false,
          discrete: false
        })
        break;
      case "motion":
        setConfig({
          color: "peach",
          yAxis: true,
          gradient: {min: 1.0, max: 1.0},
          fixedHeight: false,
          discrete: true
        })
        break;
      default:
        setConfig({
          color: "",
          yAxis: false,
          gradient: {min: 1.0, max: 1.0},
          fixedHeight: false,
          discrete: false
        })
        break;
    }
  }, [props.data]);

  const getDate = () => {
    const d = moment(props.data[0]._start).format("ddd DD.MM.YYYY");
    return d;
  }

  const getWindow = () => {
    const w = props.data[0].window;
    const fn = props.data[0].fn;
    return w.length > 0 ? ` ${props.data[0].window}(${props.data[0].fn})` : "";
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
      <Menu.Item onClick={() => chartRef.current.export()}>Export</Menu.Item>
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
      <Card className={"data-card " + (config.color !== undefined ? config.color : "")}>
        <div className="card-header"><p>{getDate() + getWindow()}</p>{dropdown}</div>
        { !isNaN(props.width) &&
          <BlockChart ref={chartRef}
                      data={props.data}
                      window={getWindow()}
                      measurement={measurement}
                      thing={thing}
                      yAxis={config.yAxis}
                      range={props.range}
                      index={props.index}
                      width={props.width}
                      discrete={config.discrete}
                      height={100}
                      gradient={config.gradient}
                      fixedHeight={config.fixedHeight}
                   />
        }
      </Card>
    </Spin>
  );
}
