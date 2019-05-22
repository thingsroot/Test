import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Tree} from 'antd';
import { observer, inject } from 'mobx-react';
// import http from '../../../utils/Server';
const { TreeNode } = Tree;


@withRouter
@inject('store')
@observer
class MyTree extends Component {

    constructor (props) {
        super(props);
        this.state = {
            expandedKeys: [],
            autoExpandParent: true
        }
    }

    componentWillReceiveProps (nextProps) {
        if (this.props.store.codeStore.showFileName !== nextProps.showFileName) {
            this.setState({
                expandedKeys: [this.props.appName]
            })
        }
    }

    onExpand = (expandedKeys) => {
        this.setState({
            expandedKeys,
            autoExpandParent: false
        });

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
        const { selectedKeys, treeData, onSelect } = this.props;
        return (
            <div>
                {console.log(treeData)}
                {console.log(treeData.length)}
                {
                    treeData.length > 0 ? <Tree
                        onExpand={this.onExpand}
                        expandedKeys={this.state.expandedKeys}
                        onSelect={onSelect}
                        selectedKeys={selectedKeys}
                        >
                        {this.renderTreeNodes(treeData)}
                    </Tree> : ''
                }
            </div>
        );
    }
}

export default MyTree;
