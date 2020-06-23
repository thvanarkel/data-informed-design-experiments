import React from 'react';
import Header from './Header'
import DataCard from './DataCard'
import {
	Divider
} from 'antd'
import dataProcessor from './utils/dataProcessor'
import useDimensions from 'react-use-dimensions';

export default function DataView() {
	const [loading, setLoading] = React.useState(false);
	const [uptime, setUptime] = React.useState();
	const [data, setData] = React.useState([]);

	const [thing, setThing] = React.useState(null);
	const [stream, setStream] = React.useState(null);

	const processData = (d) => {
		setData(data => [ ...data, d ]);
	};

  const fetch = (thing, stream, dateRange, timeRange) => {
    console.log("fetch")
    dataProcessor.fetch(thing, stream, dateRange, timeRange, processData, setLoading, setUptime)
  }

  const [ref, dimensions] = useDimensions();

  return (
    <div ref={ref}>
      <Header loading={loading} uptime={uptime} fetch={fetch} />

      <Divider />
      {data.map((d,i) => {
        return <DataCard data={d} index={i} width={dimensions.width} />
      })}
    </div>
  )
}
