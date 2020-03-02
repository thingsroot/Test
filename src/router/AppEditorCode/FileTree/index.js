import React, { Component } from 'react';
import {observable, action} from 'mobx'
import { withRouter } from 'react-router-dom';
import { Tree, Icon, Modal, message, Input, Tooltip } from 'antd';
import { observer, inject } from 'mobx-react';
import http from '../../../utils/Server';
import {IconEditor} from '../../../utils/iconfont';
import intl from 'react-intl-universal';

const confirm = Modal.confirm;
const { TreeNode } = Tree;

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
            resolve(node)
        }
        node.children.map((v) => {
            let node = this.findChild(v, id);
            if (node !== undefined) {
                resolve(node)
            }
        })
    }))

    get SelectedNodeBasePath () {
        if (this.SelectedNodeID === undefined) {
            message.error(intl.get('appeditorcode.no_selected_node'))
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
            message.error(intl.get('appeditorcode.please_select_a_directory_first'))
            return
        }
        this.setState({
            showNewFileModal: true,
            newInputValue: ''
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
        let icon = '';
        if (newInputValue.indexOf('.') !== -1) {
            icon = newInputValue.slice(newInputValue.indexOf('.') + 1)
        } else {
            icon = 'no'
        }
        http.post(url, params)
            .then(res=>{
                if (res.id.indexOf(params.text) !== -1) {
                    let newItem = newNodeItem( res.text ? res.text : newInputValue, true, 'file', res.id, icon )
                    this.setState({
                        showNewFileModal: false
                    });
                    folder_node.addChild(newItem);
                    message.success(intl.get('appeditorcode.file_created_successfully'));
                } else {
                    message.error(intl.get('appeditorcode.failed_to_create_file'))
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
            message.error(intl.get('appeditorcode.please_select_a_directory_first'))
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
                    message.success(intl.get('appeditorcode.file_created_successfully'));
                } else {
                    message.error(intl.get('appeditorcode.failed_to_create_file'))
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
                        message.success(intl.get('appeditorcode.delete_successfully'));
                    } else {
                        message.error(intl.get('appeditorcode.delete_failed'))
                    }
                });
        };
        confirm({
            title: `${intl.get('')}${this.SelectedNodeText}[${to_delete_id}]`,
            okText: intl.get('common.sure'),
            cancelText: intl.get('common.cancel'),
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
            this.showConfirm(intl.get(''))
        } else if (this.SelectedNodeType === 'file') {
            this.showConfirm(intl.get('appeditorcode.Are_you_sure_you_want_to_delete_this_file'))
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
            message.warning(intl.get('appeditorcode.node_does_not_exist'))
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
                    message.success(intl.get(''))
                    cur_node.setKey(res.id)
                    cur_node.setTitle(params.text)
                } else {
                    message.error(intl.get('appeditorcode.failed_to_change_name'));
                }
            })
            .catch(err=>{
                err;
                message.error(intl.get('appeditorcode.failed_to_change_name'));
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
            let icon = item.icon;
            if (item.title === 'version') {
                icon =  'txt'
            }
            if (item.children) {
                return (
                    <TreeNode
                        icon={
                            <IconEditor
                                style={{fontSize: 20}}
                                type={'icon-' + icon}
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
                        <IconEditor
                            style={{fontSize: 20}}
                            type={item.icon !== 'file file-' ? 'icon-' + icon : 'icon-no'}
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
                        <Tooltip title={intl.get('appeditorcode.new_file')} >
                            <Icon
                                type="file-add"
                                onClick={this.onShowNewFile}
                            />
                        </Tooltip>
                        <span style={{padding: '0 2px'}} />
                        <Tooltip title={intl.get('appeditorcode.new_folder')} >
                            <Icon
                                type="folder-add"
                                onClick={this.onShowNewFolder}
                            />
                        </Tooltip>
                        <span style={{padding: '0 2px'}} />
                        <Tooltip title={intl.get('appeditorcode.change_file_name')} >
                            <Icon
                                type="edit"
                                onClick={this.onShowEditName}
                            />
                        </Tooltip>
                        <span style={{padding: '0 2px'}} />
                        <Tooltip title={intl.get('appeditorcode.delete_file_name')} >
                            <Icon
                                type="delete"
                                onClick={this.deleteFileShow}
                            />
                        </Tooltip>
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
                    title={intl.get('appeditorcode.new_file')}
                    visible={this.state.showNewFileModal}
                    onOk={this.onAddNewFile}
                    onCancel={()=> {
                        this.setState({
                            showNewFileModal: false
                        })
                    }}
                    okText={intl.get('common.sure')}
                    cancelText={intl.get('common.cancel')}
                >
                    <span style={{padding: '0 20px'}}>{intl.get('appeditorcode.file_name')}</span>
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
                    title={intl.get('appeditorcode.change_nam')}
                    visible={this.state.showRenameModal}
                    onOk={this.onChangeNodeName}
                    onCancel={()=> {
                        this.setState({
                            showRenameModal: false
                        })
                    }}
                    okText={intl.get('common.sure')}
                    cancelText={intl.get('common.cancel')}
                >
                    <span style={{padding: '0 20px'}}>{intl.get('appeditorcode.rename')}</span>
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
                    title={intl.get('appeditorcode.new_folder')}
                    visible={this.state.showNewFolderModal}
                    onOk={this.onAddNewFolder}
                    onCancel={()=> {
                        this.setState({
                            showNewFolderModal: false
                        })
                    }}
                    okText={intl.get('common.sure')}
                    cancelText={intl.get('common.cancel')}
                >
                    <span style={{padding: '0 20px'}}>{intl.get('appeditorcode.folder_name')}</span>
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
