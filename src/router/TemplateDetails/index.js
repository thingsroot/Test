import React, { PureComponent } from 'react';
import { inject, observer} from 'mobx-react';
import Papa from 'papaparse';
import Wps from './Wps';
import { Select, Button, Upload, Icon, Modal, message } from 'antd';
import { CSVLink } from 'react-csv';
import http from '../../utils/Server';
import './style.scss';
import CopyForm from '../AppDetails/CopyForm'
import intl from 'react-intl-universal';
// import CopyForm from '../AppDetails/CopyForm';

const Dragger = Upload.Dragger;
const Option = Select.Option;
const none = {
    display: 'none'
};
const block = {
    display: 'block',
    maxHeight: '560px',
    overflow: 'auto'
};

@inject('store')
@observer
class MyTemplateDetails extends PureComponent {
    constructor () {
        super();
        this.state = {
            app: '',
            conf: '',
            conf_info: {},
            show_version: 0,
            action: '',
            content: '',  //数据原型
            csvData: '',  //csv数据
            versionList: [],   //版本号列表
            visible: false,
            visibleClone: false,
            visibleEdit: false,
            dataList: [],    //版本信息列表
            file: '',        //文件流
            previewData: '',  //预览数据原型
            previewCsvData: '', //预览csv数据
            maxVersion: 0,
            edit_template_visible: false, //显示编辑wps,
            newVersion: 0
        }
    }
    componentDidMount () {
        this.UpdateFetchData()
    }
    UpdateFetchData = () => {
        let app = this.props.match.params.app;
        let conf = this.props.match.params.name;
        // let version = this.props.match.params.version
        let action = this.props.match.params.action;
        // if (version === undefined) {
        //     version = 0
        // } else {
        //     version = Number(version) ? Number(version) : 0
        // }
        this.setState({
            app: app,
            conf: conf,
            // show_version: version,
            action: action
        }, ()=>{
            this.fetchInfo();
        });
    }
    fetchInfo (){
        http.get('/api/configurations_read?name=' + this.state.conf).then( res=> {
            if (res.ok) {
                this.setState({conf_info: res.data})
                this.getVersionList()
            } else {
                message.error(`${intl.get('templatedetails.unable_to_get_configuration_information')}: ` + res.error)
                this.props.history.push('/')
            }
        }).catch((err)=>{
            err;
            message.error(intl.get('templatedetails.failed_to_read_template_information'))
            this.props.history.push('/')
        })
    }

    getVersionList (){
        http.get('/api/configurations_versions_list?conf=' + this.state.conf)
            .then(res=>{
                let list = [];
                res.data && res.data.length > 0 && res.data.map((v)=>{
                    list.push(v.version);
                });
                if (list.length > 0) {
                    let show_version = list[0]
                    this.setState({
                        versionList: list,
                        maxVersion: list[0],
                        newVersion: list[0],
                        show_version: show_version,
                        dataList: res.data
                    });
                    this.getDetails(show_version);
                }
            });
    }

    getDetails = (version)=>{
        let { dataList } = this.state;
        dataList && dataList.length > 0 && dataList.map((v, key)=>{
            key;
            if (v.version === version) {
                let results = Papa.parse(v.data);
                this.setState({
                    content: v.data,
                    csvData: results.data
                }, ()=>{
                    if (this.state.action === 'clone') {
                        this.setState({visibleClone: true})
                    }
                });
            }
        })
    };

    fileChang = (info)=>{
        this.setState({
            file: info.file.originFileObj,
            previewCsvData: ''
        }, ()=>{
            this.openFile(info.file.originFileObj)
        });
    };

    openFile = (file)=>{
        let reader = new FileReader();
        let data1 = '';
        reader.onload = function () {
            data1 = this.result;
        };
        setTimeout(()=>{
            this.setState({
                previewData: data1,
                previewCsvData: Papa.parse(data1).data
            })
        }, 100);
        reader.readAsText(file);
    };

    onVersionChange = (value) => {
        this.setState({
            maxVersion: value,
            show_version: value
        });
        this.getDetails(value);
    };

    showModal = () => {
        this.setState({
            visible: true
        });
    };
    showCloneModal = () => {
        this.setState({
            visibleClone: true
        })
    }

