import querier from './querier'
import moment from 'moment';

querier.config(process.env.REACT_APP_URL, process.env.REACT_APP_TOKEN, process.env.REACT_APP_ORG);

var bucket = "session0"

const queryData = async (thing, start, stop, measurement, window, fn) => {
  let q = `from(bucket: "${bucket}") |> range(start: ${start}, stop: ${stop}) |> filter(fn: (r) => r["thing"] == "${thing}")`;
  q += measurement !== "all" ? ` |> filter(fn: (r) => r["_measurement"] == "${measurement}")` : '';

  console.log(window);
  if (window.length > 0 && fn.length > 0) {
    q +=  `|> aggregateWindow(every: ${window}, fn: ${fn})`;

  }
  console.log(q);
	const data = await querier.query(q, {
		rowParser(row) {
			row._time = new Date(row._time);
			return row;
		}
	});
	return data;
}

let loading;
let uptime;

let window;
let fn;

export default {
  fetch: async (session, thing, stream, window, fn, dateRange, timeRange, processData, setLoading, setUptime) => {
    bucket = "session0";
    bucket += session;
    setLoading(true);
    loading = false;

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

    const polling = 500

    while (dStart.isBefore(endRange)) {
      // console.log(`${dStart}, ${dEnd}`)
      const data = await queryData(thing, dStart.format(), dEnd.format(), stream, window, fn);
      console.log(data)


      let t = 0;
      let o = 0;
      let last = dStart.valueOf();

      for (const [i, value] of data.entries()) {
        const ti = value._time.getTime();
        const d = ti - last;
        // console.log(d);
        if (d > 0 * 60000 + 45000) { // If the difference  is time is larger than a minute then we missed too much data
          o += (d - polling);
        }
        t += d;
        last = ti;
        if (i == data.length - 1) {
          off += dEnd.valueOf() - ti;
        }
      }
      if (data.length == 0) {
        off += dEnd.valueOf() - dStart.valueOf();
      }
      //total += t;
      total += dEnd.valueOf() - dStart.valueOf();
      off += o;

      console.log(total)
      console.log(off);
      dStart.add(24, 'hours')
      dEnd.add(24, 'hours')

      if (data.length > 0) {
        data[0].window = window;
        data[0].fn = fn;
        data[0].session = session;
        processData(data);
      }
    }
    setLoading(false);
    setUptime(Math.round((100 - ((off/total) * 100)) * 10)/10)
  }
}
