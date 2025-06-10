import { type ReactNode } from 'react';

import { isUndefined, omitBy } from 'lodash-es';
import { Toast as SemiToast, ToastFactory } from '@douyinfe/semi-ui';

import { cn } from '@/utils/cn';
import {
  IconCozCheckMarkCircleFill,
  IconCozWarningCircleFill,
} from '@/components/icon';

import { toastVariant } from './toast-variant';
import type {
  RequiredToastType,
  ToastInstance,
  ToastProps,
} from './toast-types';

import './index.css';

// 创建Toast实例
const ToastIns: ToastInstance = ToastFactory.create();

// 清理对象的辅助函数
function cleanParams<T extends object = Record<string, unknown>>(params: T): T {
  return omitBy(params, isUndefined) as T;
}

const defaultConfig: Partial<ToastProps> = {
  className: '',
  icon: null,
  type: 'default',
};

// 重写create方法，利用semiToast的create返回配置信息
function rewriteToastCreate(opts: ToastProps) {
  const { className, icon, type, ...rest } = { ...defaultConfig, ...opts };
  const cls = cn(toastVariant({ type }), className);
  const getIcon = (): ReactNode => {
    if (icon) {
      return icon;
    }
    switch (type) {
      case 'info':
        return <IconCozWarningCircleFill className="fill-brand-6 text-xxl" />;
      case 'success':
        return <IconCozCheckMarkCircleFill className="fill-green-6 text-xxl" />;
      case 'warning':
        return <IconCozWarningCircleFill className="fill-yellow-6 text-xxl" />;
      case 'error':
        return <IconCozWarningCircleFill className="fill-red-6 text-xxl" />;
      default:
        return null;
    }
  };

  const params = cleanParams<ToastProps>({
    className: cls,
    showClose: false,
    top: 10,
    textMaxWidth: 1400,
    icon: getIcon(),
    id: `${Date.now()}`,
    ...rest,
  });

  return SemiToast.create(params);
}

// 重载函数，用于创建不同类型的Toast
function rewriteToastCreateAlias(): (opts: ToastProps) => string;
function rewriteToastCreateAlias(
  type: RequiredToastType,
): (opts: string | Omit<ToastProps, 'type'>) => string;
function rewriteToastCreateAlias(type?: RequiredToastType) {
  // 返回一个函数，该函数接收Toast内容或ToastProps对象
  return (opts: string | Omit<ToastProps, 'type'> | ToastProps) => {
    // 如果opts是字符串，或者没有提供type参数，构造一个新的ToastProps对象
    const toastProps =
      typeof opts === 'string' ? { content: opts, type } : { ...opts, type };
    // 如果type未定义且opts为对象，则type属性不会被添加到toastProps
    return rewriteToastCreate(toastProps);
  };
}

// 重写函数实现ToastIns.close()方法;
function rewriteToastClose(id: string) {
  if (id) {
    SemiToast.close(id);
  }
}

ToastIns.create = rewriteToastCreateAlias();
ToastIns.info = rewriteToastCreateAlias('info');
ToastIns.error = rewriteToastCreateAlias('error');
ToastIns.success = rewriteToastCreateAlias('success');
ToastIns.warning = rewriteToastCreateAlias('warning');
ToastIns.close = (id: string) => rewriteToastClose(id);

// 暴露重写后的ToastIns
export { ToastIns as Toast };
