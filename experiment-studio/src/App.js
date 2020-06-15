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
import { Button } from 'antd';
import './App.less';

import { Layout } from 'antd';
const { Sider, Content } = Layout;


const App = () => (
  <div className="App">
  <Layout>
    <Sider className="sider" width="300" theme="light">Experiment</Sider>
      <Layout>
        <Content>Content</Content>
        <Button type="primary">Button</Button>
      </Layout>
    </Layout>
  </div>
);

export default App;
