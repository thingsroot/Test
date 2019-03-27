import React, { PureComponent } from 'react';
import Papa from 'papaparse';
import { Select, Button, Upload, Icon, message, Modal } from 'antd';
import { CSVLink } from 'react-csv';
import http from '../../utils/Server';
import './style.scss';

const Dragger = Upload.Dragger;
const Option = Select.Option;
const props = {
    name: 'file',
    multiple: false,
    action: '//jsonplaceholder.typicode.com/posts/',
    onChange (info) {
        const status = info.file.status;
        if (status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (status === 'done') {
            message.success(`${info.file.name} 上传成功.`);
        } else if (status === 'error') {
            message.error(`${info.file.name} 上传失败.`);
        }
    },
    onPreview (file) {
        console.log(file)
    }
};

class MyTemplateDetails extends PureComponent {
    constructor () {
        super();
        this.state = {
            content: '',
            csvData: '',
            versionList: [],
            select: '',
            confName: '',
            visible: false
        }
    }
    componentDidMount () {
        let version = this.props.match.params.version;
        this.getDetails(version);
        http.get('/api/method/conf_center.api.get_versions?conf=' + this.props.match.params.name)
            .then(res=>{
                let list = [];
                res.message && res.message.length > 0 && res.message.map((v)=>{
                    list.push(v.version);
                });
                this.setState({
                    versionList: list
                })

            });
        http.get('/api/method/conf_center.api.app_conf_detail?name=' + this.props.match.params.name)
            .then(res=>{
                this.setState({
                    confName: res.message.app_name
                })
            })
    }
    getDetails = (version)=>{
        http.get('/api/method/conf_center.api.app_conf_data?app=' + this.props.match.params.app +
            '&conf=' + this.props.match.params.name + '&version=' + version)
            .then(res=>{
                let results = Papa.parse(res.message.data);
                this.setState({
                    content: res.message.data,
                    csvData: results.data
                });
            });
    };

    onVersionChange = (value) => {
        console.log(value);
        this.getDetails(value);
    };
    showModal = () => {
        this.setState({
            visible: true
        });
    };

    handleOk = (e) => {
        console.log(e);
        this.setState({
            visible: false
        });
    };

    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false
        });
    };

    render () {
        const {content, csvData, versionList, confName} = this.state;
        return (
            <div className="MyTemplateDetails">
                <div className="title">
                    <div>
                        <span>版本列表：</span>
                        <Select
                            defaultValue={this.props.match.params.version}
                            style={{ width: 220 }}
                            onChange={this.onVersionChange}
                        >
                            {
                                versionList && versionList.length > 0 && versionList.map((province, key) => <Option value={province} key={key}>{province}</Option>)
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
                                            return <td
                                                key={key}
                                                style={{width: '100px', padding: '10px', whiteSpace: 'nowrap'}}
                                            >
                                                {w}
                                            </td>
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
                    <Dragger
                        style={{width: '1000px', height: '600px'}}
                        accept=".csv"
                        onPreview={this.onPreview}
                        {...props}
                    >
                        <p className="ant-upload-drag-icon">
                            <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">将文件拖拽至此或点击添加</p>
                    </Dragger>
                </Modal>
            </div>
        );
    }
}

export default MyTemplateDetails;