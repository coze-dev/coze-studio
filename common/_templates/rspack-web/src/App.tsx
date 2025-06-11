import { Link, Outlet } from 'react-router-dom';

import { Button, Layout } from '@douyinfe/semi-ui';

import './App.css';

const App = () => {
  const { Header, Sider, Content, Footer } = Layout;
  const commonStyle = {
    height: 64,
    lineHeight: '64px',
    background: 'var(--semi-color-fill-0)',
  };
  return (
    <Layout className="h-screen">
      <Header style={commonStyle}>Header</Header>
      <Layout>
        <Sider
          style=\{{ width: '120px', background: 'var(--semi-color-fill-2)' }}
        >
          <Link to="page1">
            <Button>page1</Button>
          </Link>
          <br />
          <Link to="page2">
            <Button>page2</Button>
          </Link>
        </Sider>
        <Content style=\{{ height: 'max-content', lineHeight: '300px' }}>
          <Outlet />
        </Content>
      </Layout>
      <Footer style={commonStyle}>Footer</Footer>
    </Layout>
  );
};

export default App;
