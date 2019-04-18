import React, { PureComponent } from 'react';
import http from '../../../utils/Server';
import { Button, message } from 'antd';
import { Link, withRouter } from 'react-router-dom';

const block = {
    display: 'block'
};
const none = {
    display: 'none'
};

@withRouter
class TemplateList extends PureComponent {
    constructor () {
        super();
        this.state = {
            templateContent: ''
        }
    }

    copyContent = (app, name, version)=>{
        http.get('/api/method/conf_center.api.app_conf_data?app=' + app +
            '&conf=' + name + '&version=' + version)
            .then(res=>{
                console.log(res.message);
                this.setState({
                    templateContent: res.message.data
                });
                let input = document.getElementById('templateContent');
                input.select(); //选择对象
                console.log(input.value);
                document.execCommand('Copy');
                message.success('已复制好，可贴粘');
            })
    };
    render () {
        const { templateList } = this.props;
        const { templateContent } = this.state;
        return (
            <div className="templateList">
                <ul>
                    {
                        templateList && templateList.length > 0 && templateList.map((v, key)=>{
                            return <li key={key}>
                                <div>
                                    <p>模板名称：<span className="fontColor">{v.conf_name}</span>
                                    </p>
                                </div>
                                <div>
                                    <p>描述：<span className="fontColor">{v.description}</span></p>
                                </div>
                                <div>
                                    <p>版本号：<span className="fontColor">{v.latest_version}</span>
                                        <Button>
                                            <Link
                                                to={`/myTemplateDetails/${v.app}/${v.name}/${v.latest_version}`}
                                            >
                                                查看
                                            </Link>
                                        </Button>
                                        <Button
                                            onClick={
                                                () => {
                                                    this.copyContent(v.app, v.name, v.latest_version)
                                                }
                                            }
                                        >复制</Button>
                                        <input
                                            id="templateContent"
                                            type="hidden"
                                            value={templateContent}
                                        />
                                    </p>
                                </div>
                            </li>
                        })
                    }
                </ul>
                <p
                    className="empty"
                    style={templateList.length > 0 ? none : block}
                >暂时没有上传模板！</p>
            </div>
        );
    }
}
export default TemplateList;