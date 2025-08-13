
import axios, { type AxiosResponse, isAxiosError } from 'axios';
import { redirect } from '@coze-arch/web-context';
import { logger } from '@coze-arch/logger';

const serverPath = '/aop-web/'

export const axiosInstance = axios.create({
    baseURL: serverPath,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const rpc = async (url: string, data: any, options: any) => {
    let pkg = {
        header: {},
        body: data || {}
    }
    let res = await axiosInstance({
        url,
        data: pkg,
        method: 'POST',
        ...options
    })

    if(res.data?.header?.errorCode != '0'){
        if(options?.processError !== false){

        }
        return Promise.reject({
            errorCode: res.data?.header?.errorCode, 
            errorMsg: res.data?.header?.errorMsg
        })
    }else{
        return res.data?.body || {}
    }
}

export const rpcurl = (url: string, data: any) => {
    return serverPath + url
}