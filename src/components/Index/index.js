import React, { PureComponent } from 'react';
import './style.scss';
import { Layout, Icon } from 'antd';
import ContentMain from '../ContentMain';
const { Header, Content, Sider } = Layout;
import Siders from '../Siders';
import HeaderBar from '../HeaderBar';

const maxHeader = {
    width: '100%',
    background: '#fff',
    padding: 0,
    height: 50,
    position: 'fixed',
    top: 0,
    right: 0,
    left: '200px',
    transition: 'background 0.3s, left 0.2s',
    zIndex: 1000
};
const minHeader = {
    width: '100%',
    background: '#fff',
    padding: 0,
    height: 50,
    position: 'fixed',
    top: 0,
    right: 0,
    left: '80px',
    transition: 'background 0.3s, left 0.2s',
    zIndex: 1000

};

class App extends PureComponent {
  state = {
    collapsed: false
  };
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  render () {
    return (
      <Layout style={{minHeight: '100vh'}}>
        <Sider
            trigger={null}
            collapsible
            collapsed={this.state.collapsed}
            style={{width: '100%'}}
        >
          <Siders collapsed={this.state.collapsed}/>
        </Sider>
        <Layout style={{width: '100%', overflowX: 'auto'}}>
          <Header style={this.state.collapsed ? minHeader : maxHeader}>
            <Icon
                className="trigger"
                type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                onClick={this.toggle}
            />
            <HeaderBar />
          </Header>
          <Content style={{
            margin: '68px 16px 24px 16px', padding: 24, background: '#fff', minHeight: 280
          }}
          >
            <ContentMain className="border"/>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
export default App;
