import React, { PureComponent } from 'react';
import Papa from 'papaparse';
import { Select, Button, Upload, Icon, Modal, message } from 'antd';
import { CSVLink } from 'react-csv';
import http from '../../utils/Server';
import './style.scss';
const Dragger = Upload.Dragger;
const Option = Select.Option;

class MyTemplateDetails extends PureComponent {
    constructor () {
        super();
        this.state = {
            conf: '',
            content: '',  //数据原型
            csvData: '',  //csv数据
            versionList: [],   //版本号列表
            confName: '',    //关联应用名称
            visible: false,
            dataList: [],    //版本信息列表
            file: '',        //文件流
            previewData: '',  //预览数据原型
            previewCsvData: '', //预览csv数据
            maxVersion: ''
        }
    }
    componentDidMount () {
        let conf = this.props.match.params.name;
        this.setState({
            conf: conf
        });
        this.getVersionList(conf);
    }
    getVersionList = (conf)=>{
        http.get('/api/configurations_versions_list?conf=' + conf)
            .then(res=>{
                let list = [];
                res.data && res.data.length > 0 && res.data.map((v)=>{
                    list.push(v.version);
                });
                this.setState({
                    versionList: list,
                    maxVersion: list[0],
                    dataList: res.data,
                    csvData: Papa.parse(res.data[0].data).data
                });
                this.getDetails(list[0]);
            });
    };

    getDetails = (version)=>{
        let { dataList } = this.state;
        dataList && dataList.length > 0 && dataList.map((v, key)=>{
            key;
            if (v.version === version) {
                let results = Papa.parse(v.data);
                this.setState({
                    content: v.data,
                    csvData: results.data
                });
            }
        })
    };

    fileChang = (info)=>{
        this.setState({
            file: info.file.originFileObj
        });
        this.openFile(info.file.originFileObj)
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
            maxVersion: value
        });
        this.getDetails(value);
    };

    showModal = () => {
        this.setState({
            visible: true
        });
    };

    handleOk = (e) => {
        e;
        let maxVersion = this.state.maxVersion + 1;
        let params = {
            name: this.props.match.params.name,
            version: maxVersion,
            comment: 'V' + maxVersion,
            data: this.state.previewData
        };
        http.post('/api/configurations_versions_create', params)
            .then(res=>{
                res;
                message.success('上传新版本成功！');
                setTimeout(()=>{
                    this.setState({
                        visible: false,
                        previewCsvData: []
                    });
                }, 500);
                this.getVersionList(this.state.conf)
            })
            .catch(err=>{
                console.log(err)
            });

    };

    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false
        });
    };

    render () {
        const {content, csvData, versionList, confName, previewCsvData, maxVersion} = this.state;
        return (
            <div className="MyTemplateDetails">
                <div className="title">
                    <div>
                        <span>版本列表：</span>
                        {console.log(maxVersion)}
                        <Select
                            value={maxVersion}
                            style={{ width: 220 }}
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
                        <span style={{paddingLeft: '50px'}}>关联应用：</span>
                        <span>{confName}</span>
                    </div>
                    <div>
                        <Button onClick={this.showModal}>上传新版本</Button>
                        <span style={{padding: '10px'}}></span>
                        <Button type="primary">
                            <CSVLink data={content}>下载到本地</CSVLink>
                        </Button>

                    </div>
                </div>
                <div
                    className="main"
                    style={{maxHeight: '560px', overflow: 'auto'}}
                >
                    <table
                        style={{minWidth: '100%'}}
                        border="1"
                    >
                        <tbody>
                            {
                                csvData && csvData.length > 0 && csvData.map((v, key)=>{
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
                            }
                        </tbody>
                    </table>
                </div>
                <Modal
                    title="上传新版本"
                    visible={this.state.visible}
                    okText="确定"
                    cancelText="取消"
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    wrapClassName={'web'}
                >
                    <div style={previewCsvData.length > 0
                        ? {display: 'none'}
                        : {width: '100%', height: '390px', display: 'block'}}
                    >
                        <Dragger
                            style={{width: '100%', height: '600px'}}
                            accept=".csv"
                            onChange={this.fileChang}
                        >
                            <p className="ant-upload-drag-icon">
                                <Icon type="inbox" />
                            </p>
                            <p className="ant-upload-text">将文件拖拽至此或点击添加</p>
                        </Dragger>
                    </div>
                    <div style={previewCsvData.length > 0
                        ? {width: '100%', height: '390px', overflow: 'auto', display: 'block'}
                        : {display: 'none'}}
                    >
                        <table
                            style={{minWidth: '100%'}}
                            border="1"
                        >
                            {
                                previewCsvData && previewCsvData.length > 0 && previewCsvData.map((v, key)=>{
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
                            }
                        </table>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default MyTemplateDetails;