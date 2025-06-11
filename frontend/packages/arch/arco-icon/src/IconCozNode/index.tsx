import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozNodeComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_node${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M6 4C6 3.44772 5.55228 3 5 3C4.44772 3 4 3.44772 4 4V16.5C4 18.1569 5.34315 19.5 7 19.5H14.1449C14.5752 20.9457 15.9145 22 17.5 22C19.433 22 21 20.433 21 18.5C21 16.567 19.433 15 17.5 15C15.9145 15 14.5752 16.0543 14.1449 17.5H7C6.44772 17.5 6 17.0523 6 16.5V10.5H14.1449C14.5752 11.9457 15.9145 13 17.5 13C19.433 13 21 11.433 21 9.5C21 7.567 19.433 6 17.5 6C15.9145 6 14.5752 7.05426 14.1449 8.5H6V4ZM16 18.5C16 19.3284 16.6716 20 17.5 20C18.3284 20 19 19.3284 19 18.5C19 17.6716 18.3284 17 17.5 17C16.6716 17 16 17.6716 16 18.5ZM17.5 11C16.6716 11 16 10.3284 16 9.5C16 8.67157 16.6716 8 17.5 8C18.3284 8 19 8.67157 19 9.5C19 10.3284 18.3284 11 17.5 11Z"/></svg>;
}

const IconCozNode = React.forwardRef(IconCozNodeComponent);
export default IconCozNode;
