import React, { Component } from 'react';
import { Table, Button, Icon, message } from 'antd';
import http from '../../../utils/Server';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import Action from './action';
import app from '../../../assets/images/app.png'
import AppConfig from '../../AppsInstall/AppConfig';
import {ConfigStore} from '../../../utils/app_config';
import './style.scss';
// const openNotification = () => {
//   notification.open({
//     message: 'Notification Title',
//     description:
//       'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
//     onClick: () => {
//       console.log('Notification Clicked!');
//     }
//   });
// };
let timer;
@withRouter
@inject('store')
@observer
class AppsList extends Component {
      constructor (props){
        super(props)
        this.state = {
          data: [],
          pagination: {},
          loading: true,
          configStore: new ConfigStore(),
          edit_app_info: {},
          edit_app_inst: '',
          show_app_config: false,
          url: window.location.pathname,
          columns: [{
            title: '',
            dataIndex: 'data.data.icon_image',
            key: 'img',
            width: '100px',
            render: (record)=>{
              if (record) {
                return (
                  <img
                      src={record}
                      alt=""
                      style={{width: 50, height: 50}}
                  />
                  )
              } else {
                return (
                  <img
                      src={app}
                      alt=""
                      style={{width: 50, height: 50}}
                  />
                )
              }
            }
          }, {
            title: '实例名',
            dataIndex: 'inst_name',
            sorter: (a, b) => a.inst_name.length - b.inst_name.length,
            width: '20%'
          }, {
            title: '版本',
            dataIndex: 'version',
            key: 'version',
            render: (props, record)=>{
              if (record.data){
                if (record.latestVersion > props) {
                  return (
                      <span style={{color: 'blue'}}>
                       {props} <Icon type="arrow-up"/>
                      </span>
                  )
                } else {
                  return <span>{props}</span>
                }
              } else {
                return (
                  <span style={{color: 'orange'}}>本地</span>
                )
              }
            }
          }, {
            title: '设备数',
            dataIndex: 'devs_len',
            key: 'devs_len'
          }, {
            title: '状态',
            dataIndex: 'status',
            render: record=>{
              if (record === 'running'){
                return (
                  <span style={{background: '#00a65a', display: 'inline-block', padding: '1px 5px', borderRadius: '2px', color: '#fff'}}>{record}</span>
                )
              } else {
                return (
                  <span style={{background: '#f39c12', display: 'inline-block', padding: '1px 5px', borderRadius: '2px', color: '#fff'}}>{record}</span>
                )
              }
            }
          }, {
            title: '启动时间',
            dataIndex: 'running'
          }
        ]
      }
      }
      componentDidMount () {
        this.fetch(this.props.match.params.sn);
        timer = setInterval(() => {
          this.fetch(this.props.match.params.sn)
        }, 10000);

        let enable_beta = this.props.store.appStore.status.enable_beta
        if (enable_beta === undefined) {
          setTimeout(()=>{
            this.fetch(this.props.match.params.sn);
          }, 1000)
        }
      }
      UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.location.pathname !== this.props.location.pathname){
        clearInterval(timer);
        timer = setInterval(() => {
          this.fetch(nextProps.match.params.sn)
        }, 10000);
        this.setState({
          loading: true
        }, ()=>{
          this.fetch(nextProps.match.params.sn);
        })
        }
      }
      componentWillUnmount (){
        clearInterval(timer)
      }
      // handleTableChange = (pagination, filters) => {
      //   const pager = { ...this.state.pagination };
      //   pager.current = pagination.current;
      //   this.setState({
      //     pagination: pager
      //   });
      //   this.fetch({
      //     results: pagination.pageSize,
      //     page: pagination.current,
      //     // sortField: sorter.field,
      //     // sortOrder: sorter.order,
      //     ...filters
      //   });
      // }
      fetch = (sn) => {
        const pagination = { ...this.state.pagination };
        let enable_beta = this.props.store.appStore.status.enable_beta
        if (enable_beta === undefined) {
          enable_beta = 0
        }
        http.get('/api/gateways_app_list?gateway=' + sn + '&beta=' + enable_beta).then(res=>{
          this.props.store.appStore.setApplen(res.message && res.message.length)
          if (res.ok){
            this.setState({
              data: res.message,
              loading: false,
              pagination
            })
          } else {
            this.setState({
              data: [],
              loading: false,
              pagination
            })
          }
        })
      }

    submitData = ()=>{
        let sn = this.props.match.params.sn;
        if (this.props.store.codeStore.instNames === '' || this.props.store.codeStore.instNames === undefined) {
            message.error('实例名不能为空！');
            return false;
        }
        const data = {
          gateway: sn,
          inst: this.props.store.codeStore.instNames,
          conf: JSON.parse(this.props.store.codeStore.installConfiguration),
          id: `/gateways/${sn}/config/${this.props.store.codeStore.instNames}/${new Date() * 1}`
        };
        http.post('/api/gateways_applications_conf', data).then(res=>{
          this.timer = setInterval(() => {
            http.get('/api/gateways_exec_result?id=' + res.data).then(result=>{
              if (result.ok && result.data){
                if (result.data.result){
                  message.success('应用配置成功')
                  clearInterval(this.timer)
                } else {
                  message.error('应用配置失败')
                  clearInterval(this.timer)
                }
              }
            })
          }, 3000);
        })
    };
    showAppConfig = (app_inst, app_conf, app_info) => {
      this.setState({
        edit_app_info: app_info,
        edit_app_inst: app_inst,
        edit_app_conf: app_conf,
        show_app_config: true
      })
    }
    render () {
      let gateway_sn = this.props.match.params.sn;
      const { loading, show_app_config, edit_app_inst, edit_app_conf, edit_app_info, configStore } = this.state;
        return (
            <div>
                <div className={show_app_config ? 'hide' : 'show'}>
                    {console.log(this.state.data)}
                  <Table
                      rowKey="sn"
                      columns={this.state.columns}
                      dataSource={this.state.data && this.state.data.length > 0 ? this.state.data : []}
                      pagination={this.state.pagination}
                      loading={loading}
                      onChange={this.handleTableChange}
                      bordered
                      expandRowByClick
                      expandedRowRender={(record) => {
                        return (
                          <Action
                              record={record}
                              getconfig={this.getConfig}
                              update_app_list={this.fetch.bind(this, this.props.match.params.sn)}
                              show_app_config={this.showAppConfig}
                          />
                        )
                      }}
                  />
                </div>
                <div
                    className={show_app_config ? 'show' : 'hide'}
                    style={{position: 'relative'}}
                >
                  <Button
                      style={{position: 'absolute', right: 10, top: 5, zIndex: 999}}
                      onClick={()=>{
                        this.setState({show_app_config: false})
                      }}
                  >
                    X
                  </Button>
                  <AppConfig
                      gateway_sn={gateway_sn}
                      configStore={configStore}
                      app_info={edit_app_info}
                      app_inst={edit_app_inst}
                      pre_configuration={edit_app_conf}
                      submitData={this.submitData}
                  />
                </div>
            </div>
        );
    }
}

export default AppsList;