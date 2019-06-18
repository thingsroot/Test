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
    let item = observable({
        // observable 属性:
        parent: null,
        title: title,
        isLeaf: isLeaf,
        type: type,
        key: key,
        icon: icon,
        children: [],

        setKey (value) {
            this.key = value
        },
        setTitle (value) {
            this.title = value
        },
        setValue (value) {
            this.title = value.text
            this.isLeaf = !value.children
            this.type = value.type
            this.key = value.id,
                this.icon = value.icon.substr(value.icon.indexOf('.') + 1, value.icon.length)
        },
        addChild (item) {
            item.parent = this
            this.children.push(item);
        },
        removeChild (item) {
            console.log(item)
            let arr = this.children;
            this.children.map(v => {
                if (v.key !== item.key) {
                    arr.splice(v, 1);
                }
            })
            this.children = arr
        }
    }, {
        setValue: action,
        addChild: action
    });
    return item;
}

const newNodeItemFromData = (value) => {
    return newNodeItem(value.text, !value.children, value.type,  value.id, value.icon.substr(value.icon.indexOf('.') + 1, value.icon.length))
}

@withRouter
@inject('store')
@observer
class MyTree extends Component {
    constructor (props) {
        super(props);
        this.state = {
            expandedKeys: ['#'],
            // expendArr: ['#'],
            autoExpandParent: true,
            root: [],
            selectedKeys: ['version'],
            app: '',
            appName: '',
            selectedNodeData: {},
            newInputValue: '',
            showNewFileModal: false,
            showNewFolderModal: false,
            showRenameModal: false
        }
    }

    componentDidMount () {
        if (this.props.app === undefined || this.props.app === '') {
            return
        }
        this.setState({
            app: this.props.app,
            appName: this.props.appName,
            // expandedKeys: [this.props.appName],
            root: []
        }, () => {
            this.loadTree()
        })
    }

    UNSAFE_componentWillReceiveProps (nextProps) {
        if (this.state.app !== nextProps.app) {
            this.setState({
                app: nextProps.app,
                appName: nextProps.appName,
                expandedKeys: ['#'],
                root: []
            }, () => {
                this.loadTree()
            })
        } else {
            // this.setState({
            //     expandedKeys: this.state.expendArr
            // })
        }
    }
    loadTree () {
        if (this.state.app === '') {
            return
        }
        let data = [];
        data.push(newNodeItem(this.state.appName, false, 'folder', '#', 'folder'))
        this.setState({app: this.state.app, root: data}, () => {
            this.load()
        })
    }

    load = () => {
        this.loadChild(this.state.app, this.state.root[0])
    };

    loadChild = (app, item) => {
        http.get('/apis/api/method/app_center.editor.editor?app=' + app + '&operation=get_node&id=' + item.key)
            .then(res=>{
                if (app !== this.state.app) {
                    // In case the application is changed during fetching.
                    return
                }

                res.map((v)=>{
                    let child = newNodeItemFromData(v)
                    item.addChild(child)
                    if (!child.isLeaf) {
                        this.loadChild(app, child)
                    }
                });
            });
    }

    findChild = (node, id) => new Promise((resolve => {
        if (node.key === id) {
            console.log('=================')
            console.log(node)
            resolve(node)
        }
        node.children.map((v) => {
            let node = this.findChild(v, id);

            if (node !== undefined) {
                resolve(node)
            }
        })
    }))

    // findNode = (id) => {
    //     this.findChild(this.state.root[0], id).then(node=>{
    //         data = node;
    //     })
    //
    // };

