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
const PlatformDetails = LoadableComponent(()=>import('../../router/PlatformDetails'));
const BrowsingHistory = LoadableComponent(()=>import('../../router/BrowsingHistory'));
const MyGatesDevicesOutputs = LoadableComponent(()=>import('../../router/MyGatesDevicesOutputs'));
const AppsInstall = LoadableComponent(()=>import('../../router/AppsInstall'));
const AppEditorCode = LoadableComponent(()=>import('../../router/AppEditorCode'));
const MyTemplateDetails = LoadableComponent(()=>import('../../router/MyTemplateDetails'));
const MyGatesLogviewer = LoadableComponent(()=>import('../../router/MyGatesLogviewer'));
class ContentMain extends PureComponent {
    render (){
        return (
            <Switch>
                <PrivateRoute
                    path="/Home"
                    component={Home}
                />
                <PrivateRoute
                    path="/MyGates"
                    component={MyGates}
                />
                <PrivateRoute
                    path="/MyApps"
                    component={MyApps}
                />
                <PrivateRoute
                    path="/myAppDetails/:name"
                    component={MyAppDetails}
                />
                <PrivateRoute
                    path="/appSettings/:name"
                    component={AppSettings}
                />
                <PrivateRoute
                    path="/AppEditorCode/:app/:name"
                    component={AppEditorCode}
                />
                <PrivateRoute
                    path="/UserSettings"
                    component={UserSettings}
                />
                <PrivateRoute
                    path="/MyAccessKey"
                    component={MyAccessKey}
                />
                <PrivateRoute
                    path="/MyVirtualGates"
                    component={MyVirtualGates}
                />
                <PrivateRoute
                    path="/MyGatesDevices/:sn"
                    component={MyGatesDevices}
                />
                <PrivateRoute
                    path="/MyGatesAppsInstall/:sn"
                    component={MyGatesAppsInstall}
                />
                <PrivateRoute
                    path="/PlatformMessage"
                    component={PlatformMessage}
                />
                <PrivateRoute
                    path="/DeviceMessage"
                    component={DeviceMessage}
                />
                <PrivateRoute
                    path="/platformDetails/:name"
                    component={PlatformDetails}
                />
                <PrivateRoute
                    path="/BrowsingHistory/:sn/:vsn"
                    component={BrowsingHistory}
                />
                <PrivateRoute
                    path="/MyGatesDevicesOutputs/:sn/:vsn"
                    component={MyGatesDevicesOutputs}
                />
                <PrivateRoute
                    path="/AppsInstall/:sn"
                    component={AppsInstall}
                />
                <PrivateRoute
                    path="/MyTemplateDetails/:app/:name/:version"
                    component={MyTemplateDetails}
                />
                <PrivateRoute
                    path="/MyGatesLogviewer/:sn"
                    component={MyGatesLogviewer}
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