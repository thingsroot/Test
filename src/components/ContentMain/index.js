import React, { PureComponent } from 'react';
import { Switch, Redirect, withRouter} from 'react-router-dom';
import LoadableComponent from '../../utils/LoadableComponent';
import PrivateRoute from '../PrivateRoute';
const MyAppDetails = LoadableComponent(()=>import('../../router/myAppDetails'));
const AppSettings = LoadableComponent(()=>import('../../router/AppSettings'));
const Home = LoadableComponent(()=>import('../../router/Home'));
const MyGates = LoadableComponent(()=>import('../../router/MyGates'));
const MyApps = LoadableComponent(()=>import('../../router/MyApps'));
const UserSettings = LoadableComponent(()=>import('../../router/UserSettings'));
const MyAccessKey = LoadableComponent(()=>import('../../router/MyAccessKey'));
const MyVirtualGates = LoadableComponent(()=>import('../../router/MyVirtualGates'));
const MyGatesDevices = LoadableComponent(()=>import('../../router/MyGatesDevices'));
const MyGatesAppsInstall = LoadableComponent(()=>import('../../router/MyGatesAppsInstall'));
const PlatformMessage = LoadableComponent(()=>import('../../router/PlatformMessage'));
const DeviceMessage = LoadableComponent(()=>import('../../router/DeviceMessage'));
const BrowsingHistory = LoadableComponent(()=>import('../../router/BrowsingHistory'));
const MyGatesDevicesOutputs = LoadableComponent(()=>import('../../router/MyGatesDevicesOutputs'));
const AppsInstall = LoadableComponent(()=>import('../../router/AppsInstall'));
const AppEditorCode = LoadableComponent(()=>import('../../router/AppEditorCode'));
const MyTemplateDetails = LoadableComponent(()=>import('../../router/MyTemplateDetails'));
const MyGatesLogviewer = LoadableComponent(()=>import('../../router/MyGatesLogviewer'));
const Upgrade = LoadableComponent(()=>import('../../router/Upgrade'));
class ContentMain extends PureComponent {
    render (){
        return (
            <Switch>
                <PrivateRoute
                    path="/Home"
                    component={Home}
                    title={'Dashboard'}
                />
                <PrivateRoute
                    path="/MyGates"
                    component={MyGates}
                    title={'我的网关'}
                />
                <PrivateRoute
                    path="/MyApps"
                    component={MyApps}
                    title={'我的应用'}
                />
                <PrivateRoute
                    path="/myAppDetails/:name"
                    component={MyAppDetails}
                    title={'我的应用 · 详情'}
                />
                <PrivateRoute
                    path="/appSettings/:type/:name"
                    component={AppSettings}
                    title={'Dashboard'}
                />
                <PrivateRoute
                    path="/appSettings/:type"
                    component={AppSettings}
                    title={'Dashboard'}
                />
                <PrivateRoute
                    path="/AppEditorCode/:app/:name"
                    component={AppEditorCode}
                    title={'Dashboard'}
                />
                <PrivateRoute
                    path="/UserSettings"
                    component={UserSettings}
                    title={'Dashboard'}
                />
                <PrivateRoute
                    path="/MyAccessKey"
                    component={MyAccessKey}
                    title={'MyAccessKey'}
                />
                <PrivateRoute
                    path="/MyVirtualGates"
                    component={MyVirtualGates}
                    title={'虚拟网关'}
                />
                <PrivateRoute
                    path="/MyGatesDevices/:sn"
                    component={MyGatesDevices}
                    title={'设备列表'}
                />
                <PrivateRoute
                    path="/MyGatesAppsInstall/:sn"
                    component={MyGatesAppsInstall}
                    title={'安装应用'}
                />
                <PrivateRoute
                    path="/PlatformMessage"
                    component={PlatformMessage}
                    title={'平台消息'}
                />
                <PrivateRoute
                    path="/DeviceMessage"
                    component={DeviceMessage}
                    title={'设备消息'}
                />

                <PrivateRoute
                    path="/BrowsingHistory/:sn/:vsn"
                    component={BrowsingHistory}
                    title={'Dashboard'}
                />
                <PrivateRoute
                    path="/MyGatesDevicesOutputs/:sn/:vsn"
                    component={MyGatesDevicesOutputs}
                    title={'数据下置'}
                />
                <PrivateRoute
                    path="/AppsInstall/:sn/:app/:type"
                    component={AppsInstall}
                    title={'安装应用'}
                />
                <PrivateRoute
                    path="/MyTemplateDetails/:app/:name/:version"
                    component={MyTemplateDetails}
                    title={'Dashboard'}
                />
                <PrivateRoute
                    path="/MyGatesLogviewer/:sn"
                    component={MyGatesLogviewer}
                    title={'网关日志'}
                />
                <PrivateRoute
                    path="/MyGatesAppsUpgrade/:sn/:inst/:version/:app"
                    component={Upgrade}
                    title={'应用版本列表'}
                />
                <Redirect
                    from="/"
                    to="/Home"
                />
            </Switch>
        );
    }
}

export default withRouter(ContentMain);