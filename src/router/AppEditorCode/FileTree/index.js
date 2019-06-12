import React, { Component } from 'react';
import {observable, action} from 'mobx'
import { withRouter } from 'react-router-dom';
import { Tree, Icon, Modal, message, Input } from 'antd';
import { observer, inject } from 'mobx-react';
import http from '../../../utils/Server';

const confirm = Modal.confirm;
const { TreeNode } = Tree;
const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1206200_whqt6igvsx.js'// 在 iconfont.cn 上生成
});

const newNodeItem = (title, isLeaf, type, key, icon) => {
    var item = observable({
        // observable 属性:
        title: title,
        isLeaf: isLeaf,
        type: type,
        key: key,
        icon: icon,
        children: [],

        addChild (item) {
            this.children.push(item)
        }
    }, {
        setData: action,
        addChild: action
    });
    return item;
}

@withRouter
@inject('store')
@observer
class MyTree extends Component {
    constructor (props) {
        super(props);
        this.state = {
            expandedKeys: [],
            autoExpandParent: true,
            root: []
        }
    }

    componentDidMount () {
        this.updateProps(this.props)
    }

    UNSAFE_componentWillReceiveProps (nextProps) {
        if (this.state.app !== nextProps.app) {
            this.updateProps(nextProps)
        }
    }
    updateProps (props) {
        let data = []
        data.push(newNodeItem(props.appName, false, 'folder', '#', 'folder'))
        this.setState({app: props.app, root: data}, () => {
            this.load()
        })
    }

    load = () => {
        this.loadChild(this.state.app, this.state.root[0])
    }

    newItem (value) {
        return newNodeItem( value.text, !value.children, value.type,  value.id, value.icon.substr(value.icon.indexOf('.') + 1, value.icon.length))
    }

    loadChild = (app, item) => {
        http.get('/apis/api/method/app_center.editor.editor?app=' + app + '&operation=get_node&id=' + item.key)
            .then(res=>{
                if (app !== this.state.app) {
                    // In case the application is changed during fetching.
                    return
                }

                res.map((v)=>{
                    let child = this.newItem(v)
                    item.addChild(child)
                    if (!child.isLeaf) {
                        this.loadChild(app, child)
                    }
                });
            });
    }

    //添加文件
    addFile = ()=>{
        const {codeStore} = this.props;
        let myFolder = codeStore.myFolder[0];
        if (myFolder === this.state.appName) {
            myFolder = '/'
        }
        if (codeStore.addFileName !== '') {
            let url = '/apis/api/method/app_center.editor.editor';
            http.get(url + '?app=' + this.state.app + '&operation=create_node&type=file&id=' +
                myFolder + '&text=' + codeStore.addFileName)
                .then(res=>{
                    let newData = {
                        title: codeStore.addFileName,
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
        const {codeStore} = this.props;
        if (codeStore.folderType === 'folder') {
            this.setState({
                isAddFileShow: true
            })
        } else {
            message.warning('请先选择目录！')
        }

    };
    addFileName = ()=>{
        const {codeStore} = this.props;
        codeStore.setAddFileName(event.target.value );
    };

    //添加文件夹
    addFolderShow = ()=>{
        const {codeStore} = this.props;
        if (codeStore.folderType === 'folder') {
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
        const {codeStore} = this.props;
        codeStore.setAddFolderName(event.target.value)
    };
    addFolder = ()=>{
        const {codeStore} = this.props;
        let myFolder = codeStore.myFolder[0];
        if (codeStore.addFolderName !== '') {
            let url = '/apis/api/method/app_center.editor.editor';
            if (myFolder === this.state.appName) {
                myFolder = '/'
            }
            http.get(url + '?app=' + this.state.app + '&operation=create_node&type=folder&id=' +
                myFolder + '&text=' + codeStore.addFolderName)
                .then(res=>{
                    res;
                    let newData = {
                        children: [],
                        title: codeStore.addFolderName,
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
        const {codeStore} = this.props;
        const pro = ()=>{
            return new Promise(() => {
                let myFolder = codeStore.myFolder[0];
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
        const {codeStore} = this.props;
        if (codeStore.folderType === 'folder') {
            this.showConfirm('确认删除此文件夹？')
        } else if (codeStore.folderType === 'file') {
            this.showConfirm('确认删除此文件？')
        } else if (codeStore.folderType === '') {
            message.warning('请选择文件！')
        }
    };

    //编辑文件名称
    editorFileShow = ()=>{
        const {codeStore} = this.props;
        if (codeStore.folderType) {
            this.setState({
                isEditorFileShow: true
            })
        } else if (!codeStore.folderType) {
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
        const {codeStore} = this.props;
        let myFolder = codeStore.myFolder[0];
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
    onExpand = (expandedKeys) => {
        this.setState({
            expandedKeys,
            autoExpandParent: false
        });

    };

    renderTreeNodes = data =>
        data.map(item => {
            console.log(item.icon);
            if (item.children) {

                return (
                    <TreeNode
                        icon={
                            <MyIcon
                                style={{fontSize: 20}}
                                type={'icon-' + item.icon}
                            />
                        }
                        title={item.title}
                        key={item.key}
                        isLeaf={item.isLeaf}
                        dataRef={item}
                    >
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return (
                <TreeNode
                    icon={
                        <MyIcon
                            style={{fontSize: 20}}
                            type={item.icon !== 'file file-' ? 'icon-' + item.icon : 'icon-no'}
                        />
                    }
                    title={item.title}
                    key={item.key}
                    isLeaf={item.isLeaf}
                    dataRef={item}
                />
            );
        });

    render () {
        const { selectedKeys, onSelect } = this.props;
        const { root } = this.state
        return (
            <div>
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
                </div>
                <div>
                    {
                        root.length > 0
                        ? <Tree
                            showIcon
                            onExpand={this.onExpand}
                            expandedKeys={this.state.expandedKeys}
                            onSelect={onSelect}
                            selectedKeys={selectedKeys}
                          >
                            {this.renderTreeNodes(root)}
                        </Tree> : ''
                    }
                </div>
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
            </div>
        );
    }
}

export default MyTree;
