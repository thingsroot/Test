import React, { Component } from 'react';
import { Table, Button, Icon, message } from 'antd';
import http from '../../../utils/Server';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import Action from './action';
import app from '../../../assets/images/app.png'
import AppConfig from '../../AppsInstall/AppConfig';
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
          config: [],
          addTempList: [],
          deviceColumns: [],
          keys: [],
          flag: true,
          item: {},
          detail: true,
          app: '',
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
        // timer = setInterval(() => {
        //   this.fetch(this.props.match.params.sn)
        // }, 10000);
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
        http.get('/api/gateways_app_list?gateway=' + sn + '&beta=' + this.props.store.appStore.status.enable_beta).then(res=>{
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
      getConfig = (name, conf)=>{
        this.props.store.codeStore.setActiveKey('1');
        this.props.store.codeStore.setErrorCode(false);
        this.props.store.codeStore.setInstallConfiguration('{}');
        this.props.store.codeStore.setInstNames('');
        this.props.store.codeStore.setReadOnly(false);
        let config = [];
        if (conf && conf[0] === '[') {
            config = JSON.parse(conf);
        }
        let deviceColumns = [];
        let tableName = [];  //存放表名
        let dataSource = {};
        let keys = [];
        config && config.length > 0 && config.map((v, key)=>{
            keys.push(v);
            key;
            if (v.type === 'templates' ||
                v.type === 'text' ||
                v.type === 'number' ||
                v.type === 'dropdown' ||
                v.type === 'section' ||
                v.type === 'table'
            ) {
                return false;
            } else {
                this.props.store.codeStore.setReadOnly(false);
                this.props.store.codeStore.setErrorCode(true)
            }
            if (v.name === 'device_section') {
                let tableNameData = {};
                v.child && v.child.length && v.child.map((w, key1)=>{
                    tableNameData[w.name] = [];
                    key1;
                    let arr = [];
                    w.cols.map((i, key2)=>{
                        key2;
                        arr.push({
                            key: key2,
                            name: i.name,
                            desc: i.desc,
                            type: i.type
                        });
                    });
                    tableName.push(w.name);
                    deviceColumns.push({
                        [w.name]: arr
                    })
                });
                this.props.store.codeStore.setAllTableData(tableNameData);
            }
        });
        //设置store存储数据
        tableName && tableName.length > 0 && tableName.map((w)=>{
            dataSource[w] = [];
        });
        this.props.store.codeStore.setDataSource(dataSource);
        let columnsArr = [];
        deviceColumns && deviceColumns.length > 0 && deviceColumns.map((v, key)=>{
            key;
            let data = [];
            let name = tableName[key];
            v[name].map((w, indexW)=>{
                data.push({
                    key: indexW,
                    id: w.type,
                    title: w.desc,
                    dataIndex: w.name,
                    editable: true
                });
            });
            columnsArr.push({[tableName[key]]: data})
        });
        let obj = {};
        columnsArr.map((item)=>{
            obj[Object.keys(item)] = Object.values(item)
        });
        http.get('/api/store_configurations_list?app=' + name + '&conf_type=Template').then(res=>{
            this.setState({
                addTempList: res.data
            });
        });
        this.setState({
            flag: false,
            // item: val,
            detail: true,
            config: config,
            deviceColumns: obj,
            keys: keys,
            app: name
        });
        if (this.props.match.params.type === '2') {
            this.setState({
                flag: false,
                detail: false
            });
            this.props.store.codeStore.setActiveKey('2')
        }
        this.props.store.codeStore.setInstallConfiguration(conf === null ? '{}' : conf);
        this.props.store.codeStore.setActiveKey(conf === null ? '2' : '1');
    };

    submitData = ()=>{
        let sn = this.props.match.params.sn;
        if (this.props.store.codeStore.instNames === '' || this.props.store.codeStore.instNames === undefined) {
            message.error('实例名不能为空！');
            return false;
        }
        const data = {
          gateway: sn,
          inst: this.props.store.codeStore.instNames,
          conf: this.props.store.codeStore.installConfiguration,
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
    render () {
      const { loading, config, deviceColumns, keys } = this.state;
      const { toggle } = this.props.store.appStore;
        return (
            <div>
                <div className={toggle ? 'show' : 'hide'}>
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
                          />
                        )
                      }}
                  />
                </div>
                <div
                    className={toggle ? 'hide' : 'show'}
                    style={{position: 'relative'}}
                >
                  <Button
                      style={{position: 'absolute', right: 10, top: 5, zIndex: 999}}
                      onClick={()=>{
                        this.props.store.appStore.toggle = true;
                      }}
                  >
                    X
                  </Button>
                  <AppConfig
                      config={config}
                      deviceColumns={deviceColumns}
                      keys={keys}
                      submitData={this.submitData}
                  />
                </div>
            </div>
        );
    }
}

export default AppsList;