    get SelectedNodeBasePath () {
        if (this.SelectedNodeID === undefined) {
            message.error('没有选中的节点')
        }

        if (this.SelectedNodeID === '#') {
            return ''
        }
        if (this.SelectedNodeType === 'folder') {
            return this.SelectedNodeID + '/'
        } else {
            if (this.SelectedNodeID.indexOf('/') !== -1) {
                return this.SelectedNodeID.substr(0, this.SelectedNodeID.indexOf('/')) + '/'
            } else {
                return ''
            }
        }
    }
    get SelectedNodeBaseNode () {
        if (this.SelectedNodeType === 'folder') {
            return this.state.selectedNodeData
        } else {
            return this.state.selectedNodeData.parent
        }
    }
    get SelectedNodeID (){
        return this.state.selectedNodeData.key
    }
    get SelectedNodeText () {
        return this.state.selectedNodeData.title
    }
    get SelectedNodeType () {
        return this.state.selectedNodeData.type
    }

    onShowNewFile = ()=>{
        if (this.SelectedNodeID === undefined) {
            message.error('请先选择一个目录')
            return
        }
        this.setState({
            showNewFileModal: true,
            newInputValue: ''
        }, ()=> {
            console.log(this.state.newNodeFolder)
        })
    };
    onAddNewFile = ()=>{
        const {app, newInputValue} = this.state
        if (newInputValue === '') {
            this.setState({
                showNewFileModal: false
            });
            return
        }
        // let new_id = this.SelectedNodeBasePath + newInputValue
        let folder_node = this.SelectedNodeBaseNode
        //请求接口
        let url = '/apis/api/method/app_center.editor.editor';
        let params = {
            app: app,
            operation: 'create_node',
            type: 'file',
            id: this.SelectedNodeBasePath,
            text: newInputValue
        };
        http.post(url, params)
            .then(res=>{
                if (res.id.indexOf(params.text) !== -1) {
                    let newItem = newNodeItem( res.text ? res.text : newInputValue, true, 'file', res.id, '' )
                    this.setState({
                        showNewFileModal: false
                    });
                    folder_node.addChild(newItem);
                    message.success('创建文件成功');
                } else {
                    message.error('创建文件失败')
                }
            });
        // this.findChild(this.state.root[0], new_id).then(node=>{
        //     if (node) {
        //         message.error('文件名称重复');
        //         return
        //     }
        //
        // });
    };

    //添加文件夹
    onShowNewFolder = ()=>{
        if (this.SelectedNodeID === undefined) {
            message.error('请先选择一个目录')
            return
        }
        this.setState({
            showNewFolderModal: true,
            newNodeName: ''
        })
    };

    onAddNewFolder = ()=>{
        const {app, newInputValue} = this.state
        if (newInputValue === '') {
            this.setState({
                showNewFolderModal: false
            });
            return
        }
        // let new_id = this.SelectedNodeBasePath + newInputValue
        let folder_node = this.SelectedNodeBaseNode
        let url = '/apis/api/method/app_center.editor.editor';
        let params = {
            app: app,
            operation: 'create_node',
            type: 'folder',
            id: this.SelectedNodeBasePath,
            text: newInputValue
        };
        http.post(url, params)
            .then(res=>{
                if (res.id.indexOf(params.text) !== -1) {
                    let newItem = newNodeItem( res.text ? res.text : newInputValue, false, 'folder', res.id, 'folder' )
                    this.setState({
                        showNewFolderModal: false
                    });
                    folder_node.addChild(newItem);
                    message.success('创建文件夹成功');
                } else {
                    message.error('创建文件夹失败')
                }
            });
        // this.findChild(this.state.root[0], new_id).then(node=>{
        //     if (node) {
        //         message.error('文件夹名称重复');
        //         return;
        //     }
        // })
    };
    //删除节点
    showConfirm = (content)=>{
        if (this.SelectedNodeID === undefined) {
            return
        }
        const to_delete_id = this.SelectedNodeID;
        let folder_node = this.SelectedNodeBaseNode;
        let child_node = this.state.selectedNodeData;
        const delete_node = ()=>{
            let url = '/apis/api/method/app_center.editor.editor';
            let params = {
                app: this.state.app,
                operation: 'delete_node',
                id: to_delete_id,
                type: this.SelectedNodeType
            };
            http.post(url, params)
                .then(res=>{
                    if (res.status === 'OK') {
                        this.deleteNode(folder_node.children, child_node)
                        message.success('删除成功！');
                    } else {
                        message.error('删除失败！')
                    }
                });
        };
        confirm({
            title: `确定要删除${this.SelectedNodeText}[${to_delete_id}]`,
            okText: '确定',
            cancelText: '取消',
            content: content,
            onOk () {
                delete_node()
            },
            onCancel () {}
        });
    };

