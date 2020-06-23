import React from 'react';
import Header from './Header'
import DataCard from './DataCard'
import {
	Divider
} from 'antd'
import dataProcessor from './utils/dataProcessor'
import useDimensions from 'react-use-dimensions';
import { useLocallyPersistedReducer } from './utils/persistenceHelpers'

export default function DataView() {
	const [loading, setLoading] = React.useState(false);
	const [uptime, setUptime] = React.useState();
	// const [data, setData] = React.useState([]);

  const reducer = (d, action) => {
    switch (action.type) {
      case "add":
        return [ ...d, action.data ];
        break;
      case "clear":
        return [];
        break;
      default:
        return [ ...d, action.data ];
        break;
    }

  };

  const [data, setData] = useLocallyPersistedReducer(reducer,([]), "data" );

	const [thing, setThing] = React.useState(null);
	const [stream, setStream] = React.useState(null);

	const processData = (d) => {
		// setData(data => [ ...data, d ]);
    setData({data: d, type: "add"})
	};

  const fetch = (thing, stream, dateRange, timeRange) => {
    console.log("fetch")
    setData({type: "clear"})
    dataProcessor.fetch(thing, stream, dateRange, timeRange, processData, setLoading, setUptime)
  }

  const [ref, dimensions] = useDimensions();

  return (
    <div ref={ref}>
      <Header loading={loading} uptime={uptime} fetch={fetch} />

      <Divider />
      {data.map((d,i) => {
        return <DataCard key={"card-" + i} data={d} index={i} width={dimensions.width} />
      })}
    </div>
  )
}
