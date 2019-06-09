import React, { Component } from 'react';
import { Icon, Modal, Select, message, Input } from 'antd';
import { withRouter } from 'react-router-dom';
import { inject, observer} from 'mobx-react';
import FileTree from './FileTree';
import CodeEditor from './Editor';
import './style.scss';
import http from '../../utils/Server';
const Option = Select.Option;
const { TextArea } = Input;
const confirm = Modal.confirm;

@withRouter
@inject('store')
@observer
class AppEditorCode extends Component {
    constructor (props){
        super(props);
        this.state = {
            app: '',
            fontSize: 16,
            appName: '',
            version: '',
            visible: false,
            newVersion: 0,
            isShow: false,
            optionData: [],
            comment: '',
            editorFileName: '',
            isAddFileShow: false,
            isAddFolderShow: false,
            isEditorFileShow: false,
            arr: [],
            a: 1,
            selectedKeys: ['version'],
            treeNode: {}
        }
    }
    componentDidMount () {
        let app = this.props.match.params.app;
        let appName = this.props.match.params.name;
        this.setState({
            appName: appName,
            app: app
        });
        //设备应用和平台应用对比
        http.get('/apis/api/method/app_center.editor.editor_worksapce_version?app=' + app)
            .then(res=>{
                let worksapceVersion = res.message;
                if (worksapceVersion && worksapceVersion !== 'undefined') {
                    http.get('/apis/api/method/app_center.api.get_latest_version?app=' + app + '&beta=' + 1)
                        .then(data=>{
                            let lastVersion = data.message;
                            console.log(lastVersion);
                            if (worksapceVersion !== lastVersion) {
                                //提示当前工作区是会基于worksapceVersion，当前的最新版本为latest_version（弹框）
                                this.info('版本提示', '当前工作区是会基于版本    ' + worksapceVersion + '，当前的最新版本为    ' + lastVersion + '.');
                                this.setState({
                                    version: worksapceVersion
                                })
                            } else if (worksapceVersion === lastVersion ) {
                                //提示当前工作区是基于最新版本（弹框）
                                this.info('版本提示', '当前工作区是基于最新版本' + lastVersion + '.');
                                this.setState({
                                    version: lastVersion
                                })
                            }
                        });
                } else {
                    http.get('/apis/api/method/app_center.api.get_latest_version?app=' + app + '&beta=' + 1)
                        .then(data=>{
                            if (data.message === 0) {
                                //工作区为空，不显示title（title还没写）
                                //暂时还没有版本，请先上传（全局提示）
                                this.info('版本提示', '暂时还没有版本，请先上传!');
                                this.setState({
                                    version: ''
                                })
                            } else if (data.message > 0 ) {
                                //初始化工作区域到最新版本
                                http.get('/apis/api/method/app_center.editor.editor_init?app=' + app + '&version=' + data.message)
                                    .then(res=>{
                                        let initVersion = res.message;
                                        // console.log(initVersion);
                                        this.setState({
                                            version: initVersion
                                        });
                                        //提示：当前工作区是基于版本initVersion,
                                        // 请将设备中的应用升级到版本initVersion，或者将工作区重置到之前版本。
                                        this.info('版本提示',
                                            '当前工作区是基于版本' + initVersion,
                                            '请将设备中的应用升级到版本' + initVersion,
                                            '或者将工作区重置到之前版本.'
                                        );
                                        window.location.reload();
                                    })
                            }

                        });
                    //http
                }
            });
        //应用版本列表
        http.get('/apis/api/method/app_center.api.get_versions?app=' + app + '&beta=1')
            .then(res=>{
                let data = [];
                res.message && res.message.length > 0 && res.message.map((v)=>{
                    data.push(v.version)
                });
                data.sort(function (a, b) {
                    return b - a;
                });
                let newVersion = data[0] + 1;
                this.setState({
                    optionData: data,
                    newVersion: newVersion,
                    comment: 'v' + newVersion
                })
            });
        this.setState({
            a: 1,
            arr: []
        }, ()=>{
            this.getTree('#')
        });

    }

    getTree =  id => new Promise((resolve => {
        let data = [];
        http.get('/apis/api/method/app_center.editor.editor?app=' + this.props.match.params.app + '&operation=get_node&id=' + id)
            .then(res=>{
                res.map((v)=>{
                    data.push(v);
                });
                resolve(this.format(data, this.state.a))
            });
    }));

