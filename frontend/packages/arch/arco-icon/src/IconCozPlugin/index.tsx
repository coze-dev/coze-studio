import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPluginComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_plugin${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6 10C6 9.44772 6.44772 9 7 9C7.55228 9 8 9.44772 8 10V14C8 14.5523 7.55228 15 7 15C6.44772 15 6 14.5523 6 14V10Z"/><path fillRule="evenodd" clipRule="evenodd" d="M20 15.25V8.75H22.75C23.4404 8.75 24 8.19036 24 7.5C24 6.80964 23.4404 6.25 22.75 6.25H20V5.5C20 3.29086 18.2091 1.5 16 1.5H10C5.02944 1.5 1 5.52944 1 10.5V13.5C1 18.4706 5.02944 22.5 10 22.5H16C18.2091 22.5 20 20.7091 20 18.5V17.75H22.75C23.4404 17.75 24 17.1904 24 16.5C24 15.8096 23.4404 15.25 22.75 15.25H20ZM10 3.5H16C17.1046 3.5 18 4.39543 18 5.5V18.5C18 19.6046 17.1046 20.5 16 20.5H10C6.13401 20.5 3 17.366 3 13.5V10.5C3 6.63401 6.13401 3.5 10 3.5Z"/></svg>;
}

const IconCozPlugin = React.forwardRef(IconCozPluginComponent);
export default IconCozPlugin;