    deleteNode = (data, delData) => {
        data.map((item, i) => {
            if (delData !== '0') {
                //如果循环的节点数据中有跟你传过来要删的数据delData.key相同的 那就将这条数据丛树节点删掉
                if (item.key === delData.key) {
                    console.log(i)
                    data.splice(i, 1);
                }
            }
            this.setState({
                root: [...this.state.root]
            });
            return data;
        });
    }

    deleteFileShow = ()=>{
        if (this.SelectedNodeID === undefined) {
            return
        }
        if (this.SelectedNodeType === 'folder') {
            this.showConfirm('确认删除此文件夹？')
        } else if (this.SelectedNodeType === 'file') {
            this.showConfirm('确认删除此文件？')
        }
    };

    //编辑文件名称
    onShowEditName = ()=>{
        if (this.SelectedNodeID !== undefined) {
            this.setState({
                showRenameModal: true,
                newInputValue: this.SelectedNodeText
            })
        }
    };
    editorFileHide = ()=>{
        this.setState({
            showRenameModal: false
        })
    };

    onChangeNodeName = ()=>{
        if (this.SelectedNodeID === undefined) {
            this.setState({
                showRenameModal: false
            })
            message.warning('节点不存在')
            return
        }

        let url = '/apis/api/method/app_center.editor.editor';
        let params = {
            app: this.state.app,
            operation: 'rename_node',
            id: this.SelectedNodeID,
            text: this.state.newInputValue
        }
        let cur_node = this.state.selectedNodeData
        http.post(url, params)
            .then(res=>{
                if (res.id.indexOf(params.text) !== -1) {
                    this.state.expandedKeys.push(params.text);
                    this.setState({
                        expandedKeys: [...this.state.expandedKeys]
                    })
                    this.setState({ showRenameModal: false })
                    message.success('更改名称成功')
                    cur_node.setKey(res.id)
                    cur_node.setTitle(params.text)
                } else {
                    message.error('更改名称失败');
                }
            })
            .catch(err=>{
                err;
                message.error('更改名称失败');
            })
    };
    onExpand = (expandedKeys) => {
        this.setState({
            expandedKeys,
            autoExpandParent: false
        });
    };

    onSelect = (selectedKeys, info) => {
        if (info.selected) {
            this.setState({
                selectedKeys,
                selectedNodeData: info.node.props.dataRef
            });
            this.props.onSelect(info.node.props.dataRef)
        } else {
            // this.setState({
            //     selectedKeys: selectedKeys,
            //     selectedNodeID: '',
            //     selectedNodeIDNew: info.node.props.dataRef.text,
            //     selectedNodeType: info.node.props.dataRef.type
            // })
        }
    };

