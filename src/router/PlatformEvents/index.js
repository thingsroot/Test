import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import PlatformEventList from '../../components/PlatformEventList'

@withRouter
class GatewayEvents extends Component {
    state = {
        gateway: undefined,
        limitTime: 24
    };
    componentDidMount (){
        //const pathname = this.props.location.pathname.toLowerCase();
        this.setState({
            gateway: this.props.match.params.gateway,
            limitTime: this.props.match.params.limitTime
        })
    }
    UNSAFE_componentWillReceiveProps (nextProps){
         if (nextProps.match.params.gateway !== this.state.gateway ||
            nextProps.match.params.limitTime !== this.state.limitTime){
            this.setState({
                gateway: nextProps.match.params.gateway,
                limitTime: nextProps.match.params.limitTime
            })
        }
    }

    render () {
        const {gateway, limitTime} = this.state
        return (
            <PlatformEventList
                gateway={gateway}
                limitTime={limitTime}
            ></PlatformEventList>
        );
    }
}
export default GatewayEvents;