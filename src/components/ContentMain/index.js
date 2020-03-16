import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {notification } from 'antd';  //
import { Redirect } from 'react-router';
import { Switch, withRouter} from 'react-router-dom';
import LoadableComponent from '../../utils/LoadableComponent';
import PrivateRoute from '../PrivateRoute';
import { doUpdate } from '../../utils/Action';
import { isDeveloper } from '../../utils/Session';
import intl from 'react-intl-universal';
const AppDetails = LoadableComponent(()=>import('../../router/AppDetails'));
const AppEdit = LoadableComponent(()=>import('../../router/AppEdit'));
const Dashboard = LoadableComponent(()=>import('../../router/Dashboard'));
const GatewayList = LoadableComponent(()=>import('../../router/GatewayList'));
const Developer = LoadableComponent(()=>import('../../router/Developer'));
const AppStore = LoadableComponent(()=>import('../../router/AppStore'));
const UserSettings = LoadableComponent(()=>import('../../router/UserSettings'));
const AccessKeys = LoadableComponent(()=>import('../../router/AccessKeys'));
const VirtualGateways = LoadableComponent(()=>import('../../router/VirtualGateways'));
const Gateway = LoadableComponent(()=>import('../../router/Gateway'));
const PlatformEvents = LoadableComponent(()=>import('../../router/PlatformEvents'));
const DeviceEvents = LoadableComponent(()=>import('../../router/GatewayEvents'));
const AppsInstall = LoadableComponent(()=>import('../../router/AppsInstall'));
const AppEditorCode = LoadableComponent(()=>import('../../router/AppEditorCode'));
const AppDeveloper = LoadableComponent(()=>import('../../router/AppDeveloper'));
const TemplateDetails = LoadableComponent(()=>import('../../router/TemplateDetails'));
const AppItems = LoadableComponent(()=>import('../../router/AppItems'))
const Enterprise = LoadableComponent(()=>import('../../router/Enterprise'));

let timer;
const openNotification = (title, message) => {
    notification.open({
        message: title,
        description: message,
        placement: 'buttonRight'
    });
};

@inject('store')
@observer
class ContentMain extends Component {
    componentDidMount (){
        this.startTimer()

        // Make sure we have the csrf_token
        // refreshToken()

        isDeveloper()
    }
    componentWillUnmount (){
        clearInterval(timer);
    }
    startTimer (){
       timer = setInterval(() => {
            let action_store = this.props.store.action;
            const { actions } = this.props.store.action;
            doUpdate(actions, function (action, status, data){
                action_store.setActionStatus(action.id, status, data.message)
                if (status === 'done') {
                    openNotification(action.title + intl.get('common.success'), data.message)
                }
                if (status === 'failed') {
                    openNotification(action.title + intl.get('common.fail'), data.message)
                }
                if (status === 'timeout') {
                    openNotification(action.title + intl.get('common.timout'), data.message)
                }
            })
        }, 1000);
    }
    render (){
        return (
            <Switch>
                <PrivateRoute
                    path="/dashboard"
                    component={Dashboard}
                    title={'Dashboard'}
                />
                <PrivateRoute
                    path="/gateways"
                    component={GatewayList}
                    title={intl.get('sider.my_gateway')}
                />
                <PrivateRoute
                    path="/developer"
                    component={Developer}
                    title={intl.get('sider.my_app')}
                />
                <PrivateRoute
                    path="/appstore"
                    component={AppStore}
                    title={intl.get('header.app_store')}
                />
                <PrivateRoute
                    path="/appitems/:name"
                    component={AppItems}
                    title={'应用详情'}
                />
                <PrivateRoute
                    path="/gateway/:sn"
                    component={Gateway}
                    title={'网关详情'}
                />
                <PrivateRoute
                    path="/enterprise"
                    component={Enterprise}
                    title={'企业'}
                />
                <PrivateRoute
                    path="/appdetails/:name/:action?"
                    component={AppDetails}
                    title={'应用详情'}
                />
                <PrivateRoute
                    path="/appedit/:name/:action?"
                    component={AppEdit}
                    title={'应用设置'}
                />
                <PrivateRoute
                    path="/appnew"
                    component={AppEdit}
                    title={intl.get('developer.create_new_app')}
                />
                <PrivateRoute
                    path="/appsinstall/:sn/:app?/:step?"
                    component={AppsInstall}
                    title={intl.get('appsinstall.installation_and_Application')}
                />
                <PrivateRoute
                    path="/appeditorcode/:app/:name/:gateway?/:inst?"
                    component={AppEditorCode}
                    title={intl.get('appdetails.code_editing')}
                />
                <PrivateRoute
                    path="/template/:app/:name?/:version?/:action?"
                    component={TemplateDetails}
                    title={'模板详情'}
                />
                <PrivateRoute
                    path="/account"
                    component={UserSettings}
                    title={'用户信息'}
                />
                <PrivateRoute
                    path="/accesskeys"
                    component={AccessKeys}
                    title={'访问授权码'}
                />
                <PrivateRoute
                    path="/appdeveloper"
                    component={AppDeveloper}
                    title={intl.get('developer.apply_to_be_a_developer')}
                />
                <PrivateRoute
                    path="/virtualgateways"
                    component={VirtualGateways}
                    title={intl.get('header.virtual_gateway')}
                />
                <PrivateRoute
                    path="/platformevents/:limitTime?"
                    component={PlatformEvents}
                    title={intl.get('sider.platform_event')}
                />
                <PrivateRoute
                    path="/platformevent/:gateway/:limitTime?"
                    component={PlatformEvents}
                    title={intl.get('sider.platform_event')}
                />
                <PrivateRoute
                    path="/gatewayevents/:limitTime?"
                    component={DeviceEvents}
                    title={intl.get('sider.device_events')}
                />
                <PrivateRoute
                    path="/gatewayevent/:gateway/:limitTime?"
                    component={DeviceEvents}
                    title={intl.get('sider.device_events')}
                />
                <Redirect
                    from="/"
                    to="/dashboard"
                />
            </Switch>
        );
    }
}

export default withRouter(ContentMain);