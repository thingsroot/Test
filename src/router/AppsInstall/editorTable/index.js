import React from 'react';
import {
    Table, Input, Button, Form, Select
} from 'antd';
import { inject, observer} from 'mobx-react';
import {withRouter} from 'react-router-dom';
const Option = Select.Option;
const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
    <EditableContext.Provider value={form} id={index}>
        <tr {...props} />
    </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);
@withRouter
@inject('store')
@observer
class EditableCell extends React.Component {
    state = {
        editing: false,
        columns: [],
        dataSource: [],
        template: []
    };

    toggleEdit = () => {
        const editing = !this.state.editing;
        this.setState({ editing }, () => {
            if (editing) {
                this.input.focus();
            }
        });
    };

    save = (e) => {
        const { record, handleSave } = this.props;
        this.form.validateFields((error, values) => {
            if (error && error[e.currentTarget.id]) {
                return;
            }
            this.toggleEdit();

            handleSave({ ...record, ...values });
        });
    };
    templateChange = (val)=>{
        this.setState({
            template: val
        }, ()=>{
            console.log(this.state.template)
        })
    }

    render () {
        const { editing } = this.state;
        const {
            id,
            editable,
            dataIndex,
            title,
            record,
            index,
            handleSave,
            ...restProps
        } = this.props;
        index;
        handleSave;
        return (
            <td {...restProps}>
                {
                    console.log(editable)
                }
                {
                    id !== 'template' ? (
                    <EditableContext.Consumer>
                        {(form) => {
                            this.form = form;
                            return (
                                editing ? (
                                    <FormItem style={{ margin: 0 }}>
                                        {form.getFieldDecorator(dataIndex, {
                                            rules: [{
                                                required: true,
                                                message: `${title} is required.`
                                            }],
                                            initialValue: record[dataIndex]
                                        })(
                                            <Input
                                                ref={node => (this.input = node)}
                                                onPressEnter={this.save}
                                                onBlur={this.save}
                                                type={id}
                                            />
                                        )}
                                    </FormItem>
                                ) : (
                                    <div
                                        className="editable-cell-value-wrap"
                                        style={{ paddingRight: 24 }}
                                        onClick={this.toggleEdit}
                                    >
                                        {restProps.children}
                                    </div>
                                )
                            );
                        }}
                    </EditableContext.Consumer>
                ) :  (
                        <EditableContext.Consumer>
                            {(form) => {
                                this.form = form;
                                return (
                                    editing ? (
                                        <FormItem style={{ margin: 0 }}>
                                            {form.getFieldDecorator(dataIndex, {
                                                rules: [{
                                                    required: true,
                                                    message: `${title} is required.`
                                                }],
                                                initialValue: record[dataIndex]
                                            })(
                                                <div>
                                                    <input
                                                        type="hidden"
                                                        ref={node => (this.input = node)}
                                                        onChange={this.save}
                                                        value={this.state.template}
                                                    />
                                                    <Select defaultValue="请选择模板">
                                                        {this.props.store.codeStore.template.map((w)=>{
                                                            return (
                                                                <Option
                                                                    key={w}
                                                                    onClick={()=>{
                                                                        this.templateChange(w)
                                                                    }}
                                                                >
                                                                    {w}
                                                                </Option>
                                                            )
                                                        })}
                                                    </Select>
                                                </div>

                                            )}
                                        </FormItem>
                                    ) : (
                                        <div
                                            className="editable-cell-value-wrap"
                                            style={{ paddingRight: 24 }}
                                            onClick={this.toggleEdit}
                                        >
                                            {restProps.children}
                                        </div>
                                    )
                                );
                            }}
                        </EditableContext.Consumer>
                    )}
            </td>
        );
    }
}
@withRouter
@inject('store')
@observer
class EditableTable extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            dataSource: [],
            count: 0,
            tableColumns: [],
            example: {}
        };

    }

    componentDidMount () {
        console.log(this.props.deviceSource);
        let deviceColumns = this.props.deviceColumns;
        let data = [];
        console.log(deviceColumns)
        deviceColumns && deviceColumns.length > 0 && deviceColumns.map((v, key)=>{
            key;
            console.log(key);
            data.push({
                key: key,
                id: v.type,
                title: v.desc,
                dataIndex: v.name,
                editable: true
            });
        });
        console.log(data);
        data.push({
            title: '操作',
            dataIndex: 'key',
            render: (record) => (
                <Button onClick={() => this.handleDelete(record.key)}>删除</Button>
            )
        });
        this.setState({
            deviceColumns: data
        }, ()=>{
            console.log(this.state.deviceColumns)
        })
    }

    handleDelete = (key) => {
        console.log(key);
        const dataSource = this.state.dataSource;
        console.log(dataSource);
        let data = [];
        dataSource.map((v)=>{
            console.log(v);
            if (v.key !== key) {
                data.push(v)
            }
        });

        this.setState({ dataSource: data});
    };

    handleAdd = () => {
        const { count, dataSource } = this.state;
        let deviceColumns = this.props.deviceColumns;
        const newData = {};
        deviceColumns && deviceColumns.length > 0 && deviceColumns.map((v, key)=>{
            key;
            newData[v.name] = 1;
        });
        console.log(newData);
        newData['key'] = count;
        this.setState({
            dataSource: [...dataSource, newData],
            count: count + 1
        }, ()=>{
            this.props.store.codeStore.setDataSource(this.state.dataSource)
        });
    };

    handleSave = (row) => {
        const newData = [...this.state.dataSource];
        const index = newData.findIndex(item => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row
        });
        this.setState({
            dataSource: newData
        }, ()=>{
            this.props.store.codeStore.setDataSource(this.state.dataSource)
        });
    };


    render () {
        // const { dataSource } = this.props;
        const { deviceColumns } = this.state;
        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell
            }
        };
        const columns = deviceColumns && deviceColumns.length > 0 && deviceColumns.map((col) => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    id: col.id,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave: this.handleSave
                })
            };
        });
        return (
            <div>
                <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 16 }}>
                    添加设备
                </Button>
                <Table
                    components={components}
                    rowClassName={() => 'editable-row'}
                    bordered
                    pagination={false}
                    dataSource={this.props.store.codeStore.dataSource}
                    columns={columns}
                />
            </div>
        );
    }
}
export default EditableTable;