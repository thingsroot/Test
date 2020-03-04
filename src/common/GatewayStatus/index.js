import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Icon, Tooltip, Button, Table, Form, Input, message, Select, Tag, Spin } from 'antd';
import http from '../../utils/Server';
import { Link, withRouter } from 'react-router-dom';
import './style.scss';
import intl from 'react-intl-universal';
// import {IconIOT, IconCloud} from '../../utils/iconfont';
const { Option } = Select;
import {IconIOT, IconCloud, IconVnet} from '../../utils/iconfont';
import { _getCookie } from '../../utils/Session';

const EditableContext = React.createContext();

class EditableCell extends React.Component {

  renderCell = ({ getFieldDecorator }) => {
    const {
      editing,
      dataIndex,
      title,
    //   inputType,
      record,
    //   index,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `请输入${title}!`
                }
              ],
              initialValue: record[dataIndex]
            })(<Input />)}
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


@withRouter
@inject('store')
@observer
class Status extends Component {
    constructor (props){
        super(props);
        this.timer = undefined
        this.state = {
            gateway: '',
            shares_data: [],
            editingKey: '',
            data: {},
            end_time: 1,
            shares_columns: [
                {
                    title: intl.get('login.user'),
                    dataIndex: 'share_to',
                    editable: true,
                    render: (record)=>{
                        return (<Tooltip title={record}>{record}</Tooltip>)
                    }
                }, {
                    title: intl.get('gateway.End_date'),
                    dataIndex: 'end_time',
                    render: (record, result)=>{
                            if (result.key !== this.state.editingKey) {
                                if (new Date(record) * 1 > new Date() * 1) {
                                    return <span>{record}</span>
                                } else {
                                    return <span style={{color: 'red'}}>{record ? '已失效' : ''}</span>
                                }
                            } else {
                                return (
                                    <Select
                                        defaultValue={1}
                                        style={{ width: 120 }}
                                        onChange={this.handleChange}
                                    >
                                        <Option value={1}>1&nbsp;{intl.get('common.day')}</Option>
                                        <Option value={3}>3&nbsp;{intl.get('common.day')}</Option>
                                        <Option value={7}>7&nbsp;{intl.get('common.day')}</Option>
                                    </Select>
                                )
                            }
                    }
                }, {
                    title: intl.get('common.operation'),
                    render: (record)=>{
                        return (
                            record.key !== this.state.editingKey
                            ? (
                                <div>
                                    <Button
                                        onClick={()=>{
                                            this.edit(record.key)
                                        }}
                                        style={{marginRight: '5px'}}
                                    >
                                        {intl.get('gateway.delay')}
                                    </Button>
                                    <Button
                                        onClick={()=>{
                                            this.deleteShare(record)
                                        }}
                                    >
                                        {intl.get('appdetails.delete')}
                                    </Button>
                                </div>
                            )
                            : (
                                <div>
                                    <EditableContext.Consumer>
                                    {
                                        form => (
                                            <Button
                                                onClick={() => this.save(form, record.key)}
                                                style={{marginRight: '5px'}}
                                            >
                                                {intl.get('appsinstall.save')}
                                            </Button>
                                        )
                                    }
                                    </EditableContext.Consumer>
                                    <Button
                                        onClick={()=>{
                                            this.deleteShare(record, true)
                                        }}
                                    >
                                        {intl.get('common.cancel')}
                                    </Button>
                                </div>
                            )
                        )
                    }
                }
            ]
        }
    }
    componentDidMount (){
        this.setState({gateway: this.props.gateway}, () => {
            this.gatewayRead()
            this.startTimer()
        })
    }
    UNSAFE_componentWillReceiveProps (nextProps) {
        if (nextProps.gateway !== this.state.gateway) {
            this.setState({gateway: nextProps.gateway}, () => {
                this.gatewayRead()
                this.showShare()
            })
        }
    }
    componentWillUnmount (){
        clearInterval(this.timer);
    }
    isEditing = record => record.key === this.state.editingKey;
    edit = (key)=> {
        this.setState({ editingKey: key, end_time: 1 });
    }
    save (form) {
        form.validateFields((error, row) => {
            if (error) {
            return;
            }
            let dateTime = new Date();
            dateTime = dateTime.setDate(dateTime.getDate() + Number(this.state.end_time));
            function timestamp (timestamp){
                const d = new Date(timestamp);    //根据时间戳生成的时间对象
                const date = (d.getFullYear()) + '-' +
                          (d.getMonth() + 1) + '-' +
                          (d.getDate()) + ' ' +
                          (d.getHours()) + ':' +
                          (d.getMinutes()) + ':' +
                          (d.getSeconds())
                return date;
            }
            const data = {
                device: this.state.gateway,
                end_time: timestamp(dateTime),
                share_to: row.share_to
            }
            const {shares_data} = this.state;
            const index = shares_data.findIndex(item=> item.share_to === row.share_to);
            if (index === -1) {
                http.post('/api/gateways_shares_create', data).then(res=>{
                    if (res.ok) {
                        message.success(intl.get('gateway.Device_sharing_successful'))
                        this.showShare()
                        this.setState({
                            editingKey: ''
                        })
                    } else {
                        message.error(res.error)
                    }
                })
            } else {
                data.name = shares_data[index].name
                http.post('/api/gateways_shares_update', data).then(res=>{
                    if (res.ok) {
                        message.success(intl.get('gateway.Equipment_sharing_has_been_postponed_successfully'))
                        this.showShare()
                        this.setState({
                            editingKey: ''
                        })
                    } else {
                        message.error(res.error)
                    }
                })
            }
        });
    }
    handleChange = (val) => {
        this.setState({
            end_time: val
        })
    }
    startTimer (){
        this.timer = setInterval(() => {
            const {gateStatusLast, gateStatusGap, gateStatusNoGapTime} = this.props.store.timer;
            let now = new Date().getTime()
            if (now < gateStatusNoGapTime) {
                this.props.store.timer.setGateStatusLast(now)
                this.gatewayRead()
            } else if (now > gateStatusGap + gateStatusLast) {
                this.props.store.timer.setGateStatusLast(now)
                this.gatewayRead()
            }
        }, 1000);
    }
    gatewayRead (){
        if (this.state.gateway === undefined || this.state.gateway === '') {
            return
        }
        http.get('/api/gateways_read?name=' + this.state.gateway).then(res=>{
            if (res.ok) {
                this.setState({
                    data: res.data
                })
                if (res.data.sn !== this.state.gateway) {
                    console.log('Delayed data arrived!!', res.data, this.state.gateway)
                    return
                }
                this.props.store.gatewayInfo.updateStatus(res.data);
            }
        });
    }
    deleteShare = (record, type) =>{
        if (type) {
            const {shares_data} = this.state;
            const index = shares_data.indexOf(record)
            if (!record.name){
                shares_data.splice(index, 1)
            }
            const unfinished = shares_data.findIndex(item => item.name === undefined)
            if (unfinished !== -1) {
                unfinished.splice(index, 1)
            }
            this.setState({
                editingKey: '',
                shares_data
            })
            return false;
        }
        if (record.name) {
            const data = {
                name: record.name
            }
            http.post('/api/gateways_shares_remove', data).then(res=>{
                if (res.ok) {
                    message.success(intl.get('gateway.Delete_temporary_share_successfully'))
                    this.showShare()
                } else {
                    message.error(res.error)
                }
            })
        }
    }
    showShare = ()=>{
        http.get('/api/gateways_shares_list?name=' + this.state.gateway).then(res=>{
            if (res.ok && res.data.length > 0) {
                const shares_data = res.data;
                shares_data.map((item, key)=>{
                    item.key = key;
                })
                this.setState({
                    shares_data
                })
            } else {
                this.setState({
                    shares_data: []
                })
            }
        })
    }
    addShares = () => {
        const {shares_data} = this.state;
        const key = shares_data.length;
        const addIndex = () => {
            let ind = shares_data.findIndex(item=> item.key === key)
            if (ind !== -1) {
                ind = ind + 1;
                this.addIndex()
            } else {
                return ind
            }
        }
        addIndex()
        const obj = {
            share_to: '',
            end_time: '',
            key
        }
        const index = shares_data.findIndex(item=> !item.name)
        if (index === 0) {
            return false;
        }
        shares_data.push(obj)
        this.setState({
            shares_data
        }, ()=> {
            this.edit(key)
        })
    }
    render () {
        const { device_status, dev_name, description, data } = this.props.store.gatewayInfo;
        const components = {
            body: {
              cell: EditableCell
            }
          };
          const columns = this.state.shares_columns.map(col => {
            if (!col.editable) {
              return col;
            }
            return {
              ...col,
              onCell: record => ({
                record,
                // inputType: col.dataIndex === 'age' ? 'number' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: this.isEditing(record)
              })
            };
          });
        return (
            <div className="GatesStatusWrap">
                <div
                    className="status"
                    style={{width: '200px', marginRight: '20px'}}
                >
                    <div
                        className="status_tag"
                    >
                            {
                                this.state.data.owner_type === 'Cloud Company Group' && this.state.data.company === _getCookie('companies')
                                ? <Tag color="cyan" >{intl.get('gateway.company')}</Tag>
                                : this.state.data.owner_type === 'User' && this.state.data.owner_id === _getCookie('user_id')
                                ? <Tag color="lime" >{intl.get('gateway.individual')}</Tag>
                                : JSON.stringify(this.state.data) === '{}' ? <Spin /> : <Tag color="orange" >{intl.get('gateway.share')}</Tag>
                            }
                    </div>
                    <div
                        style={{flex: '1'}}
                    >
                    <Tooltip title="在线状态" >
                        <IconIOT
                            style={{fontSize: 22, color: device_status === 'ONLINE' ? '#3c763d' : '#f39c12'}}
                            type={device_status === 'ONLINE' ? 'icon-charulianjie' : 'icon-quxiaolianjie'}
                        />
                    </Tooltip>
                    {
                        device_status === 'ONLINE' ? (
                            <span>
                                <span style={{padding: '0 5px'}} />
                                <Tooltip title={intl.get('gateway.data_upload')} >
                                    <Icon
                                        style={{fontSize: 22, color: data.data_upload ? '#3c763d' : '#f39c12'}}
                                        type={data.data_upload  ? 'cloud-upload' : 'cloud'}
                                    />
                                </Tooltip>
                                <span style={{padding: '0 5px'}} />
                                {
                                    data.enable_beta
                                    ? <Tooltip title={intl.get('gateway.debug_mode')} >
                                        <IconCloud
                                            style={{fontSize: 22, color: '#f39c12'}}
                                            type="icon-biaoshilei_ceshi"
                                        />
                                    </Tooltip>  : null
                                }
                            </span>
                        ) : null
                    }
                    </div>
                </div>
                <div className="gateDesc">
                    <Tooltip title={dev_name ? dev_name : ''}>
                        <div style={{width: '240px'}}>
                            <div className="positon"><span></span></div>
                            &nbsp;{intl.get('common.name')}: {dev_name ? dev_name : ''}
                        </div>
                    </Tooltip>
                    <span style={{padding: '0 50px'}} />
                    <Tooltip title={description ? description : ''}>
                        <div style={{width: '300px'}}>
                            <div className="positon"><span></span></div>
                            &nbsp;{intl.get('common.desc')}: {description ? description : ''}
                        </div>
                    </Tooltip>
                    <span style={{padding: '0 50px'}} />
                    <Tooltip title={this.state.gateway}>
                        <div style={{width: '300px'}}>
                            <div className="positon"><span></span></div>
                            &nbsp;{intl.get('gateway.number')}: {this.state.gateway}
                        </div>
                    </Tooltip>
                </div>
                {
                    device_status === 'ONLINE'
                    ? <div className="install">
                        {
                            this.props.location.pathname.indexOf('/gateway/') !== -1
                            ? <div
                                onClick={()=>{
                                    localStorage.setItem('url', this.props.location.pathname)
                                }}
                              >
                                <Link to={`/appsinstall/${this.state.gateway}`}>
                                    <Button type="primary">
                                        <Icon type="appstore"
                                            theme="filled"
                                        />{intl.get('gateway.install_new_app')}
                                    </Button>
                                </Link>
                                <Button
                                    type="link"
                                    disabled={(this.state.data.owner_type === 'User' && this.state.data.owner_id !== _getCookie('user_id')) || (this.state.data.owner_type === 'Cloud Company Group' && this.state.data.company !== _getCookie('companies'))}
                                    onClick={()=>{
                                        this.setState({
                                            share_visible: !this.state.share_visible
                                        }, () => {
                                            this.showShare()
                                        })
                                    }}
                                >
                                    <IconVnet type="icon-icon_share"/>
                                </Button>
                                {
                                    this.state.share_visible
                                    ? <div
                                        style={{
                                            position: 'fixed',
                                            top: 0,
                                            left: 0,
                                            bottom: 0,
                                            right: 0,
                                            background: 'rgba(0, 0, 0, 0)',
                                            zIndex: 998
                                        }}
                                        onClick={()=>{
                                            this.setState({
                                                share_visible: false
                                            })
                                        }}
                                      >
                                        <div
                                            className="share_devece"
                                        >
                                            <EditableContext.Provider
                                                value={this.props.form}
                                            >
                                                <div>
                                                    <div
                                                        className="shares_list_wrap"
                                                        onClick={(event)=>{
                                                            event.stopPropagation()
                                                        }}
                                                    >
                                                        <Table
                                                            rowKey="share_to"
                                                            className="shares_list"
                                                            components={components}
                                                            rowClassName={() => 'editable-row'}
                                                            bordered
                                                            columns={columns}
                                                            dataSource={this.state.shares_data}
                                                            pagination={false}
                                                        />
                                                        <div
                                                            style={{
                                                                padding: '10px 0'
                                                            }}
                                                        >
                                                            <Button
                                                                onClick={this.addShares}
                                                                style={{marginLeft: '15px'}}
                                                            >
                                                                {intl.get('gateway.Add_user')}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </EditableContext.Provider>
                                        </div>
                                      </div>
                                    : ''
                                }
                            </div>
                            : ''
                        }
                    </div>
                    : ''
                }

            </div>
        );
    }
}
const EditableFormTable = Form.create()(Status);
export default EditableFormTable;