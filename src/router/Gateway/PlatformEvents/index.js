import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import PlatformEventList from '../../../components/PlatformEventList'

@withRouter
class GatewayPlatformEvents extends Component {
    render () {
        const {gateway} = this.props
        return (
            <PlatformEventList
                gateway={gateway}
                limitTime={24}
            ></PlatformEventList>
        );
    }
}
export default GatewayPlatformEvents;