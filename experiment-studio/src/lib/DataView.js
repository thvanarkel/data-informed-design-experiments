import React from 'react';
import Header from './Header'
import DataCard from './DataCard'
import OverviewCard from './OverviewCard'
import DataControls from './DataControls'
import {
	Divider,
	InputNumber
} from 'antd'
import dataProcessor from './utils/dataProcessor'
import useDimensions from 'react-use-dimensions';
import { useLocallyPersistedReducer } from './utils/persistenceHelpers'

export default function DataView(props) {
	const [loading, setLoading] = React.useState(false);
	const [uptime, setUptime] = React.useState();
	// const [data, setData] = React.useState([]);

  const reducer = (d, action) => {
    console.log("reduce");
    switch (action.type) {
      case "add":
        return [ ...d, action.data ];
        break;
      case "clear":
        return [];
        break;
      case "remove":
        return [
          ...d.slice(0, action.index),
          ...d.slice(action.index + 1)
        ];
        break;
      default:
        return [ ...d, action.data ];
        break;
    }
  };

  const [data, setData] = useLocallyPersistedReducer(reducer,([]), "data" );
	const [range, setRange] = React.useState({min: 0, max: 0});
	const [transformRange, setTransformRange] = React.useState();

	const [thing, setThing] = React.useState(null);
	const [stream, setStream] = React.useState(null);

	const processData = (d) => {
		// setData(data => [ ...data, d ]);
    setData({data: d, type: "add"})
	};

  const fetch = (thing, stream, window, fn, dateRange, timeRange) => {
    console.log("fetch")
    setData({type: "clear"})
    dataProcessor.fetch(props.session, thing, stream, window, fn, dateRange, timeRange, processData, setLoading, setUptime)
  }

	const clear = () => {
		setData({type: "clear"});
	}

  const [ref, dimensions] = useDimensions();

	const pageRef = React.createRef()

  const removeCard = (i, e) => {
    setData({index: i, type: "remove"})
    console.log(e.item.node)
  }

	let min = 10000000;
	let max = 0;

	const updateRange = (v) => {
	  min = v < min ? v : min;
	  max = v > max ? v : max;
	}

	React.useEffect(() => {
		data.map((d) => d.map((e) =>{
			updateRange(e._value)
			setRange({min: min, max: max})
		}))
  }, [data]);

	React.useEffect(() => {
		console.log(`min: ${range.min} max: ${range.max}`)
  }, [transformRange]);

	const ipcRenderer = require("electron").ipcRenderer;

	const print = () => {
		ipcRenderer.send("printPDF");
	}

	const overview = true;
	const datacards = true;

  return (
    <div ref={ref}>
      <Header loading={loading} uptime={uptime} fetch={fetch} session={props.session} />
			<DataControls range={range} updateRange={setTransformRange} clear={clear} print={print}/>
			{ overview && <OverviewCard width={dimensions.width} height={600} /> }
			{ datacards && data.map((d,i) => {
				return (
					<DataCard key={i} data={d} index={i} width={dimensions.width} range={transformRange} onRemove={removeCard} />
				)
			})}
    </div>
  )
}

// {data.map((d,i) => {
// 	return (
// 		<DataCard key={i} data={d} index={i} width={dimensions.width} range={transformRange} onRemove={removeCard} />
// 	)
// })}
