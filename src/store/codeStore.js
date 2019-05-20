import {observable, action} from 'mobx';
class CodeStore {
    @observable treeData = [];
    @observable isChange = false;
    @observable folderType = 'file';
    @observable myFolder = '';
    @observable editorContent = '';
    @observable newEditorContent = '';
    @observable myEditor = null;
    @observable fileName = 'version';
    @observable addFileName = '';
    @observable addFolderName = '';

    @observable readOnly = true;
    @observable editorValue = {};
    @observable instName = '123';
    @observable template = [];   //template选项
    @observable dataSource = [];   //templateList
    @observable allTableData = [];   //表格数据

    @observable platformData = [];   //平台消息
    @observable tableData = [];   //

    @observable deviceData = [];   //设备消息
    @observable deviceTableData = [];   //

    @observable versionVisible = false;   //版本列表的form表单visible
    @observable templateVisible = false;  //模板列表的form表单visible
    @observable copyVisible = false;  //复制模板列表的form表单visible
    @observable copyData = {};  //复制模板列表的form表单默认值
    @observable versionList = [];   //版本列表
    @observable versionLatest = [];   //最新版本
    @observable templateList = [];   //模板列表

    @observable description = '';//创建修改应用时markdown的值
    @observable configuration = '';     //配置面板
    @observable predefined = '';        //预定义

    @observable groupName = '';

    @observable settingData = {
        appName: '',
        codeName: '',
        licenseType: '免费',
        description: '',
        confTemplate: '',
        preConfiguration: ''
    };

    @observable instNames = '';

    @observable errorMessage = '';

    @observable correlationApp = '';

    @observable tcp = [
        {
            'name': 'ip',
            'desc': 'IP地址',
            'type': 'text',
            'value': '192.168.1.132'
        },
        {
            'name': 'host',
            'desc': '端口',
            'type': 'number',
            'value': 502
        },
        {
            'name': 'nodelay',
            'desc': 'Nodelay',
            'type': 'boolean',
            'value': true
        }
        ];
    @observable serial = [
        {
            'name': 'tty',
            'desc': '端口',
            'type': 'dropdown',
            'value': ['ttymcx0', 'ttymcx1']
        },
        {
            'name': 'baudrate',
            'desc': '波特率',
            'type': 'dropdown',
            'value': [4800, 9600, 115200, 19200]
        },
        {
            'name': 'stop_bits',
            'desc': '停止位',
            'type': 'dropdown',
            'value': [1, 2]
        },
        {
            'name': 'data_bits',
            'desc': '数据位',
            'type': 'dropdown',
            'value': [8, 7]
        },
        {
            'name': 'flow_control',
            'desc': '流控',
            'type': 'boolean',
            'value': false
        },
        {
            'name': 'parity',
            'desc': '校验',
            'type': 'dropdown',
            'value': ['None', 'Even', 'Odd']
        }
        ]

    //安装应用配置
    @observable activeKey = '1';  //配置面板/json源码  active
    @observable errorCode = false;  //配置面板代码错误
    @observable config = [];  //配置面板数据
    @observable installConfiguration = [];  //json源码
    @observable iDeviceColumns = [];  //配置面板表格

    @observable userBeta = 0;   //网关是否开启beta模式

    @observable suffixName = '';

    @action setUserBeta (values) {
        this.userBeta = values
    }

    @action setSuffixName (values) {
        this.suffixName = values
    }

    @action setCorrelationApp (values) {
        this.correlationApp = values;
    }

    @action setInstallConfiguration (values) {
        this.installConfiguration = values;
    }

    @action setErrorCode (values) {
        this.errorCode = values;
    }

    @action setConfig (values) {
        this.config = values;
    }

    @action setActiveKey (values) {
        this.activeKey = values;
    }

    @action setInstNames (values) {
        this.instNames = values;
    }

    @action setErrorMessage (values) {
        this.errorMessage = values;
    }

    @action setGroupName (values) {
        this.groupName = values;
    }

    @action setTemplateList (values) {
        this.templateList = values;
    }

    @action setVersionList (values) {
        this.versionList = values;
    }

    @action setVersionLatest (values) {
        this.versionLatest = values;
    }

    @action setSettingData (values) {
        this.settingData = values;
    }

    @action setAllTableData (values) {
        this.allTableData = values;
    }

    @action setConfiguration (values) {
        this.configuration = values;
    }

    @action setPredefined (values) {
        this.predefined = values;
    }

    @action setDescription (values) {
        this.description = values;
    }

    @action setCopyVisible (values) {
        this.copyVisible = values;
    }

    @action setCopyData (values) {
        this.copyData = values;
    }

    @action setVersionVisible (values) {
        this.versionVisible = values;
    }

    @action setTemplateVisible (values) {
        this.templateVisible = values;
    }

    @action setDeviceData (values) {
        this.deviceData = values;
    }
    @action setDeviceTableData (values) {
        this.deviceTableData = values;
    }
    @action setPlatformData (values) {
        this.platformData = values;
    }
    @action setTableData (values) {
        this.tableData = values;
    }
    @action setTemplate (values) {
        this.template = values;
    }
    @action setDataSource (values) {
        this.dataSource = values;
    }
    @action setEditorContent (values) {
        this.editorContent = values;
    }
    @action setTreeData (values) {
        this.treeData = values;
    }
    @action setMyEditor (values) {
        this.myEditor = values;
    }
    @action setMyFolder (values) {
        this.myFolder = values;
    }
    @action setFolderType (values) {
        this.folderType = values;
    }
    @action setNewEditorContent (values) {
        this.newEditorContent = values;
    }
    @action change () {
        this.isChange = !this.isChange
    }
    @action setReadOnly (values) {
        this.readOnly = values
    }
    @action setFileName (values) {
        this.fileName = values;
    }
    @action setAddFileName (values) {
        this.addFileName = values;
    }
    @action setAddFolderName (values) {
        this.addFolderName = values;
    }
    @action setEditorValue (values) {
        this.editorValue = values;
    }
    @action setInstName (values) {
        this.instName = values;
    }

}

export default new CodeStore()