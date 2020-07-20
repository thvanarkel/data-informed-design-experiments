import React from 'react';

import { Button,
         Breadcrumb,
         Card,
         DatePicker,
         Divider,
         Form,
         Input,
         Menu,
         Statistic,
         Spin,
         Badge,
         TimePicker,
         Row,
         Col } from 'antd';

import moment from 'moment';
import { LoadingOutlined } from '@ant-design/icons';
import { useStateWithLocalStorage, useLocallyPersistedReducer } from './utils/persistenceHelpers'


const TimeRangePicker = TimePicker.RangePicker;
const DateRangePicker = DatePicker.RangePicker;



const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const format = 'HH:mm';

// const dotenv = require('dotenv').config()
console.log(process.env.REACT_APP_URL);




export default function Header(props) {
  const [loading, setLoading] = React.useState(props.loading);
  const [validated, setValidated] = React.useState(false);

  const [dateRange, setDateRange] = React.useState([null, null]);
  const [timeRange, setTimeRange] = React.useState([null, null]);

  const [thing, setThing] = useStateWithLocalStorage('thing');
  const [stream, setStream] = useStateWithLocalStorage('stream');
  const [window, setWindow] = React.useState('');
  const [fn, setFn] = React.useState('');

  const [uptime, setUptime] = React.useState(null);

  React.useEffect(() => {
    if (dateRange.filter(d => d == null).length <= 0 && timeRange.filter(t => t == null).length <= 0 && thing != null) {
      setValidated(true);
    }
  })

  const thingMenu = (
    <Menu onClick={(i) => setThing(i.key)}>
      <Menu.Item key="bed">bed</Menu.Item>
      <Menu.Item key="mirror">mirror</Menu.Item>
      <Menu.Item key="sofa">sofa</Menu.Item>
      <Menu.Item key="bath">bath</Menu.Item>
      <Menu.Item key="remote">remote</Menu.Item>
      <Menu.Item key="yogamat">yogamat</Menu.Item>
      <Menu.Item key="lamp">lamp</Menu.Item>
      <Menu.Item key="chatbot">chatbot</Menu.Item>
    </Menu>
  );

  const streamMenu = (
    <Menu onClick={(i) => {console.log(i); setStream(i.key)}}>
      <Menu.Item key="sound">sound</Menu.Item>
      <Menu.Item key="light-a">light-a</Menu.Item>
      <Menu.Item key="light">light</Menu.Item>
      <Menu.Item key="motion">motion</Menu.Item>
      <Menu.Item key="distance">distance</Menu.Item>
      <Menu.Item key="temperature">temperature</Menu.Item>
      <Menu.Item key="acceleration">acceleration</Menu.Item>
      <Menu.Item key="all">all</Menu.Item>
    </Menu>
  );

  return(
    <div>
    <Row gutter={16}>
      <Col span={20}>
        <Row gutter={16}>
          <Col span={24}>
          <Breadcrumb style={{ marginBottom: 10 }}>
            <Breadcrumb.Item>Participant {props.session}</Breadcrumb.Item>
            <Breadcrumb.Item overlay={thingMenu}>{thing == null ? "thing" : thing}</Breadcrumb.Item>
            {thing != null &&
              <Breadcrumb.Item overlay={streamMenu}>{stream == null ? "stream" : stream}</Breadcrumb.Item>
            }
          </Breadcrumb>
          </Col>
          <Col span={26}>
            <Form layout="inline" style={{}}>
              <Form.Item label="Date range">
                <DateRangePicker onChange={(d) => setDateRange(d)} />
              </Form.Item>
              <Form.Item label="Segment of day">
                <TimeRangePicker format={format} order={false} onChange={(t) => setTimeRange(t)} />
              </Form.Item>
              <Form.Item style={{marginTop:"0px"}}>
                <Button disabled={!validated} onClick={() => props.fetch(thing, stream, window, fn, dateRange, timeRange)} loading={props.loading}>Fetch</Button>
              </Form.Item>
              <Form.Item  label="Window" style={{marginTop:"10px"}}>

              <Input.Group compact style={{marginLeft:"19px"}}>
                <Input style={{ width: '25%' }} placeholder="window" onChange={(v) => setWindow(v.target.value)} />
                <Input style={{ width: '30%' }} placeholder="function" onChange={(v) => setFn(v.target.value)} />
              </Input.Group>
              </Form.Item>

            </Form>
          </Col>
        </Row>
      </Col>
      <Col span={4}>
        <Spin spinning={props.loading} indicator={loadingIcon}>
          <Statistic title="Uptime" value={props.uptime != null ? props.uptime : "-"} suffix="%" />
        </Spin>
      </Col>
    </Row>
    <Divider />
    </div>
  )
}
