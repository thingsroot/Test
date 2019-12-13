import React, { PureComponent } from 'react'
import { Route, Switch, withRouter } from 'react-router-dom';
import './App.scss';
import Login from './router/Login';
import Index from './components/Index';
import PrivateRoute from './components/PrivateRoute';
import intl from 'react-intl-universal';
import { ConfigProvider } from 'antd';
import {emit} from './emit.js'
import zh_CN from 'antd/es/locale/zh_CN';
import en_US from 'antd/es/locale/en_US';
const locales = {
    'en-US': require('./locales/en-US.json'),
    'zh-CN': require('./locales/zh-CN.json')
  };
class App extends PureComponent {
    state = {
        antdLang: zh_CN  // 修改antd  组件的国际化
    }
    componentDidMount () {
        emit.on('change_language', lang => this.loadLocales(lang)); // 监听语言改变事件
        this.loadLocales(); // 初始化语言
      }
    loadLocales (lang = 'zh-CN') {
    intl.init({
        currentLocale: lang,  // 设置初始语音
        locales
    }).then(() => {
        this.setState({
            antdLang: lang === 'zh-CN' ? zh_CN : en_US
        });
    });
    }
    render () {
        return (
            <ConfigProvider locale={this.state.antdLang}>
                <div className="wrapper">
                    <Switch>
                        <Route path="/login"
                            component={Login}
                        />
                        <PrivateRoute
                            path="/"
                            component={Index}
                        />
                    </Switch>
                </div>
            </ConfigProvider>
        )
    }
}
export default withRouter(App)