    format = (list, a)=>{
        let arr = [];
        list && list.length > 0 && list.map((v, key)=>{
            console.log(v.icon.substr(v.icon.indexOf('.') + 1, v.icon.length));
            key;
            if (v.children === true){
                this.getTree(v.id).then(data=>{
                    let a = {
                        children: data,
                        title: v.text,
                        isLeaf: !v.children,
                        type: v.type,
                        key: v.id,
                        icon: v.icon.substr(v.icon.indexOf('.') + 1, v.icon.length)
                    };
                    arr.push(a);
                })
            } else {
                let a = {
                    title: v.text,
                    isLeaf: !v.children,
                    type: v.type,
                    key: v.id,
                    icon: v.icon.substr(v.icon.indexOf('.') + 1, v.icon.length)
                };
                arr.push(a);
            }
        });
        if (a === 1) {
            let data = [
                {
                    title: this.state.appName,
                    isLeaf: false,
                    type: 'folder',
                    key: this.state.appName,
                    children: arr,
                    icon: 'folder'
                }
            ];
            this.setState({
                arr: data,
                a: this.state.a + 1
            }, ()=>{
                this.props.store.codeStore.setTreeData(this.state.arr);
            });
        }
        this.setState({
            a: this.state.a + 1
        });

        return arr;
    };

    //提示弹框
    info = (title, content)=>{
        Modal.info({
            title: title,
            content: (
                <div>
                    <p>{content}</p>
                </div>
            ),
            onOk () {}
        });
    };
    //+
    zoomIn = ()=>{
        let size = this.state.fontSize - 2;
        this.setState({
            fontSize: size
        })
    };
    //-
    zoomOut = ()=>{
        let size = this.state.fontSize + 2;
        this.setState({
            fontSize: size
        })
    };
    //重置版本
    showModal = () => {
        this.setState({
            visible: true
        });
    };
    hideModal = () => {
        this.setState({
            visible: false
        });
    };
    getVersion = (value)=>{
        this.setState({
            version: value
        });
    };
    resetVersion = ()=>{
        this.setState({
            visible: false
        });
        let url = '/apis/api/method/app_center.editor.editor_revert';
        http.postToken(url + '?app=' + this.state.app + '&operation=set_content&version=' + this.state.version)
            .then(res=>{
                this.props.store.codeStore.change();
                message.success(res.message);
            })
    };
    //重置版本结束
    //保存文件
    saveFile = ()=>{
        if (this.props.store.codeStore.editorContent === this.props.store.codeStore.newEditorContent) {
            message.warning('文件未改动！')
        } else {
            let url = '/apis/api/method/app_center.editor.editor';
            http.postToken(url + '?app=' + this.state.app +
                '&operation=set_content&id=' + this.props.store.codeStore.fileName +
                '&text=' + this.props.store.codeStore.newEditorContent)
                .then(res=>{
                    console.log(res);
                    message.success('文件保存成功！')
                })
        }
    };//保存文件结束

    //发布新版本
    show = () => {
        this.setState({
            isShow: true
        });
    };
    hide = () => {
        this.setState({
            isShow: false
        });
    };
    versionChange = (e)=>{
        const { value } = e.target;
        this.setState({
            newVersion: value
        })
    };
    commentChange = (e)=>{
        const { value } = e.target;
        this.setState({
            comment: value
        })
    };
    newVersion = ()=>{
        http.postToken('/apis/api/method/app_center.editor.editor_release?app=' + this.state.app +
            '&operation=set_content&version=' + this.state.newVersion +
            '&comment=' + this.state.comment)
            .then(res=>{
                message.success(res.message);
            });
        setTimeout(()=>{
            this.setState({
                isShow: false
            });
            this.props.store.codeStore.change();
        }, 1000)
    };

    //添加文件
    addFile = ()=>{
        let myFolder = this.props.store.codeStore.myFolder[0];
        if (myFolder === this.state.appName) {
            myFolder = '/'
        }
        if (this.props.store.codeStore.addFileName !== '') {
            let url = '/apis/api/method/app_center.editor.editor';
            http.get(url + '?app=' + this.state.app + '&operation=create_node&type=file&id=' +
                myFolder + '&text=' + this.props.store.codeStore.addFileName)
                .then(res=>{
                    let newData = {
                        title: this.props.store.codeStore.addFileName,
                        isLeaf: true,
                        type: 'file',
                        key: res.id,
                        icon: 'no'
                    };
                    let treeNode = this.state.treeNode;
                    treeNode.node.props.dataRef.children.push(newData);
                    this.setState({
                        arr: [...this.state.arr]
                    })
                });
            this.addFileHide();
        } else {
            message.warning('请输入文件名！')
        }
    };
    addFileHide = ()=>{
        this.setState({
            isAddFileShow: false
        })
    };
    addFileShow = ()=>{
        if (this.props.store.codeStore.folderType === 'folder') {
            this.setState({
                isAddFileShow: true
            })
        } else {
            message.warning('请先选择目录！')
        }

    };
    addFileName = ()=>{
        this.props.store.codeStore.setAddFileName(event.target.value );
    };

