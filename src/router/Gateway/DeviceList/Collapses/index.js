import React, { Component } from 'react';
import { Collapse, Icon, Tooltip, Input } from 'antd';
import { withRouter } from 'react-router-dom';
import InputList from '../InputList';
import DevicesOutputs from '../OutputList';
import DevicesCommands from '../CommandList';
import intl from 'react-intl-universal';
const Panel = Collapse.Panel;


@withRouter
class Collapses extends Component {
    state = {
        dataRefresh: false,
        dataRefreshCB: undefined,
        inputFilterCB: undefined,
        inputFilter: '',
        outputFilterCB: undefined,
        outputFilter: '',
        commandFilterCB: undefined,
        commandFilter: ''
    };
    RegisterDataRefresh = (onRefresh) => {
        this.setState({
            dataRefreshCB: onRefresh
        })
    };
    RegisterInputFilterChangeCB = (onChange) => {
        this.setState({
            inputFilterCB: onChange
        })
    };
    changeInputFilter = (e)=>{
        let text = e.target.value;
        clearTimeout(this.inputFilterTimer)
        this.inputFilterTimer = setTimeout(()=>{
            this.setState({
                inputFilter: text
            }, ()=>{
                if (this.state.inputFilterCB) {
                    this.state.inputFilterCB()
                }
            })
        }, 200)
    };
    RegisterOutputFilterChangeCB = (onChange) => {
        this.setState({
            outputFilterCB: onChange
        })
    };
    changeOutputFilter = (e)=>{
        let text = e.target.value;
        clearTimeout(this.outputFilterTimer)
        this.outputFilterTimer = setTimeout(()=>{
            this.setState({
                outputFilter: text
            }, ()=>{
                if (this.state.outputFilterCB) {
                    this.state.outputFilterCB()
                }
            })
        }, 200)
    };
    RegisterCommandFilterChangeCB = (onChange) => {
        this.setState({
            commandFilterCB: onChange
        })
    };
    changeCommandFilter = (e)=>{
        let text = e.target.value;
        clearTimeout(this.commandFilterTimer)
        this.commandFilterTimer = setTimeout(()=>{
            this.setState({
                commandFilter: text
            }, ()=>{
                if (this.state.commandFilterCB) {
                    this.state.commandFilterCB()
                }
            })
        }, 200)
    };
    render () {
        return (
            <div>
                <Collapse
                    destroyInactivePanel
                    defaultActiveKey={['1']}
                >
                    <Panel
                        header={
                            <p className="collapseHead">
                                <span>{intl.get('devece_list.Data_browsing')}</span>
                                <Input
                                    style={{marginLeft: '70%', maxWidth: '300px'}}
                                    type="text"
                                    allowClear
                                    placeholder={intl.get('devece_list.search_name_desc')}
                                    onClick={(e)=>{
                                        e.stopPropagation();
                                    }}
                                    onChange={(e)=>{
                                        this.changeInputFilter(e)
                                    }}
                                />
                                <Tooltip
                                    placement="topLeft"
                                    title={intl.get('gateway.refresh_data')}
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
                            filterText={this.state.inputFilter}
                            regFilterChangeCB={this.RegisterInputFilterChangeCB}
                        />
                    </Panel>
                    <Panel
                        disabled={this.props.outputs && Object.keys(this.props.outputs).length > 0 ? false : true}
                        header={
                            <p className="collapseHead">
                                <span>{intl.get('devece_list.The_data_set')}</span>
                                {
                                    this.props.outputs && Object.keys(this.props.outputs).length > 0
                                    ? <Input
                                        style={{marginLeft: '70%', maxWidth: '300px'}}
                                        type="text"
                                        allowClear
                                        placeholder={intl.get('devece_list.search_name_desc')}
                                        onClick={(e)=>{
                                            e.stopPropagation();
                                        }}
                                        onChange={(e)=>{
                                            this.changeOutputFilter(e)
                                        }}
                                      /> : null
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
                            filterText={this.state.outputFilter}
                            regFilterChangeCB={this.RegisterOutputFilterChangeCB}
                        />
                    </Panel>
                    <Panel
                        disabled={this.props.commands && Object.keys(this.props.commands).length > 0 ? false : true}
                        header={
                            <p className="collapseHead">
                                <span>{intl.get('devece_list.Control_instruction')}</span>
                                {
                                    this.props.commands && Object.keys(this.props.commands).length > 0
                                    ? <Input
                                        style={{marginLeft: '70%', maxWidth: '300px'}}
                                        type="text"
                                        allowClear
                                        placeholder={intl.get('devece_list.search_name_desc')}
                                        onClick={(e)=>{
                                            e.stopPropagation();
                                        }}
                                        onChange={(e)=>{
                                            this.changeCommandFilter(e)
                                        }}
                                      /> : null
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
                            filterText={this.state.commandFilter}
                            regFilterChangeCB={this.RegisterCommandFilterChangeCB}
                        />
                    </Panel>
                </Collapse>
            </div>
        );
    }
}

export default Collapses;0
