/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import axios, { type AxiosResponse, isAxiosError } from 'axios';
import { redirect } from '@coze-arch/web-context';
import { logger } from '@coze-arch/logger';

const serverPath = '/aop-web/'

const axiosInstance = axios.create({
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