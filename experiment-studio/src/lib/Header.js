import React from 'react';
import querier from './utils/querier'
import { Button,
         Breadcrumb,
         Card,
         DatePicker,
         Divider,
         Form,
         Menu,
         Statistic,
         Spin,
         Badge,
         TimePicker,
         Row,
         Col } from 'antd';

import moment from 'moment';
import { LoadingOutlined } from '@ant-design/icons';

const TimeRangePicker = TimePicker.RangePicker;
const DateRangePicker = DatePicker.RangePicker;



const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const format = 'HH:mm';

// const dotenv = require('dotenv').config()
console.log(process.env.REACT_APP_URL);
querier.config(process.env.REACT_APP_URL, process.env.REACT_APP_TOKEN, process.env.REACT_APP_ORG);
const bucket = "session01"

const queryData = async (thing, start, stop, measurement, w, fn) => {
	let q = `from(bucket: "${bucket}") |> range(start: ${start}, stop: ${stop}) |> filter(fn: (r) => r["thing"] == "${thing}") |> filter(fn: (r) => r["_field"] == "value") |> filter(fn: (r) => r["_measurement"] == "${measurement}") |> aggregateWindow(every: ${w}, fn: ${fn})`;
	const data = await querier.query(q, {
		rowParser(row) {
			row._time = new Date(row._time);
			return row;
		}
	});
	return data;
}

export default function Header() {
  const [loading, setLoading] = React.useState(false);
  const [validated, setValidated] = React.useState(false);

  const [dateRange, setDateRange] = React.useState([null, null]);
  const [timeRange, setTimeRange] = React.useState([null, null]);

  const [thing, setThing] = React.useState(null);
  const [stream, setStream] = React.useState(null);

  const [uptime, setUptime] = React.useState(null);

  const fetch = async (e) => {
    setLoading(true);

    let [startRange, endRange] = dateRange;
    startRange = startRange.hour(0).minute(0).second(0)
    endRange = endRange.hour(23).minute(59).second(0)
    let [startTime, endTime] = timeRange;
    console.log(`Range: ${startRange}, ${endRange}`)
    // console.log(`${startTime}, ${endTime}`)
    startTime = moment(startTime)
    endTime = moment(endTime)
    let dStart = moment(startRange).hour(startTime.hour()).minute(startTime.minute())
    let dEnd = moment(startRange).hour(endTime.hour()).minute(endTime.minute())
    if (endTime.isBefore(startTime)) {
      dEnd.add(24, 'hours')
    }

    let total = 0;
    let off = 0;

    while (dStart.isBefore(endRange)) {
      console.log(`${dStart}, ${dEnd}`)
      const data = await queryData(thing, dStart.format(), dEnd.format(), stream, "30s", "max");

      let t = 0;
      let o = 0;
      let last = dStart.valueOf();

      for (var i of data) {
        const ti = i._time.getTime();
        const d = ti - last;
        // console.log(d);
        if (d > 40000) {
          o += d;
        }
        t += d;
        last = ti;
      }
      total += t;
      off += o;


      console.log(total)
      console.log(o);


      dStart.add(24, 'hours')
      dEnd.add(24, 'hours')
    }
    setLoading(false);
    setUptime(Math.round((100 - ((off/total) * 100)) * 10)/10)
  }

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
    </Menu>
  );

  return(
    <div>


    <Row gutter={16}>
      <Col span={20}>
        <Row gutter={16}>
          <Col span={24}>
          <Breadcrumb style={{ marginBottom: 10 }}>
            <Breadcrumb.Item>Participant 1</Breadcrumb.Item>
            <Breadcrumb.Item overlay={thingMenu}>{thing == null ? "thing" : thing}</Breadcrumb.Item>
            {thing != null &&
              <Breadcrumb.Item overlay={streamMenu}>{stream == null ? "stream" : stream}</Breadcrumb.Item>
            }
          </Breadcrumb>
          </Col>
          <Col span={24}>
            <Form layout="inline">
              <Form.Item label="Date range">
                <DateRangePicker onChange={(d) => setDateRange(d)} />
              </Form.Item>
              <Form.Item label="Segment of day">
                <TimeRangePicker format={format} order={false} onChange={(t) => setTimeRange(t)} />
              </Form.Item>
              <Form.Item>
                <Button disabled={!validated} onClick={fetch} loading={loading}>Fetch</Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Col>
      <Col span={2}>
        <Spin spinning={loading} indicator={loadingIcon}>
          <Statistic title="Uptime" value={uptime != null ? uptime : "-"} suffix="%" />
        </Spin>
      </Col>
    </Row>
    </div>
  )
}
