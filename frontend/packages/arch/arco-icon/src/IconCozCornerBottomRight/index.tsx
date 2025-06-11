import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCornerBottomRightComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_corner_bottom_right${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M18 13C18 15.7614 15.7614 18 13 18H5C4.44771 18 4 18.4477 4 19C4 19.5523 4.44771 20 5 20H13C16.866 20 20 16.866 20 13V5C20 4.44771 19.5523 4 19 4C18.4477 4 18 4.44771 18 5V13Z"/></svg>;
}

const IconCozCornerBottomRight = React.forwardRef(IconCozCornerBottomRightComponent);
export default IconCozCornerBottomRight;