    handleOk = (e) => {
        e;
        let maxVersion = this.state.maxVersion + 1;
        let params = {
            conf: this.props.match.params.name,
            version: maxVersion,
            comment: 'V' + maxVersion,
            data: this.state.previewData
        };
        http.post('/api/configurations_versions_create', params)
            .then(res=>{
                res;
                if (res.ok) {
                    this.onVersionChange(res.data.version)
                    message.success('上传新版本成功！');
                    setTimeout(()=>{
                        this.setState({
                            visible: false,
                            previewCsvData: []
                        });
                    }, 500);
                    this.getVersionList(this.state.conf)
                }
            })
            .catch(err=>{
                console.log(err)
            });
    };

    handleCancel = () => {
        this.setState({
            visible: false
        });
    };
    handleCloneSuccess = (conf_info) => {
        this.props.history.push('/template/' + conf_info.app + '/' + conf_info.name + '/1')
        this.UpdateFetchData()
    }
    closeWps = () => {
        this.setState({edit_template_visible: false})
        this.UpdateFetchData()
    }
    render () {
        const { conf_info, content, csvData, versionList, previewCsvData, show_version, edit_template_visible } = this.state;
        return (
            <div className="MyTemplateDetails">
                <div className="title">
                    <div>
                        <span>{intl.get('common.name')}:</span>
                        {conf_info.conf_name}
                        <span style={{paddingLeft: '50px'}}>{intl.get('appdetails.owner')}:</span>
                        {conf_info.developer}
                        <span style={{paddingLeft: '50px'}}>{intl.get('appdetails.version_list')}：</span>
                        <Select
                            disabled={versionList.length > 0 ? false : true}
                            value={show_version}
                            style={{ width: '100px' }}
                            onChange={this.onVersionChange}
                        >
                            {
                                versionList && versionList.length > 0 && versionList.map((province, key) => {
                                    return (
                                        <Option
                                            value={province}
                                            key={key}
                                        >{province}</Option>
                                    )
                                })
                            }
                        </Select>
                        <span style={{paddingLeft: '50px'}}>{intl.get('templatedetails.correlation_application')}：{conf_info.app}</span>
                    </div>
                    <div>
                        <Button
                            style={this.state.conf_info.developer === this.props.store.session.user_id ? {display: 'inline-block', marginRight: '20px'} : {display: 'none', marginRight: '20px'}}
                            onClick={()=>{
                                this.setState({visibleEdit: true})
                            }}
                        >
                            {intl.get('appdetails.settings')}
                        </Button>
                        <Button
                            style={this.state.conf_info.developer === this.props.store.session.user_id ? {display: 'inline-block', marginRight: '20px'} : {display: 'none', marginRight: '20px'}}
                            onClick={()=>{
                                this.setState({edit_template_visible: true})
                            }}
                        >
                            {intl.get('appdetails.edit')}
                        </Button>
                        <Button
                            style={this.state.conf_info.developer === this.props.store.session.user_id ? {display: 'inline-block'} : {display: 'none'}}
                            onClick={this.showModal}
                        >{intl.get('common.upload')}</Button>
                        <Button
                            style={this.state.conf_info.developer !== this.props.store.session.user_id ? {display: 'inline-block'} : {display: 'none'}}
                            onClick={this.showCloneModal}
                        >{intl.get('appdetails.clone')}</Button>
                        <span style={{padding: '10px'}}></span>
                        <Button
                            type="primary"
                            disabled={versionList.length > 0 ? false : true}
                        >
                            <CSVLink
                                data={content}
                                filename={conf_info.app + '-' + conf_info.name + '-' + show_version + '.csv'}
                            >{intl.get('common.download')}</CSVLink>
                        </Button>
                        <span style={{padding: '10px'}}></span>
                        <Icon
                            style={{fontSize: 18}}
                            type="rollback"
                            onClick={()=>{
                                this.props.history.go(-1)
                            }}
                        />
                    </div>

                </div>
                <div
                    className="main"
                    style={versionList.length > 0 ? block : none}
                >
                    <table
                        style={{minWidth: '100%'}}
                        border="1"
                    >
                        <tbody>
                            {
                                csvData && csvData.length > 0
                                ? csvData.map((v, key)=>{
                                    if (v.length > 1) {
                                        return <tr key={key}>
                                            {
                                                v && v.length > 0 && v.map((w, key)=>{
                                                    return (
                                                        <td
                                                            key={key}
                                                            style={{width: '100px', padding: '10px', whiteSpace: 'nowrap'}}
                                                        >
                                                    {w}
                                                    </td>
                                                    )
                                                })
                                            }
                                        </tr>
                                    }
                                })
                                : <tr></tr>
                            }
                        </tbody>
                    </table>
                </div>
                <div
                    style={versionList.length > 0 ? none : block}
                >
                    <p className="empty">{intl.get('templatedetails.the_current_template_does_not_contain_data')}</p>
                </div>
                <Modal
                    title={intl.get('appdetails.upload_new_version')}
                    visible={this.state.visible}
                    okText={intl.get('common.sure')}
                    cancelText={intl.get('common.cancel')}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    wrapClassName={'web'}
                >
                    <div style={previewCsvData.length > 0
                        ? {opacity: '0', position: 'absolute', width: '90%', height: '80%', left: '5%', top: '0'}
                        : {width: '90%', height: '80%', display: 'block', position: 'relative', zIndex: '999', left: '5%'}}
                    >
                        <Dragger
                            style={{width: '100%'}}
                            accept=".csv"
                            onChange={this.fileChang}
                        >
                            <div
                                style={{position: 'absolute', top: '0px', left: '0px', width: '100%', height: '100%', padding: '16px', opacity: previewCsvData.length > 0 ? '0' : '1'}}
                                onClick={(e)=>{
                                    if (previewCsvData.length > 0) {
                                        e.stopPropagation()
                                    }
                                    return false;
                                }}
                            >
                                <p
                                    className="ant-upload-drag-icon"
                                    style={{marginTop: '175px'}}
                                >
                                    <Icon type="inbox" />
                                </p>
                                <p className="ant-upload-text">{intl.get('templatedetails.drag_the_file_here_or_click_Add')}</p>
                            </div>
                        </Dragger>
                    </div>
                    <div style={previewCsvData.length > 0
                        ? {width: '100%', height: '100%', overflow: 'auto', display: 'block', zIndex: '0'}
                        : {display: 'none'}}
                    >
                        <table
                            style={{minWidth: '100%'}}
                            border="1"
                        >
                            <tbody>
                            {
                                previewCsvData && previewCsvData.length > 0
                                ? previewCsvData.map((v, key)=>{
                                    if (v.length > 1) {
                                        return (
                                            <tr key={key}>
                                                {
                                                    v && v.length > 0 && v.map((w, key)=>{
                                                        return (
                                                            <td
                                                                key={key}
                                                                style={{width: '100px', padding: '10px', whiteSpace: 'nowrap'}}
                                                            >
                                                                {w}
                                                            </td>
                                                        )
                                                    })
                                                }
                                            </tr>
                                        )
                                    }
                                })
                                : <tr></tr>
                            }
                            </tbody>
                        </table>
                    </div>
                    <Upload
                        className="resetCsv"
                        style={previewCsvData.length > 0 ? {display: 'block'} : {display: 'none'}}
                        onChange={this.fileChang}
                        accept=".csv"
                    >
                        <Button>
                            <Icon type="upload" /> {intl.get('templatedetails.Re-election_file')}
                        </Button>
                    </Upload>
                </Modal>
                <CopyForm
                    type={intl.get('appdetails.copy')}
                    conf={this.state.conf}
                    visible={this.state.visibleClone}
                    onCancel={() => {
                        this.setState({visibleClone: false})
                    }}
                    onOK={() => {
                        this.setState({visibleClone: false})
                    }}
                    onSuccess={this.handleCloneSuccess}
                    app={this.state.app}
                    copyData={conf_info}
                    csvData={csvData}
                />
                <CopyForm
                    type={intl.get('appdetails.edit')}
                    conf={this.state.conf}
                    visible={this.state.visibleEdit}
                    onCancel={() => {
                        this.setState({visibleEdit: false})
                    }}
                    onOK={() => {
                        this.setState({visibleEdit: false})
                    }}
                    onSuccess={this.handleCloneSuccess}
                    app={this.state.app}
                    copyData={conf_info}
                    csvData={csvData}
                />
                {
                    edit_template_visible
                    ? <div
                        className="edit_template_wps"
                      >
                        <Button
                            className="edit_template_wps_close"
                            type="link"
                            onClick={this.closeWps}
                        >
                            关闭
                        </Button>
                        <Wps
                            version={this.state.maxVersion}
                            newVersion={this.state.newVersion}
                        />
                    </div>
                    : ''
                }
            </div>
        );
    }
}

export default MyTemplateDetails;
