import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBuildingFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_building_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M4.20013 4.61996C2.87133 5.15148 2 6.43846 2 7.86963V19.9998C2 21.1044 2.89543 21.9998 4 21.9998H14.5V4.488C14.5 2.57785 12.5708 1.2717 10.7972 1.98111L4.20013 4.61996zM6.5 9.79979C5.83726 9.79979 5.3 10.337 5.3 10.9998 5.3 11.6625 5.83726 12.1998 6.5 12.1998H10C10.6627 12.1998 11.2 11.6625 11.2 10.9998 11.2 10.337 10.6627 9.79979 10 9.79979H6.5zM5.3 15.9998C5.3 15.337 5.83726 14.7998 6.5 14.7998H10C10.6627 14.7998 11.2 15.337 11.2 15.9998 11.2 16.6625 10.6627 17.1998 10 17.1998H6.5C5.83726 17.1998 5.3 16.6625 5.3 15.9998zM16 9.00001L19.5385 10.4744C21.029 11.0955 22 12.5519 22 14.1667V20C22 21.1046 21.1046 22 20 22H16V9.00001zM19 17.2H17.5V14.8H19C19.6627 14.8 20.2 15.3373 20.2 16 20.2 16.6628 19.6627 17.2 19 17.2z"/></svg>;
}

const IconCozBuildingFill = React.forwardRef(IconCozBuildingFillComponent);
export default IconCozBuildingFill;