    renderTreeNodes = data =>
        data.map(item => {
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

    onDragEnter = info => {
        console.log(info);
        // expandedKeys 需要受控时设置
        // this.setState({
        //   expandedKeys: info.expandedKeys,
        // });
    };

    onDrop = info => {
        const dropKey = info.node.props.eventKey;
        const dragKey = info.dragNode.props.eventKey;
        const dropPos = info.node.props.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

        const loop = (data, key, callback) => {
            data.forEach((item, index, arr) => {
                if (item.key === key) {
                    return callback(item, index, arr);
                }
                if (item.children) {
                    return loop(item.children, key, callback);
                }
            });
        };
        const data = [...this.state.root];

        // Find dragObject
        let dragObj;
        loop(data, dragKey, (item, index, arr) => {
            arr.splice(index, 1);
            dragObj = item;
        });

        if (!info.dropToGap) {
            // Drop on the content
            loop(data, dropKey, item => {
                item.children = item.children || [];
                // where to insert 示例添加到尾部，可以是随意位置
                item.children.push(dragObj);
            });
        } else if (
            (info.node.props.children || []).length > 0 && // Has children
            info.node.props.expanded && // Is expanded
            dropPosition === 1 // On the bottom gap
        ) {
            loop(data, dropKey, item => {
                item.children = item.children || [];
                // where to insert 示例添加到尾部，可以是随意位置
                console.log(item)
                if (item.type === 'file') {
                    item.children.unshift(dragObj);
                } else {
                    message.error('weizhicuowi')
                }
            });
        } else {
            let ar;
            let i;
            loop(data, dropKey, (item, index, arr) => {
                ar = arr;
                i = index;
            });
            if (dropPosition === -1) {
                ar.splice(i, 0, dragObj);
            } else {
                ar.splice(i + 1, 0, dragObj);
            }
        }

        this.setState({
            root: data
        });
    };

    render () {
        const { onSelect } = this.props;
        onSelect;
        const { root, selectedKeys } = this.state;
        return (
            <div className="fileTree">
                <div className="iconGroup">
                    <p style={{width: '220px'}}>
                        <Icon
                            type="file-add"
                            onClick={this.onShowNewFile}
                        />
                        <Icon
                            type="folder-add"
                            onClick={this.onShowNewFolder}
                        />
                        <Icon
                            type="edit"
                            onClick={this.onShowEditName}
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
                            // draggable
                            // blockNode
                            // onDragEnter={this.onDragEnter}
                            // onDrop={this.onDrop}
                            multiple={false}
                            onExpand={this.onExpand}
                            expandedKeys={this.state.expandedKeys}
                            onSelect={this.onSelect}
                            selectedKeys={selectedKeys}
                          >
                            {this.renderTreeNodes(root)}
                        </Tree> : ''
                    }
                </div>
                <Modal
                    title="新建文件"
                    visible={this.state.showNewFileModal}
                    onOk={this.onAddNewFile}
                    onCancel={()=> {
                        this.setState({
                            showNewFileModal: false
                        })
                    }}
                    okText="确认"
                    cancelText="取消"
                >
                    <span style={{padding: '0 20px'}}>文件名</span>
                    <Input
                        type="text"
                        value={this.state.newInputValue}
                        onChange={(e) => {
                            this.setState({newInputValue: e.target.value})
                        }}
                        style={{ width: 350 }}
                    />
                </Modal>
                <Modal
                    title="更改名称"
                    visible={this.state.showRenameModal}
                    onOk={this.onChangeNodeName}
                    onCancel={()=> {
                        this.setState({
                            showRenameModal: false
                        })
                    }}
                    okText="确认"
                    cancelText="取消"
                >
                    <span style={{padding: '0 20px'}}>重命名</span>
                    <Input
                        type="text"
                        value={this.state.newInputValue}
                        onChange={(e) => {
                            this.setState({newInputValue: e.target.value})
                        }}
                        style={{ width: 350 }}
                    />
                </Modal>
                <Modal
                    title="新建文件夹"
                    visible={this.state.showNewFolderModal}
                    onOk={this.onAddNewFolder}
                    onCancel={()=> {
                        this.setState({
                            showNewFolderModal: false
                        })
                    }}
                    okText="确认"
                    cancelText="取消"
                >
                    <span style={{padding: '0 20px'}}>文件夹名</span>
                    <Input
                        type="text"
                        value={this.state.newInputValue}
                        onChange={(e) => {
                            this.setState({newInputValue: e.target.value})
                        }}
                        style={{ width: 350 }}
                    />
                </Modal>
            </div>
        );
    }
}

export default MyTree;
