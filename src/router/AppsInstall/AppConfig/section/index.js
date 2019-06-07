import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import {Button, Checkbox, Input, Modal, Select, Table, Divider} from 'antd';
import EditableTable from '../../editorTable';
const Option = Select.Option;

const block = {
    display: 'block'
};
const none = {
    display: 'none'
};

class AppConfigSection extends Component {
    constructor (props) {
        super(props);
        this.state = {
            showTemplateSelection: false
        }
    }

    //添加模板
    onAddTemplate = (name, conf, desc, version)=>{
        this.props.configStore.addTemplate(name, conf, desc, version)
        this.props.onChange()
    };
    // 删除模板
    onDeleteTemplate =  (name)=>{
        let dataSource = this.state.showTempList;
        dataSource.splice(name, 1);//index为获取的索引，后面的 1 是删除几行
        this.setState({
            showTempList: dataSource
        });
        let a = [];
        dataSource && dataSource.length > 0 && dataSource.map((item)=>{
            a.push(item.conf_name)
        });
        this.props.store.codeStore.setTemplate(a);
        let addTempList = this.state.addTempList;
        addTempList && addTempList.length > 0 && addTempList.map((v)=>{
            if (v.name === name) {
                v.disabled = false;
            }
        });
        this.setState({
            addTempList: addTempList
        })
    };
    templateShow = ()=>{
        this.setState({
            showTemplateSelection: true
        })
    };

    handleCancelAddTempList = ()=>{
        this.setState({
            showTemplateSelection: false
        })
    };

