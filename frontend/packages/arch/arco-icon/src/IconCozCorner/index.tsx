import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCornerComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_corner${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6 2H9C9.55229 2 10 2.44772 10 3 10 3.55228 9.55229 4 9 4H6C4.89543 4 4 4.89543 4 6V9C4 9.55228 3.55228 10 3 10 2.44772 10 2 9.55228 2 9V6C2 3.79086 3.79086 2 6 2zM3 14C2.44772 14 2 14.4477 2 15V18C2 20.2091 3.79086 22 6 22H9C9.55228 22 10 21.5523 10 21 10 20.4477 9.55228 20 9 20H6C4.89543 20 4 19.1046 4 18V15C4 14.4477 3.55228 14 3 14zM21 14C20.4477 14 20 14.4477 20 15V18C20 19.1046 19.1046 20 18 20H15C14.4477 20 14 20.4477 14 21 14 21.5523 14.4477 22 15 22H18C20.2091 22 22 20.2091 22 18V15C22 14.4477 21.5523 14 21 14zM21 10C21.5523 10 22 9.55229 22 9V6C22 3.79086 20.2091 2 18 2H15C14.4477 2 14 2.44772 14 3 14 3.55228 14.4477 4 15 4H18C19.1046 4 20 4.89543 20 6V9C20 9.55229 20.4477 10 21 10z"/></svg>;
}

const IconCozCorner = React.forwardRef(IconCozCornerComponent);
export default IconCozCorner;
