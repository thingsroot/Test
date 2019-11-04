import {observable, action} from 'mobx'
import http from '../utils/Server';
import {message} from 'antd';
class groups {
    @observable UserList = [];
    @observable GroupsUserlist = [];
    @observable GroupsGatewaylist = [];
    @action setGroupsUserlist (val) {
        this.GroupsUserlist = val.users ? val.users : [];
        this.GroupsGatewaylist = val.devices ? val.devices : [];
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
    @action handleDeleteUser (user, index, name){
        const data = {
            name,
            user
        }
        http.post('/api/companies_sharedgroups_remove_user', data).then(res=>{
            if (res.ok) {
                this.GroupsUserlist.splice(index, 1)
                this.GroupsUserlist = [].concat(this.GroupsUserlist)
                message.success('删除共享组用户成功！')
            }
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
            console.log(res)
            message.success('删除共享设备成功！')
        })
    }
}
export default groups;