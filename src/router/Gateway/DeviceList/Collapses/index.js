import React, { Component } from 'react';
import { Collapse, Icon, Tooltip } from 'antd';
import { withRouter } from 'react-router-dom';
import InputList from '../InputList';
import DevicesOutputs from '../OutputList';
import DevicesCommands from '../CommandList';
const Panel = Collapse.Panel;


@withRouter
class Collapses extends Component {
    state = {
        dataRefresh: false,
        dataRefreshCB: undefined,
        controlInst: '',
        dataDown: '',
        dataBrowsing: ''
    };
    RegisterDataRefresh = (onRefresh) => {
        this.setState({
            dataRefreshCB: onRefresh
        })
    };

    getSearchText = (e, type)=>{
        let text = e.target.value;
        setTimeout(()=>{
            this.setState({
                [type]: text
            })
        }, 1000)
    };
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
                                <input
                                    style={{marginLeft: '50%'}}
                                    type="text"
                                    placeholder="搜索名称、描述"
                                    onClick={(e)=>{
                                        e.stopPropagation();
                                    }}
                                    onChange={(e)=>{
                                        this.getSearchText(e, 'dataBrowsing')
                                    }}
                                />
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
                            dataBrowsing={this.state.dataBrowsing}
                        />
                    </Panel>
                    <Panel
                        disabled={this.props.outputs && Object.keys(this.props.outputs).length > 0 ? false : true}
                        header={
                            <p className="collapseHead">
                                <span>数据下置</span>
                                {
                                    this.props.outputs && Object.keys(this.props.outputs).length > 0
                                    ? <input
                                        style={{marginLeft: '50%'}}
                                        type="text"
                                        placeholder="搜索名称、描述"
                                        onClick={(e)=>{
                                            e.stopPropagation();
                                        }}
                                        onChange={(e)=>{
                                            this.getSearchText(e, 'dataDown')
                                        }}
                                    />
                                    : ''
                                }
                                <span style={{padding: '0 30px'}}> </span>
                            </p>
                        }
                        key="2"
                    >
                        <DevicesOutputs
                            outputs={this.props.outputs}
                            sn={this.props.meta.gateway}
                            vsn={this.props.meta.sn}
                            dataDown={this.state.dataDown}
                        />
                    </Panel>
                    <Panel
                        disabled={this.props.commands && Object.keys(this.props.commands).length > 0 ? false : true}
                        header={
                            <p className="collapseHead">
                                <span>控制指令</span>
                                {
                                    this.props.commands && Object.keys(this.props.commands).length > 0
                                    ? <input
                                        style={{marginLeft: '50%'}}
                                        type="text"
                                        placeholder="搜索名称、描述"
                                        onClick={(e)=>{
                                            e.stopPropagation();
                                        }}
                                        onChange={(e)=>{
                                            this.getSearchText(e, 'controlInst')
                                        }}
                                    />
                                    : ''
                                }
                                <span style={{padding: '0 30px'}}> </span>
                            </p>
                        }
                        key="3"
                    >
                        <DevicesCommands
                            commands={this.props.commands}
                            sn={this.props.meta.gateway}
                            vsn={this.props.meta.sn}
                            controlInst={this.state.controlInst}
                        />
                    </Panel>
                </Collapse>
            </div>
        );
    }
}

export default Collapses;0
