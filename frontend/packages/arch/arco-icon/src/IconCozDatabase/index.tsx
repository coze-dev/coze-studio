import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDatabaseComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_database${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12 22.5C17.4648 22.5 22 20.4848 22 17.5277V6.47229C22 3.51516 17.4648 1.5 12 1.5C6.53525 1.5 2 3.51516 2 6.47229V17.5277C2 20.4848 6.53525 22.5 12 22.5ZM3.90476 6.47229C3.90476 4.98889 7.47103 3.40428 12 3.40428C16.529 3.40428 20.0952 4.98889 20.0952 6.47229V6.5182L20.094 6.51951C20.0195 7.98912 16.481 9.5403 12 9.5403C7.47103 9.5403 3.90476 7.95569 3.90476 6.47229ZM3.90476 9.47225C5.73236 10.7081 8.69632 11.4446 12 11.4446C15.3037 11.4446 18.2676 10.7081 20.0952 9.47225V12.0413L20.0943 12.0423C20.0274 13.5134 16.4859 15.068 12 15.068C7.55694 15.068 4.0404 13.5429 3.90859 12.0845C3.90859 12.0845 3.90715 12.0818 3.90476 12.0804V9.47225ZM20.0952 17.5277C20.0952 19.0111 16.529 20.5957 12 20.5957C7.47103 20.5957 3.90476 19.0111 3.90476 17.5277V15C5.73236 16.2358 8.69632 16.9723 12 16.9723C15.3037 16.9723 18.2676 16.2358 20.0952 15V17.5277Z"/></svg>;
}

const IconCozDatabase = React.forwardRef(IconCozDatabaseComponent);
export default IconCozDatabase;
