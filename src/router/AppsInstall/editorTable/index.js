import React from 'react';
import {
    Table,
    // Input,
    Button, Form, Select
} from 'antd';
import { inject, observer} from 'mobx-react';
import {withRouter} from 'react-router-dom';
const Option = Select.Option;
const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
    <EditableContext.Provider
        value={form}
        id={index}
    >
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
                // this.input.focus();
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
        editable;
        return (
            <td {...restProps}>
                {
                    id !== 'template' ? (
                        <EditableContext.Consumer>
                            {(form) => {
                                this.form = form;
                                return (
                                    editing ? (
                                        <FormItem style={{ margin: 0 }}>
                                            {
                                            //     form.getFieldDecorator(dataIndex, {
                                            //     rules: [{
                                            //         required: true,
                                            //         message: `${title} is required.`
                                            //     }],
                                            //     initialValue: record ? record[dataIndex] : []

                                            // }
                                            // )(
                                            //     <Input
                                            //         ref={node => (this.input = node)}
                                            //         onPressEnter={this.save}
                                            //         onBlur={this.save}
                                            //         type={id}
                                            //     />
                                            // )
                                            }

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
        let dataSource = this.props.store.codeStore.allTableData[this.props.tableName];
        this.setState({
            dataSource: dataSource
        });
        // let deviceColumns = this.props.deviceColumns;
        // let data = [];
        // deviceColumns && deviceColumns.length > 0 && deviceColumns.map((v, key)=>{
        //     key;
        //     data.push({
        //         key: this.props.tableName + key,
        //         id: v.type,
        //         title: v.desc,
        //         dataIndex: v.name,
        //         editable: true
        //     });
        // });
        // data.push({
        //     title: '操作',
        //     dataIndex: 'key',
        //     render: (record) => {
        //         return (
        //             <Button onClick={() => this.handleDelete(record.key)}>删除</Button>
        //         )
        //     }
        // });
        // this.setState({
        //     deviceColumns: data
        // })
    }

    // handleDelete = (key) => {
    //     const dataSource = this.state.dataSource;
    //     let data = [];
    //     dataSource.map((v)=>{
    //         if (v.key !== key) {
    //             data.push(v)
    //         }
    //     });
    //     this.setState({ dataSource: data});
    // };

    handleAdd = (name) => {    //okokok
        const { dataSource } = this.state;
        let allTableData = this.props.store.codeStore.allTableData;
        let deviceColumns = this.props.deviceColumns[0];
        const newData = {};
        deviceColumns && deviceColumns.length > 0 && deviceColumns.map((v, key)=>{
            key;
            if (v.dataIndex !== 'key') {
                newData[v.dataIndex] = 1;
            } else {
                if (dataSource.length === 0) {
                    newData['key'] = 0
                } else {
                    newData['key'] = dataSource.length
                }
            }
        });
        dataSource.push(newData);
        allTableData[name] = dataSource;
    };

    handleSave = (row, name) => {
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
            let allTableData = this.props.store.codeStore.allTableData;
            allTableData[name] = this.state.dataSource;
        });

    };

    render () {
        let name = this.props.tableName;
        const { dataSource } = this.state;
        const deviceColumns = this.props.deviceColumns[0];
        console.log(deviceColumns)
        let components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell
            }
        };
        let columns = [];
        if (deviceColumns && deviceColumns.length > 0){
            columns = deviceColumns.map(item => {
                if (!item.editable) {
                    return item;
                } else {
                    return {
                        ...item,
                        onCell: (record) => {
                            return ({
                                record,
                                id: item.id,
                                editable: item.editable,
                                dataIndex: item.dataIndex,
                                title: item.title,
                                handleSave: (row)=>{
                                    this.handleSave(row, this.props.tableName)
                                }
                            })
                        }
                    };
                }
            });
        }
        return (
            <div>
                <Button
                    onClick={()=>{
                        this.handleAdd(name)
                    }}
                    type="primary"
                    style={{ marginBottom: 16 }}
                >
                    添加设备
                </Button>
                <Table
                    components={components}
                    rowClassName={() => 'editable-row'}
                    bordered
                    pagination={false}
                    dataSource={dataSource && dataSource.length > 0 ? dataSource : []}
                    columns={columns}
                />
            </div>
        );
    }
}
export default EditableTable;