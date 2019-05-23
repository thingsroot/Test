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
class ContentMain extends PureComponent {
    render (){
        return (
            <Switch>
                <PrivateRoute
                    path="/home"
                    component={Home}
                    title={'Dashboard'}
                />
                <PrivateRoute
                    path="/mygates"
                    component={MyGates}
                    title={'我的网关'}
                />
                <PrivateRoute
                    path="/myapps"
                    component={MyApps}
                    title={'我的应用'}
                />
                <PrivateRoute
                    path="/myappdetails/:name"
                    component={MyAppDetails}
                    title={'我的应用 · 详情'}
                />
                <PrivateRoute
                    path="/appsettings/:type/:name"
                    component={AppSettings}
                    title={'Dashboard'}
                />
                <PrivateRoute
                    path="/appsettings/:type"
                    component={AppSettings}
                    title={'Dashboard'}
                />
                <PrivateRoute
                    path="/appeditorcode/:app/:name"
                    component={AppEditorCode}
                    title={'Dashboard'}
                />
                <PrivateRoute
                    path="/userSettings"
                    component={UserSettings}
                    title={'Dashboard'}
                />
                <PrivateRoute
                    path="/myaccesskey"
                    component={MyAccessKey}
                    title={'MyAccessKey'}
                />
                <PrivateRoute
                    path="/myvirtualgates"
                    component={MyVirtualGates}
                    title={'虚拟网关'}
                />
                <PrivateRoute
                    path="/mygatesdevices/:sn"
                    component={MyGatesDevices}
                    title={'设备列表'}
                />
                <PrivateRoute
                    path="/mygatesappsinstall/:sn"
                    component={MyGatesAppsInstall}
                    title={'安装应用'}
                />
                <PrivateRoute
                    path="/platformmessage"
                    component={PlatformMessage}
                    title={'平台消息'}
                />
                <PrivateRoute
                    path="/devicemessage/:sn/:time"
                    component={DeviceMessage}
                    title={'设备消息'}
                />

                <PrivateRoute
                    path="/browsinghistory/:sn/:vsn"
                    component={BrowsingHistory}
                    title={'Dashboard'}
                />
                <PrivateRoute
                    path="/mygatesdevicesoutputs/:sn/:vsn"
                    component={MyGatesDevicesOutputs}
                    title={'数据下置'}
                />
                <PrivateRoute
                    path="/appsinstall/:sn/:app/:type"
                    component={AppsInstall}
                    title={'安装应用'}
                />
                <PrivateRoute
                    path="/mytemplatedetails/:app/:name/:version"
                    component={MyTemplateDetails}
                    title={'Dashboard'}
                />
                <Redirect
                    from="/"
                    to="/home"
                />
            </Switch>
        );
    }
}

export default withRouter(ContentMain);