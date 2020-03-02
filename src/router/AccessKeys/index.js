import React, { PureComponent } from 'react';
import http from '../../utils/Server';
import { Table, Popconfirm, message } from 'antd';
import intl from 'react-intl-universal';

class AccessKeys extends PureComponent {
    state = {
        columns: [
            {
                key: 'value',
                dataIndex: 'value',
                title: 'AccessKey',
                width: '50%'
            },
            {   key: 'action',
                dataIndex: 'action',
                title: intl.get('common.operate'),
                width: '50%',
                render: (records, val)=>{
                        const record = val.value;
                    return (
                        <Popconfirm
                            title={record ? `${intl.get('accesskeys.change_access')}?` : intl.get('accesskeys.create_accessKey_or_not')}
                            onConfirm={()=>{
                                this.confirm(record)
                            }}
                            onCancel={()=>{
                                this.cancel(record)
                            }}
                            okText="Yes"
                            cancelText="No"
                        >
                            <span
                                style={{color: 'blue', cursor: 'pointer'}}
                            >{record ? intl.get('accesskeys.update') : intl.get('accesskeys.create')}</span>
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
    confirm = (record)=> {
        if (record) {
            http.post('/api/user_token_update').then(res=>{
                if (res.ok) {
                    this.setState({
                        dataSource: [{value: res.data}]
                    }, ()=>{
                        message.success(intl.get('accesskeys.accessKey_updated_successfully'));
                    })
                }
            })
        } else {
            http.post('/api/user_token_create').then(res=>{
                if (res.ok) {
                    this.setState({
                        dataSource: [{value: res.data}]
                    }, ()=>{
                        message.success(intl.get('accesskeys.accessKey_created_successfully'));
                    })
                }
            })
        }
      }
    cancel = (record)=> {
        const action = record ? intl.get('accesskeys.update') : intl.get('accesskeys.create')
        message.error(intl.get('common.cancel') + action + 'AccessKey');
      }
    render () {
        const { columns, dataSource } = this.state;
        return (
            <div style={{boxSizing: 'border-box', padding: '0 20px'}}>
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

export default AccessKeys;