    //添加文件夹

    addFolderShow = ()=>{
        if (this.props.store.codeStore.folderType === 'folder') {
            this.setState({
                isAddFolderShow: true
            })
        } else {
            message.warning('请先选择目录！')
        }
    };
    addFolderHide = ()=>{
        this.setState({
            isAddFolderShow: false
        })
    };
    addFolderName = ()=>{
        this.props.store.codeStore.setAddFolderName(event.target.value)
    };
    addFolder = ()=>{
        let myFolder = this.props.store.codeStore.myFolder[0];
        if (this.props.store.codeStore.addFolderName !== '') {
            let url = '/apis/api/method/app_center.editor.editor';
            if (myFolder === this.state.appName) {
                myFolder = '/'
            }
            http.get(url + '?app=' + this.state.app + '&operation=create_node&type=folder&id=' +
                myFolder + '&text=' + this.props.store.codeStore.addFolderName)
                .then(res=>{
                    res;
                    let newData = {
                        children: [],
                        title: this.props.store.codeStore.addFolderName,
                        isLeaf: false,
                        type: 'folder',
                        key: res.id,
                        icon: 'folder'
                    };
                    let treeNode = this.state.treeNode;
                    console.log(treeNode);
                    treeNode.node.props.dataRef.children.push(newData);
                    this.setState({
                        arr: [...this.state.arr]
                    })
                });
            message.success('创建文件夹成功');
            this.addFolderHide();
        }
    };
    //删除节点
    renderTreeNodes = (data, delData)=>data.map((item, i) => {
        if (delData !== '0') {
            //如果循环的节点数据中有跟你传过来要删的数据delData.key相同的 那就将这条数据丛树节点删掉
            console.log()
            console.log(delData.node.props.dataRef.key)
            if (item.key === delData.node.props.dataRef.key) {
                data.splice(i, 1);
                this.setState({
                    delData: '0'
                });
            }
        }
        if (item.children) {
            this.renderTreeNodes(item.children, this.state.treeNode)
        }
        this.setState({
            arr: data
        });
        return data;
    });

    showConfirm = (content)=>{
        const pro = ()=>{
            return new Promise(() => {
                let myFolder = this.props.store.codeStore.myFolder[0];
                let url = '/apis/api/method/app_center.editor.editor';
                http.get(url + '?app=' + this.state.app + '&operation=delete_node&type=folder&id=' + myFolder)
                    .then(res=>{
                        res;
                        this.renderTreeNodes(this.state.arr, this.state.treeNode);
                    });
            })
        };
        confirm({
            title: '提示信息',
            okText: '确定',
            cancelText: '取消',
            content: content,
            onOk () {
                pro().then(res=>{
                    res;
                    message.success('删除成功！')
                }).catch(req=>{
                    req;
                    message.error('删除失败！')
                })
            },
            onCancel () {}
        });
    };
    deleteFileShow = ()=>{
        if (this.props.store.codeStore.folderType === 'folder') {
            this.showConfirm('确认删除此文件夹？')
        } else if (this.props.store.codeStore.folderType === 'file') {
            this.showConfirm('确认删除此文件？')
        } else if (this.props.store.codeStore.folderType === '') {
            message.warning('请选择文件！')
        }
    };

    //编辑文件名称
    editorFileShow = ()=>{
        if (this.props.store.codeStore.folderType) {
            this.setState({
                isEditorFileShow: true
            })
        } else if (!this.props.store.codeStore.folderType) {
            message.warning('请先选择目录！')
        }
    };
    editorFileHide = ()=>{
        this.setState({
            isEditorFileShow: false
        })
    };
    editorFileName = ()=>{
        this.setState({
            editorFileName: event.target.value
        })
    };
    editorFile = ()=>{
        let myFolder = this.props.store.codeStore.myFolder[0];
        if (this.state.editorFileName !== '') {
            let url = '/apis/api/method/app_center.editor.editor';
            http.get(url + '?app=' + this.state.app + '&operation=rename_node&type=folder&id=' +
                myFolder + '&text=' + this.state.editorFileName)
                .then(res=>{
                    res;
                    let treeNode = this.state.treeNode;
                    treeNode.node.props.dataRef.title = this.state.editorFileName;
                    this.setState({
                        arr: [...this.state.arr]
                    });
                    message.success('编辑文件成功');
                })
                .catch(err=>{
                    err;
                    message.error('编辑文件失败');
                })

            this.addFolderHide();
        } else {
            message.warning('请输入文件名！')
        }
        this.editorFileHide()
    };

