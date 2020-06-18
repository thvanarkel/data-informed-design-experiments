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
import { Button,
         Card,
         Menu,
         Tag,
         DatePicker,
         Divider,
         Statistic,
         Spin,
         TimePicker,
         Row,
         Col } from 'antd';
import './App.less';

import Header from './lib/Header'

import { LoadingOutlined } from '@ant-design/icons';

import { Layout } from 'antd';
const { Sider, Content } = Layout;
const TimeRangePicker = TimePicker.RangePicker;
const DateRangePicker = DatePicker.RangePicker;

const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const format = 'HH:mm';

const App = () => (
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
          <Header />

          <Divider />
        </Content>
      </Layout>
    </Layout>
  </div>
);

export default App;
