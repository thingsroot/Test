import React from 'react'
import './style.scss';
import { Table, Input, InputNumber, Popconfirm, Form, Button, Select } from 'antd';

const EditableContext = React.createContext();

class EditableCell extends React.Component {
  getInput = () => {
    if (this.props.dataIndex === 'version') {
        return <InputNumber />;
    }
    if (this.props.dataIndex === 'id') {
        return <div>
            <Input
                type="hidden"
                ref={node => (this.input = node)}
            />
            <Select
                style={{width: '95%'}}
            >
                {this.props.configStore.templates.map((item)=>{
                    return (
                        <Select.Option
                            key={item.name}
                        >
                            {item.name}
                        </Select.Option>
                    )
                })}
            </Select>
        </div>
    }
    return <Input />;
  };

  renderCell = (form) => {
    const {
        configStore,
        editing,
        dataIndex,
        title,
        record,
        index,
        children,
        ...restProps
    } = this.props;
    configStore, index;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {form && form.getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `Please Input ${title}!`
                }
              ],
              initialValue: record[dataIndex]
            })(this.getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render () {
    return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
  }
}

class EditorTemplates extends React.Component {
  constructor (props) {
    super(props);
    this.state = { editingKey: '' };
    this.columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'template_name',
            editable: true
        }, {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            editable: true
        }, {
            title: '模板ID',
            dataIndex: 'id',
            key: 'conf_id',
            editable: false
        }, {
            title: '版本',
            key: 'version',
            dataIndex: 'version',
            editable: true
        }, {
            title: '操作',
            dataIndex: 'operation',
            render: (text, record) => {
            const { editingKey } = this.state;
            const editable = this.isEditing(record);
            return editable ? (
                <span>
                <EditableContext.Consumer>
                    {form => (
                    <Button
                        onClick={() => this.save(form, record.key)}
                    >
                        Save
                    </Button>
                    )}
                </EditableContext.Consumer>
                <Popconfirm title="Sure to cancel?"
                    onConfirm={() => this.cancel(record.key)}
                >
                    <Button>Cancel</Button>
                </Popconfirm>
                </span>
            ) : (
                <Button disabled={editingKey !== ''}
                    onClick={() => this.edit(record.key)}
                >
                    Edit
                </Button>
            );
            }
      }
    ];
  }

  isEditing = record => record.key === this.state.editingKey;

  cancel = () => {
    this.setState({ editingKey: '' });
  };

  save (form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...this.props.dataSource];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row
        });
        this.setState({ data: newData, editingKey: '' }, ()=>{
            this.props.config.setValue(this.props.dataSource)
            this.props.onChange()
        });
      } else {
        newData.push(row);
        this.setState({ data: newData, editingKey: '' }), ()=>{
            this.props.config.setValue(this.props.dataSource)
            this.props.onChange()
        };
      }
    });
  }

  edit (key) {
    this.setState({ editingKey: key });
  }

  render () {
    const components = {
      body: {
        cell: EditableCell
      }
    };

    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          dataIndex: col.dataIndex,
          title: col.title,
          configStore: this.props.configStore,
          editing: this.isEditing(record)
        })
      };
    });

    return (
      <EditableContext.Provider value={this.props.form}>
        <Table
            rowKey="name"
            components={components}
            bordered
            dataSource={this.props.dataSource}
            columns={columns}
            rowClassName="editable-row"
            pagination={{
                onChange: this.cancel
            }}
        />
      </EditableContext.Provider>
    );
  }
}

export default EditorTemplates