    set = (selectedKeys, info)=>{
        this.props.store.codeStore.setEditorContent(this.props.store.codeStore.newEditorContent)
        this.props.store.codeStore.setShowFileName(selectedKeys);
        this.setState({ selectedKeys }, ()=>{
            this.props.store.codeStore.setFileName(this.state.selectedKeys);
        });
        this.props.store.codeStore.setMyFolder(selectedKeys);
        this.props.store.codeStore.setFolderType(info.node.props.dataRef.type);
        if (selectedKeys[0].indexOf('.') !== -1) {
            let suffixName = '';
            switch (selectedKeys[0].substr(selectedKeys[0].indexOf('.') + 1, selectedKeys[0].length)) {
                case 'js' : suffixName = 'javascript'; break;
                case 'html' : suffixName = 'html'; break;
                case 'java' : suffixName = 'java'; break;
                case 'py' : suffixName = 'python'; break;
                case 'lua' : suffixName = 'lua'; break;
                case 'xml' : suffixName = 'xml'; break;
                case 'rb' : suffixName = 'ruby'; break;
                case 'scss' : suffixName = 'sass'; break;
                case 'less' : suffixName = 'sass'; break;
                case 'md' : suffixName = 'markdown'; break;
                case 'sql' : suffixName = 'mysql'; break;
                case 'json' : suffixName = 'json'; break;
                case 'ts' : suffixName = 'typescript'; break;
                case 'css' : suffixName = 'css'; break;
                case '' : suffixName = 'javascript'; break;
                default : suffixName = 'java'
            }
            this.props.store.codeStore.setSuffixName(suffixName);

        } else {
            this.props.store.codeStore.setSuffixName('text');
        }
    }

    onSelect = (selectedKeys, info) => {
        console.log(this.props.store.codeStore.newEditorContent[0]);
        this.setState({
            treeNode: info
        });
        if (selectedKeys.length > 0) {
            if (info.node.props.dataRef.type === 'file') {
                if (this.props.store.codeStore.editorContent === this.props.store.codeStore.newEditorContent){
                    this.set(selectedKeys, info)
                } else {
                    // this.props.store.codeStore.setEditorContent(this.props.store.codeStore.newEditorContent);
                    //保存提示
                    const pro = ()=>{
                        return new Promise(() => {
                            console.log(this.props.store.codeStore.newEditorContent[0])
                            let url = '/apis/api/method/app_center.editor.editor';
                            let params = {
                                app: this.state.app,
                                operation: 'set_content',
                                id: this.props.store.codeStore.fileName,
                                text: this.props.store.codeStore.newEditorContent[0]
                            };
                            http.postToken(url, params)
                                .then(res=>{
                                    res;
                                    this.set(selectedKeys, info)
                                })
                        })
                    };
                    const cancel = ()=>{
                        this.set(selectedKeys, info)
                    };
                    confirm({
                        title: '提示信息',
                        okText: '确定',
                        cancelText: '取消',
                        content: '是否保存当前文件？',
                        onOk () {
                            pro().then(res=>{
                                res;
                                message.success('保存成功！')
                            }).catch(req=>{
                                req;
                                message.error('保存失败！')
                            })
                        },
                        onCancel () {
                            cancel()
                        }
                    });
                }
            } else if (info.node.props.dataRef.type === 'folder') {
                this.setState({ selectedKeys }, ()=>{
                    this.props.store.codeStore.setFileName(this.state.selectedKeys);
                });
                this.props.store.codeStore.setMyFolder(selectedKeys);
                this.props.store.codeStore.setFolderType(info.node.props.dataRef.type);
            }
        }
    };

