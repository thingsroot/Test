import {observable, action} from 'mobx'
import http from '../utils/Server';
import {message} from 'antd';
class groups {
    @observable UserList = [];
    @observable GroupsUserlist = [];
    @observable GroupsGatewaylist = [];
    @observable loading = false;
    @action getGatewayInfo (index, arr) {
        if (index >= arr.length) {
            this.GroupsGatewaylist = [];
            this.GroupsGatewaylist = [].concat(arr);
            this.loading = false;
            return false;
        }
        http.get('/api/gateways_info_read?name=' + arr[index].device).then(res=>{
            if (res.ok) {
                arr[index].dev_name = res.data.dev_name;
                this.getGatewayInfo(index + 1, arr)
            }
        })
    }
    @action setGroupsUserlist (val) {
        this.GroupsGatewaylist = [];
        this.GroupsUserlist = [];
        this.loading = true;
        const device = val.devices ? val.devices : [];
        this.GroupsUserlist = val.users ? val.users : [];
        this.getGatewayInfo(0, device)
    }
    @action setUserlist (val) {
        this.UserList = val.user_list ? val.user_list : [];
    }
    @action pushGroupsGatewaylist (val) {
        this.GroupsGatewaylist.push(val)
        this.GroupsGatewaylist = [].concat(this.GroupsGatewaylist)
    }
    @action pushGroupsUserlist (val) {
        this.GroupsUserlist.push(val)
        this.GroupsUserlist = [].concat(this.GroupsUserlist)
    }
    @action handleDeleteUser (user, index, name, flag){
        const data = {
            name,
            user
        }
        return new Promise((resolve, reject)=>{
            http.post('/api/companies_sharedgroups_remove_user', data).then(res=>{
                if (res.ok) {
                    this.GroupsUserlist.splice(index, 1)
                    this.GroupsUserlist = [].concat(this.GroupsUserlist)
                    !flag && message.success('删除共享组用户成功！')
                    resolve(true)
                } else {
                    reject(false)
                }
            })
        })
    }
    @action handleDeleteDevice (index, name) {
        const arr = this.GroupsGatewaylist.filter(item=> item.idx === index)
        if (arr.length > 0) {
            index = this.GroupsGatewaylist.indexOf(arr[0])
            this.GroupsGatewaylist.splice(index, 1)
            this.GroupsGatewaylist = [].concat(this.GroupsGatewaylist)
        }
        const data = {
            name,
            device: arr[0].device
        }
        http.post('/api/companies_sharedgroups_remove_device', data).then(res=>{
            if (res.ok) {
                message.success('删除共享设备成功！')
            }
        })
    }
}
export default groups;