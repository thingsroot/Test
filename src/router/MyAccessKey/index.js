import React, { PureComponent } from 'react';
import http from '../../utils/Server';
import { Table, Popconfirm, message } from 'antd';
class MyAccessKey extends PureComponent {
    state = {
        columns: [
            {
                key: 'value',
                dataIndex: 'value',
                title: 'AccessKey'
            },
            {   key: 'action',
                dataIndex: 'action',
                title: '操作',
                width: '200px',
                render: ()=>{
                    return (
                        <Popconfirm
                            title="更换AccessKey会导致使用原有AccessKey的应用工作不正常,是否确认更新?"
                            onConfirm={this.confirm}
                            onCancel={this.cancel}
                            okText="Yes"
                            cancelText="No"
                        >
                            <a
                                style={{color: 'blue'}}
                            >更新</a>
                        </Popconfirm>
                    )
                }
            }
        ],
        dataSource: [
            {
                value: ''
            }
        ]
    }
    componentDidMount () {
        http.get('/api/user_token_read').then(res=>{
            if (res.ok){
                this.setState({
                    dataSource: [{value: res.data}]
                })
            }
        })
    }
    confirm = ()=> {
        http.post('/api/user_token_update').then(res=>{
            if (res.ok) {
                this.setState({
                    dataSource: [{value: res.data}]
                }, ()=>{
                    message.success('AccessKey更新成功');
                })
            }
        })
      }
    cancel = ()=> {
        message.error('取消更新AccessKey');
      }
    render () {
        const { columns, dataSource } = this.state;
        return (
            <div>
                <Table
                    pagination={false}
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="value"
                />
            </div>
        );
    }
}

export default MyAccessKey;