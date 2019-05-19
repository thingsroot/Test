import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Tree } from 'antd';
import { observer, inject } from 'mobx-react';
import http from '../../../utils/Server';
const { TreeNode } = Tree;

// function format (list) {
//     let data = [];
//     for (var i = 0; i < list.length; i++){
//         if (list[i].children){
//             if (list[i].childrenData){
//                 data.push({
//                     title: list[i].text,
//                     key: list[i].id,
//                     type: list[i].type,
//                     isLeaf: false,
//                     children: format(list[i].childrenData)
//                 })
//             }
//         } else {
//             data.push({
//                 title: list[i].text,
//                 key: list[i].id,
//                 type: list[i].type,
//                 isLeaf: true
//             })
//         }
//     }
//     return data;
// }
@withRouter
@inject('store')
@observer
class MyTree extends Component {

    constructor (props) {
        super(props);
        this.state = {
            expandedKeys: [],
            defaultExpandAll: true,
            autoExpandParent: false,
            selectedKeys: ['version'],
            arr: [],
            a: 1
        }
    }
    componentDidMount () {
        this.getTree('#');
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (this.props.isChange !== nextProps.isChange){
            setTimeout(()=>{
                this.getTree('#').then(data=>{
                    console.log(data);
                    this.setState({
                        arr: data
                    })
                });
            }, 0)
        }
    }

    getTree =  id => new Promise((resolve => {
        let data = [];
        http.get('/home/api/method/app_center.editor.editor?app=' + this.props.match.params.app + '&operation=get_node&id=' + id)
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
            key;
            if (v.children === true){
                this.getTree(v.id).then(data=>{
                    let a = {
                        children: data,
                        title: v.text,
                        isLeaf: !v.children,
                        type: v.type,
                        key: v.id
                    };
                    arr.push(a);
                })
            } else {
                let a = {
                    title: v.text,
                    isLeaf: !v.children,
                    type: v.type,
                    key: v.id
                };
                arr.push(a);
            }
        });
        if (a === 1) {
            let data = [
                {
                    title: this.props.appName,
                    isLeaf: false,
                    type: 'folder',
                    key: this.props.appName,
                    children: arr
                }
            ]
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

    onExpand = (expandedKeys) => {
        this.setState({
            expandedKeys,
            autoExpandParent: false
        });

    };

    onSelect = (selectedKeys, info) => {
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
                case 'sass' : suffixName = 'sass'; break;
                case 'less' : suffixName = 'sass'; break;
                case 'md' : suffixName = 'markdown'; break;
                case 'sql' : suffixName = 'mysql'; break;
                case 'json' : suffixName = 'json'; break;
                case 'ts' : suffixName = 'typescript'; break;
                case 'css' : suffixName = 'css'; break;
            }
            this.props.store.codeStore.setSuffixName(suffixName);
        } else {
            this.props.store.codeStore.setSuffixName('text');
        }
    };

    renderTreeNodes = data =>
        data.map(item => {

            if (item.children) {
                return (
                    <TreeNode
                        title={item.title}
                        key={item.key}
                        dataRef={item}
                    >
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return (
                <TreeNode
                    title={item.title}
                    key={item.key}
                    dataRef={item}
                />
            );
        });

    render () {
        const { appName } = this.props;
        return (
            <Tree
                className="draggable-tree"
                defaultExpandAll={this.state.defaultExpandAll}
                onExpand={this.onExpand}
                expandedKeys={this.state.expandedKeys}
                onSelect={this.onSelect}
                selectedKeys={this.state.selectedKeys}
                autoExpandParent={[appName]}
            >
                {this.renderTreeNodes(this.state.arr)}

            </Tree>
        );
    }
}

export default MyTree;
