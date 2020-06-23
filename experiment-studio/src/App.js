// import React from 'react';
// import logo from './logo.svg';
// import './App.css';
//
// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
//
// export default App;

import React from 'react';
import { Menu,
         Tag } from 'antd';
import './App.less';



import { LoadingOutlined } from '@ant-design/icons';

import { Layout } from 'antd';

import querier from './lib/utils/querier'
import Fetcher from './lib/Fetcher'
import DataView from './lib/DataView'

const { Sider, Content } = Layout;

const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const format = 'HH:mm';



const bucket = "session01"
querier.config(process.env.REACT_APP_URL, process.env.REACT_APP_TOKEN, process.env.REACT_APP_ORG);

const queryData = (thing, start, stop, measurement, w, fn) => async () => {
	let q = `from(bucket: "${bucket}") |> range(start: ${start}, stop: ${stop}) |> filter(fn: (r) => r["thing"] == "${thing}") |> filter(fn: (r) => r["_measurement"] == "${measurement}")`;// |> aggregateWindow(every: ${w}, fn: ${fn})`;
	const data = await querier.query(q, {
		rowParser(row) {
			row._time = new Date(row._time);
			return row;
		}
	});
	return data;
}

export default function App() {
  return (
    <div className="App">
    <Layout>
      <Sider className="sider" width="300" theme="light">Experiment
      <Menu className="menu" defaultSelectedKeys={['1']} mode="inline">
        <Menu.Item key="1">Participant 1 <Tag color="success">completed</Tag></Menu.Item>
        <Menu.Item key="2">Participant 2 <Tag color="processing">running</Tag></Menu.Item>
      </Menu>

      </Sider>
        <Layout>
          <Content className="content">
            <DataView />
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}
