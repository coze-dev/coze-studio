import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozListDisorderComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_list_disorder${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M3.5 5.5C4.32843 5.5 5 4.82843 5 4 5 3.17157 4.32843 2.5 3.5 2.5 2.67157 2.5 2 3.17157 2 4 2 4.82843 2.67157 5.5 3.5 5.5zM9 3C8.44772 3 8 3.44772 8 4 8 4.55228 8.44771 5 9 5H22C22.5523 5 23 4.55228 23 4 23 3.44772 22.5523 3 22 3H9zM9 11C8.44772 11 8 11.4477 8 12 8 12.5523 8.44771 13 9 13H22C22.5523 13 23 12.5523 23 12 23 11.4477 22.5523 11 22 11H9zM8 20C8 19.4477 8.44772 19 9 19H22C22.5523 19 23 19.4477 23 20 23 20.5523 22.5523 21 22 21H9C8.44771 21 8 20.5523 8 20zM5 12C5 12.8284 4.32843 13.5 3.5 13.5 2.67157 13.5 2 12.8284 2 12 2 11.1716 2.67157 10.5 3.5 10.5 4.32843 10.5 5 11.1716 5 12zM3.5 21.5C4.32843 21.5 5 20.8284 5 20 5 19.1716 4.32843 18.5 3.5 18.5 2.67157 18.5 2 19.1716 2 20 2 20.8284 2.67157 21.5 3.5 21.5z"/></svg>;
}

const IconCozListDisorder = React.forwardRef(IconCozListDisorderComponent);
export default IconCozListDisorder;
