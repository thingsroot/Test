import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import './style.scss';
@withRouter
@inject('store') @observer
class GatesStatus extends Component {
    render () {
        const { vsn } = this.props.match.params;
        const { status } = this.props.store.appStore;
        console.log(status)
        return (
            <div className="GatesStatusWrap">
                <div>
                    <div className="positon"><span></span></div>
                    &nbsp;名称: {status.name}
                </div>
                <div>
                    <div className="positon"><span></span></div>
                    &nbsp;描述: {status.desc}
                </div>
                <div>
                    <div className="positon"><span></span></div>
                    &nbsp;序号: {status.sn}
                </div>
                <div>
                    <div className="positon"><span></span></div>
                    &nbsp;设备序号: {vsn}
                </div>
            </div>
        );
    }
}

export default GatesStatus;