    render () {
        const {
            fontSize,
            optionData,
            arr,
            app,
            selectedKeys,
            appName
        } = this.state;
        return (
            <div className="appEditorCode">
                <div className="iconGroup">
                    <p style={{width: '220px'}}>
                        <Icon
                            type="file-add"
                            onClick={this.addFileShow}
                        />
                        <Icon
                            type="folder-add"
                            onClick={this.addFolderShow}
                        />
                        <Icon
                            type="edit"
                            onClick={this.editorFileShow}
                        />
                        <Icon
                            type="delete"
                            onClick={this.deleteFileShow}
                        />
                    </p>
                    <p style={{width: 'auto', position: 'resolute'}}>
                        <Icon
                            type="sync"
                            onClick={this.showModal}
                        />
                        <Icon
                            type="zoom-in"
                            onClick={this.zoomOut}
                        />
                        <Icon
                            type="zoom-out"
                            onClick={this.zoomIn}
                        />
                        <Icon
                            type="save"
                            onClick={this.saveFile}
                        />
                        <Icon
                            type="upload"
                            onClick={this.show}
                        />
                        {/*<Icon*/}
                        {/*type="undo"*/}
                        {/*onClick={this.undo}*/}
                        {/*/>*/}
                        {/*<Icon type="redo" onClick={this.keyPress} />*/}
                        <Icon
                            style={{position: 'absolute', right: 60, top: 85}}
                            type="cloud-upload"
                            onClick={()=>{
                                console.log('1')
                            }}
                        />
                        <Icon
                            style={{position: 'absolute', right: 30, top: 85}}
                            type="rollback"
                            onClick={()=>{
                                this.props.history.go(-1)
                            }}
                        />

                    </p>
                </div>
                <div className="main">
                    <div className="tree">
                        <FileTree
                            treeData={arr}
                            getFileName={this.getFileName}
                            app={app}
                            onSelect={this.onSelect}
                            selectedKeys={selectedKeys}
                            appName={appName}
                        />
                    </div>
                    <div className="code">
                        <CodeEditor
                            fontSize={fontSize}
                            showFileName={this.props.store.codeStore.showFileName}
                            isChange={this.props.store.codeStore.isChange}
                        />
                    </div>
                </div>
                <Modal
                    title="重置编辑器工作区内容版本到"
                    visible={this.state.visible}
                    onOk={this.resetVersion}
                    onCancel={this.hideModal}
                    okText="确认"
                    cancelText="取消"
                >
                    <span style={{padding: '0 20px'}}>版本</span>
                    <Select
                        defaultValue="请选择..."
                        style={{ width: 350 }}
                    >
                        {
                            optionData && optionData.length > 0 && optionData.map((v)=>{
                                return (
                                    <Option
                                        key={v}
                                        onClick={()=>{
                                            this.getVersion(v)
                                        }}
                                    >
                                        {v}
                                    </Option>
                                )
                            })
                        }
                    </Select>
                </Modal>
                <Modal
                    title="新建文件"
                    visible={this.state.isAddFileShow}
                    onOk={this.addFile}
                    onCancel={this.addFileHide}
                    okText="确认"
                    cancelText="取消"
                >
                    <span style={{padding: '0 20px'}}>文件名</span>
                    <Input
                        type="text"
                        onChange={this.addFileName}
                        style={{ width: 350 }}
                    />
                </Modal>
                <Modal
                    title="更改文件名"
                    visible={this.state.isEditorFileShow}
                    onOk={this.editorFile}
                    onCancel={this.editorFileHide}
                    okText="确认"
                    cancelText="取消"
                >
                    <span style={{padding: '0 20px'}}>重命名</span>
                    <Input
                        type="text"
                        onChange={this.editorFileName}
                        style={{ width: 350 }}
                    />
                </Modal>
                <Modal
                    title="新建文件夹"
                    visible={this.state.isAddFolderShow}
                    onOk={this.addFolder}
                    onCancel={this.addFolderHide}
                    okText="确认"
                    cancelText="取消"
                >
                    <span style={{padding: '0 20px'}}>文件夹名</span>
                    <Input
                        type="text"
                        onChange={this.addFolderName}
                        style={{ width: 350 }}
                    />
                </Modal>
                <Modal
                    title="发布新版本"
                    visible={this.state.isShow}
                    onOk={this.newVersion}
                    onCancel={this.hide}
                    okText="确认"
                    cancelText="取消"
                >
                    <p style={{display: 'flex'}}>
                        <span style={{padding: '5px 20px'}}>填写版本</span>
                        <Input
                            type="text"
                            defaultValue={this.state.newVersion}
                            style={{width: '320px'}}
                            onChange={this.versionChange}
                        />
                    </p>
                    <br/>

                    <p style={{display: 'flex'}}>
                        <span style={{padding: '0 20px'}}>更新日志</span>
                        <TextArea
                            row={8}
                            style={{width: '320px'}}
                            defaultValue={this.state.comment}
                            onChange={this.commentChange}
                        />
                    </p>
                </Modal>
            </div>
        );
    }
}

export default AppEditorCode;