import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPluginFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_plugin_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M9.99995 1.69995C5.13984 1.69995 1.19995 5.63985 1.19995 10.5V13.5C1.19995 18.3601 5.13985 22.3 9.99995 22.3H16C18.0986 22.3 19.8 20.5986 19.8 18.4999V17.9999H22.4999C23.3284 17.9999 23.9999 17.3284 23.9999 16.4999C23.9999 15.6715 23.3284 14.9999 22.4999 14.9999H19.8V8.99994H22.4999C23.3284 8.99994 23.9999 8.32837 23.9999 7.49994C23.9999 6.67151 23.3284 5.99994 22.4999 5.99994H19.8V5.49995C19.8 3.40127 18.0986 1.69995 15.9999 1.69995H9.99995ZM6.99994 8.49994C6.30958 8.49994 5.74994 9.05958 5.74994 9.74994V14.2499C5.74994 14.9403 6.30958 15.4999 6.99994 15.4999C7.69029 15.4999 8.24994 14.9403 8.24994 14.2499V9.74994C8.24994 9.05958 7.69029 8.49994 6.99994 8.49994Z"/></svg>;
}

const IconCozPluginFill = React.forwardRef(IconCozPluginFillComponent);
export default IconCozPluginFill;
