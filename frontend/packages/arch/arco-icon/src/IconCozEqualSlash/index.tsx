import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozEqualSlashComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_equal_slash${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4.22188 18.364C3.83136 18.7545 3.83136 19.3877 4.22188 19.7782 4.61241 20.1687 5.24557 20.1687 5.6361 19.7782L19.7782 5.63606C20.1688 5.24554 20.1688 4.61237 19.7782 4.22185 19.3877 3.83132 18.7545 3.83132 18.364 4.22185L4.22188 18.364zM4 8H12.4645L10.4645 10H4C3.44772 10 3 9.55229 3 9 3 8.44772 3.44772 8 4 8zM4 14H6.46445L4.46445 16H4C3.44772 16 3 15.5523 3 15 3 14.4477 3.44772 14 4 14zM13.5355 14L11.5355 16H20C20.5523 16 21 15.5523 21 15 21 14.4477 20.5523 14 20 14H13.5355zM19.5355 8L17.5355 10H20C20.5523 10 21 9.55229 21 9 21 8.44772 20.5523 8 20 8H19.5355z"/></svg>;
}

const IconCozEqualSlash = React.forwardRef(IconCozEqualSlashComponent);
export default IconCozEqualSlash;
