import React from 'react';
import Header from './Header'
import {
	Divider
} from 'antd'
import dataProcessor from './utils/dataProcessor'

export default function DataView() {
	const [loading, setLoading] = React.useState(false);
	const [uptime, setUptime] = React.useState();
	const [data, setData] = React.useState([]);

	const [thing, setThing] = React.useState(null);
	const [stream, setStream] = React.useState(null);

	const processData = (d) => {
		setData(data => [ ...data, [d] ]);
	};

  const fetch = (thing, stream, dateRange, timeRange) => {
    console.log("fetch")
    dataProcessor.fetch(thing, stream, dateRange, timeRange, processData, setLoading, setUptime)
  }

  return (
    <div>
      <Header loading={loading} uptime={uptime} fetch={fetch} />

      <Divider />
      {data.map((d) => {
        console.log(d)
        return <li>{d[0][0]._value}</li>
      })}
    </div>
  )
}
