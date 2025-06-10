import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozFixedSizeComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_fixed_size${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.5 10.9983C5.94772 10.9983 5.5 11.446 5.5 11.9983 5.5 12.5506 5.94772 12.9983 6.5 12.9983H17.5C18.0523 12.9983 18.5 12.5506 18.5 11.9983 18.5 11.446 18.0523 10.9983 17.5 10.9983H6.5zM5.5 7.5C5.5 6.94772 5.94772 6.5 6.5 6.5L17.5 6.5C18.0523 6.5 18.5 6.94772 18.5 7.5 18.5 8.05229 18.0523 8.5 17.5 8.5L6.5 8.5C5.94772 8.5 5.5 8.05229 5.5 7.5zM6.5 15.5C5.94772 15.5 5.5 15.9477 5.5 16.5 5.5 17.0523 5.94772 17.5 6.5 17.5H12.5C13.0523 17.5 13.5 17.0523 13.5 16.5 13.5 15.9477 13.0523 15.5 12.5 15.5H6.5z"/><path fillRule="evenodd" clipRule="evenodd" d="M2 4C2 2.89543 2.89543 2 4 2L20 2C21.1046 2 22 2.89543 22 4V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20L2 4ZM4 4L20 4V20H4V4Z"/></svg>;
}

const IconCozFixedSize = React.forwardRef(IconCozFixedSizeComponent);
export default IconCozFixedSize;
