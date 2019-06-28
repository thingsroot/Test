import React, { Component } from 'react';
import { Collapse, Icon, Tooltip } from 'antd';
import { withRouter } from 'react-router-dom';
import InputList from '../InputList';
import DevicesOutputs from '../OutputList';
import DevicesCommands from '../CommandList';
const Panel = Collapse.Panel;
// function callback (key) {
//     console.log(key);
//   }
@withRouter
class Collapses extends Component {
    state = {
        dataRefresh: false,
        dataRefreshCB: undefined
    }
    RegisterDataRefresh = (onRefresh) => {
        this.setState({dataRefreshCB: onRefresh})
    }
    render () {
        return (
            <div>
                <Collapse
                    destroyInactivePanel
                    defaultActiveKey={['1']}
                    // onChange={callback}
                >
                    <Panel
                        header={
                            <p className="collapseHead">
                                <span>数据浏览</span>
                                <Tooltip
                                    placement="topLeft"
                                    title="刷新数据"
                                >
                                    <Icon
                                        type="reload"
                                        spin={this.state.dataRefresh}
                                        style={{color: this.state.dataRefreshCB ? 'black' : 'gray'}}
                                        onClick={(e)=>{
                                            e.stopPropagation();
                                            if (this.state.dataRefreshCB) {
                                                this.setState({dataRefresh: true}, ()=>{
                                                    this.state.dataRefreshCB()
                                                    setTimeout(()=>{
                                                        this.setState({dataRefresh: false})
                                                    }, 1000)
                                                })
                                            }
                                        }}
                                    />
                                </Tooltip>
                            </p>
                        }
                        key="1"
                    >
                        <InputList
                            inputs={this.props.inputs}
                            sn={this.props.meta.gateway}
                            vsn={this.props.meta.sn}
                            regRefresh={this.RegisterDataRefresh}
                        />
                    </Panel>
                    <Panel
                        disabled={this.props.outputs && Object.keys(this.props.outputs).length > 0 ? false : true}
                        header="数据下置"
                        key="2"
                    >
                        <DevicesOutputs
                            outputs={this.props.outputs}
                            sn={this.props.meta.gateway}
                            vsn={this.props.meta.sn}
                        />
                    </Panel>
                    <Panel
                        disabled={this.props.commands && Object.keys(this.props.commands).length > 0 ? false : true}
                        header="控制指令"
                        key="3"
                    >
                        <DevicesCommands
                            commands={this.props.commands}
                            sn={this.props.meta.gateway}
                            vsn={this.props.meta.sn}
                        />
                    </Panel>
                </Collapse>
            </div>
        );
    }
}

export default Collapses;0
