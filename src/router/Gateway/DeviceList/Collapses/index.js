import React, { Component } from 'react';
import { Collapse, Icon } from 'antd';
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
                                <Icon
                                    type="sync"
                                    onClick={(e)=>{
                                        e.stopPropagation();

                                    }}
                                />
                            </p>
                        }
                        key="1"
                    >
                        <InputList
                            inputs={this.props.inputs}
                            sn={this.props.meta.gateway}
                            vsn={this.props.meta.sn}
                        />
                    </Panel>
                    <Panel
                        disabled={this.props.outputs && Object.keys(this.props.outputs).length > 0 ? false : true}
                        header={
                            <p className="collapseHead">
                                <span>数据下置</span>
                                <Icon
                                    type="sync"
                                    onClick={(e)=>{
                                        e.stopPropagation();

                                    }}
                                />
                            </p>
                        }
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
                        header={
                            <p className="collapseHead">
                                <span>控制指令</span>
                                <Icon
                                    type="sync"
                                    onClick={(e)=>{
                                        e.stopPropagation();
                                        console.log(1)
                                    }}
                                />
                            </p>
                        }
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
