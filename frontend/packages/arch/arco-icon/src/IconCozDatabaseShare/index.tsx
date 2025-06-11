import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDatabaseShareComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_database_share${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M12 22.5C12.3041 22.5 12.6053 22.4938 12.903 22.4815L11.7808 21.3592C11.5413 21.1197 11.3594 20.8563 11.2303 20.5804C7.07348 20.4142 3.90476 18.926 3.90476 17.5277V15C5.56147 16.1203 8.15199 16.8302 11.0829 16.9532C11.0287 16.7276 11 16.4922 11 16.25C11 15.8246 11.0885 15.42 11.2482 15.0534C7.16625 14.894 4.03287 13.4596 3.90859 12.0845C3.90847 12.0831 3.90715 12.0818 3.90476 12.0804V9.47225C5.73236 10.7081 8.69632 11.4446 12 11.4446C15.3037 11.4446 18.2676 10.7081 20.0952 9.47225V11.2612C20.6334 11.3382 21.1629 11.5845 21.6092 12.0308L22 12.4216V6.47229C22 3.51516 17.4648 1.5 12 1.5C6.53525 1.5 2 3.51516 2 6.47229V17.5277C2 20.4848 6.53525 22.5 12 22.5ZM3.90476 6.47229C3.90476 4.98889 7.47103 3.40428 12 3.40428C16.529 3.40428 20.0952 4.98889 20.0952 6.47229V6.5182L20.094 6.51951C20.0195 7.98912 16.481 9.5403 12 9.5403C7.47103 9.5403 3.90476 7.95569 3.90476 6.47229Z"/><path d="M14 17.25H22.3101C22.9337 17.25 23.246 16.496 22.805 16.055L20.195 13.445C19.754 13.004 19 13.3163 19 13.9399V15.25H14C13.4477 15.25 13 15.6977 13 16.25 13 16.8023 13.4477 17.25 14 17.25zM22 20.75C22.5523 20.75 23 20.3023 23 19.75 23 19.1977 22.5523 18.75 22 18.75H13.69C13.0663 18.75 12.754 19.504 13.195 19.945L15.805 22.555C16.246 22.996 17 22.6837 17 22.06V20.75H22z"/></svg>;
}

const IconCozDatabaseShare = React.forwardRef(IconCozDatabaseShareComponent);
export default IconCozDatabaseShare;
