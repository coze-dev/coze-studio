import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozFilterComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_filter${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M16 11.431V21C16 21.5523 15.5523 22 15 22C14.4477 22 14 21.5523 14 21V11C14 10.853 14.0317 10.7135 14.0886 10.5878C14.1646 10.3992 14.3006 10.2331 14.4885 10.1209L20 6.83092V4H4V6.86581L9.34505 10.0611C9.72731 10.2017 10 10.569 10 11V17.5C10 18.0523 9.55228 18.5 9 18.5C8.44772 18.5 8 18.0523 8 17.5V11.4652C7.52317 11.1801 4.63124 9.59768 3.04292 8.73047C2.40019 8.37955 2 7.70723 2 6.97494C2 6.15809 2 5.03727 2 3.99993C2 2.89536 2.89543 2 4 2H20C21.1046 2 22 2.89542 22 3.99999C22 4.98088 22 5.96619 22 6.94482C22 7.67379 21.6034 8.34502 20.9648 8.69669L16 11.431Z"/></svg>;
}

const IconCozFilter = React.forwardRef(IconCozFilterComponent);
export default IconCozFilter;
