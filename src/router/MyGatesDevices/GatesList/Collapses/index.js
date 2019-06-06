import React, { Component } from 'react';
import { Collapse } from 'antd';
import { withRouter } from 'react-router-dom';
import ExpandedRowRender from '../../table';
import MyGatesDevicesOutputs from '../../../MyGatesDevicesOutputs';
import MyGatesDevicesCommands from '../../../MyGatesDevicesCommands';
const Panel = Collapse.Panel;
// function callback (key) {
//     console.log(key);
//   }
@withRouter
class Collapses extends Component {
    render () {
        return (
            <div>
                <Collapse
                    destroyInactivePanel
                    defaultActiveKey={['1']}
                    // onChange={callback}
                >
                    <Panel
                        header="数据浏览"
                        key="1"
                    >
                        <ExpandedRowRender
                            inputs={this.props.inputs}
                            vsn={this.props.meta.sn}
                        />
                    </Panel>
                    <Panel
                        disabled={this.props.outputs && Object.keys(this.props.outputs).length > 0 ? false : true}
                        header="数据下置"
                        key="2"
                    >
                        <MyGatesDevicesOutputs
                            outputs={this.props.outputs}
                            vsn={this.props.meta.sn}
                        />
                    </Panel>
                    <Panel
                        disabled={this.props.commands && Object.keys(this.props.commands).length > 0 ? false : true}
                        header="控制指令"
                        key="3"
                    >
                        <MyGatesDevicesCommands
                            commands={this.props.commands}
                            vsn={this.props.meta.sn}
                        />
                    </Panel>
                </Collapse>
            </div>
        );
    }
}

export default Collapses;0
