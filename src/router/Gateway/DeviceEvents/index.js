import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import DeviceEventList from '../../../components/DeviceEventList'

@withRouter
class GatewayDeviceEvents extends Component {
    render () {
        const {gateway} = this.props
        return (
            <DeviceEventList
                gateway={gateway}
                limitTime={24}
            ></DeviceEventList>
        );
    }
}
export default GatewayDeviceEvents;