    render_boolean (key, config) {
        return (
            <div
                id={config.name}
                key={key}
                style={{lineHeight: '50px', display: config.hide === true ? 'none' : 'block'}}
            >
                            <span
                                className="spanStyle"
                            >{config.desc}</span>
                <Checkbox
                    checked={config.value}
                    onChange={
                        () => {
                            config.setValue(event.target.checked)
                            this.props.onChange()
                        }
                    }
                >
                </Checkbox>
                <Input
                    ref={config.name}
                    type="hidden"
                    value={config.value}
                />
            </div>
        )
    }
    render_nubmer (key, config) {
        return (
            <div
                id={config.name}
                key={key}
                style={config.hide === true ? none : block}
            >
                <div style={{lineHeight: '50px'}}>
                    <span className="spanStyle">{config.desc}：</span>
                    <Input
                        style={{width: '300px'}}
                        type="number"
                        value={config.value}
                        ref={config.name}
                        onChange={()=>{
                            config.setValue(event.target.value)
                            this.props.onChange()
                        }}
                    />
                </div>
            </div>
        )
    }
    render_string (key, config) {
        return (
            <div
                id={config.name}
                key={key}
                style={config.hide === true ? none : block}
            >
                <div style={{lineHeight: '50px'}}>
                    <span className="spanStyle">{config.desc}：</span>
                    <Input
                        style={{width: '300px'}}
                        type="text"
                        value={config.value}
                        ref={config.name}
                        onChange={()=>{
                            config.setValue(event.target.value)
                            this.props.onChange()
                        }}
                    />
                </div>
            </div>
        )
    }
    render_dropdown (key, config) {
        if (config.depends !== undefined) {
            for (let [k, v] of Object.entries(config.depends)) {
                this.props.configStore.setHide(v, k !== config.value)
            }
        }
        return (
            <div
                id={config.name}
                key={key}
                style={config.hide === true ? none : block}
            >
                <div style={{lineHeight: '50px'}}>
                    <span className="spanStyle">{config.desc}：</span>
                    <Select
                        value={config.value}
                        style={{width: 300}}
                        onChange={()=>{
                            config.depends && config.depends.length > 0 && config.depends.map( (dep, dep_key) => {
                                this.props.configStore.setHide(dep, dep_key === event.target.innerText)
                            })
                            config.setValue(event.target.innerText)
                            if (config.depends !== undefined) {
                                for (let [k, v] of Object.entries(config.depends)) {
                                    this.props.configStore.setHide(v, k !== config.value)
                                }
                            }
                            this.props.onChange()
                        }}
                    >
                        {config.values && config.values.length > 0 && config.values.map(w => <Option key={w}>{w}</Option>)}
                    </Select>
                    <Input
                        type="hidden"
                        value={config.default ? config.value[0] : ''}
                        ref={config.name}
                    />
                </div>
            </div>
        )
    }
    render_table (key, config) {
        let deviceColumns = [];
        config.child && config.child.length && config.child.map((w, key1)=>{
            deviceColumns.push({
                key: key1,
                id: w.type,
                title: w.desc,
                dataIndex: w.name,
                editable: true
            });
        });

        return (
            <div
                id={config.name}
                key={key}
                style={config.hide === true ? none : block}
            >
                <p className="sectionName">
                    <span
                        style={{padding: '0 5px'}}
                    >|</span>{config.desc}</p>
                    <EditableTable
                        tableName={config.name}
                        deviceColumns={deviceColumns}
                        dataSoruce={config.value}
                    />

            </div>
        )
    }
    render_templates (key, config, templates, templateStore) {
        const showTempLists = [
            {
                title: '名称',
                dataIndex: 'conf_name',
                key: 'conf_name',
                render: text => <span>{text}</span>
            }, {
                title: '描述',
                dataIndex: 'description',
                key: 'description'
            }, {
                title: '模板ID',
                dataIndex: 'name',
                key: 'name'
            }, {
                title: '版本',
                key: 'latest_version',
                dataIndex: 'latest_version'
            }, {
                title: '操作',
                key: 'app',
                render: (record) => (
                    <Button
                        onClick={()=>{
                            this.onDeleteTemplate(`${record.name}`)
                        }
                        }
                    >删除</Button>
                )
            }
        ]
        const addTempLists = [
            {
                title: '名称',
                width: '20%',
                dataIndex: 'conf_name',
                key: 'conf_name',
                render: text => <span>{text}</span>
            }, {
                title: '描述',
                width: '20%',
                dataIndex: 'description',
                key: 'description'
            }, {
                title: '模板ID',
                width: '20%',
                dataIndex: 'name',
                key: 'name'
            }, {
                title: '版本',
                width: '20%',
                key: 'latest_version',
                dataIndex: 'latest_version'
            }, {
                title: '操作',
                width: '20%',
                render: (record) => (
                    <span>
                    <Button>
                        <Link to={`/myTemplateDetails/${record.app}/${record.name}/${record.latest_version}`}>查看</Link>
                    </Button>
                    <span style={{padding: '0 5px'}}> </span>
                    <Button
                        disabled={record.disabled}
                        onClick={()=>{
                            this.onAddTemplate(record.name, record.conf_name, record.description, record.latest_version)
                        }}
                    >选择</Button>
                </span>
                )
            }
        ]
        return (
            <div
                id={config.name}
                key={key}
                style={config.hide === true ? none : block}
            >
                <Table
                    rowKey="name"
                    dataSource={config.value}
                    columns={showTempLists}
                    pagination={false}
                />
                <Button
                    onClick={this.templateShow}
                    style={{margin: '10px 0'}}
                >
                    选择模板
                </Button>
                <Modal
                    title="选择模板"
                    visible={this.state.showTemplateSelection}
                    onOk={this.handleCancelAddTempList}
                    onCancel={this.handleCancelAddTempList}
                    wrapClassName={'tableModal'}
                    okText="确定"
                    cancelText="取消"
                >
                    <Table
                        rowKey="name"
                        dataSource={templateStore}
                        columns={addTempLists}
                        pagination={false}
                        scroll={{ y: 240 }}
                    />
                    <Button
                        style={{marginTop: '20px'}}
                        onClick={()=>{
                            this.props.refreshTemplateList()
                        }}
                    >
                        刷新列表
                    </Button>
                    <Button
                        type="primary"
                        style={{float: 'right', marginTop: '20px'}}
                        onClick={()=>{
                            this.addNewTemplate()
                        }}
                    >
                        添加模板
                    </Button>
                </Modal>
            </div>
        )
    }
    render () {
        const { configSection, configStore, templatesSource } = this.props
        return (
            <div
                id={configSection.name}
                style={configSection.hide === true ? none : block}
            >
                <Divider orientation="left">{configSection.desc}</Divider>
                {
                    configSection.child && configSection.child.length > 0 && configSection.child.map((v, key) => {
                        if (v.type === 'boolean') {
                            return this.render_boolean(key, v)
                        }
                        if (v.type === 'number') {
                            return this.render_nubmer(key, v)
                        }
                        if (v.type === 'string') {
                            return this.render_string(key, v)
                        }
                        if (v.type === 'dropdown') {
                            return this.render_dropdown(key, v)
                        }
                        if (v.type === 'templates') {
                            return this.render_templates(key, v,  configStore.templates, templatesSource)
                        }
                        if (v.type === 'table' || v.type === 'tcp_client' || v.type === 'serial') {
                            return this.render_table(key, v)
                        }
                    })
                }
            </div>
        )
    }
}

export default AppConfigSection;