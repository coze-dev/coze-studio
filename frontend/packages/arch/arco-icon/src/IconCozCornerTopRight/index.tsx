import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCornerTopRightComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_corner_top_right${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M18 11C18 8.23858 15.7614 6 13 6H5C4.44771 6 4 5.55228 4 5C4 4.44772 4.44771 4 5 4H13C16.866 4 20 7.13401 20 11V19C20 19.5523 19.5523 20 19 20C18.4477 20 18 19.5523 18 19V11Z"/></svg>;
}

const IconCozCornerTopRight = React.forwardRef(IconCozCornerTopRightComponent);
export default IconCozCornerTopRight;
