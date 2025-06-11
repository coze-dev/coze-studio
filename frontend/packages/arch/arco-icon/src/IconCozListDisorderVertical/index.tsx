import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozListDisorderVerticalComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_list_disorder_vertical${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M18.5 3.5C18.5 4.32843 19.1716 5 20 5 20.8284 5 21.5 4.32843 21.5 3.5 21.5 2.67157 20.8284 2 20 2 19.1716 2 18.5 2.67157 18.5 3.5zM21 9C21 8.44772 20.5523 8 20 8 19.4477 8 19 8.44772 19 9V22C19 22.5523 19.4477 23 20 23 20.5523 23 21 22.5523 21 22V9zM13 9C13 8.44772 12.5523 8 12 8 11.4477 8 11 8.44772 11 9L11 22C11 22.5523 11.4477 23 12 23 12.5523 23 13 22.5523 13 22L13 9zM4 8C4.55228 8 5 8.44772 5 9L5 22C5 22.5523 4.55228 23 4 23 3.44771 23 3 22.5523 3 22L3 9C3 8.44771 3.44772 8 4 8zM12 5C11.1716 5 10.5 4.32843 10.5 3.5 10.5 2.67157 11.1716 2 12 2 12.8284 2 13.5 2.67157 13.5 3.5 13.5 4.32843 12.8284 5 12 5zM2.5 3.5C2.5 4.32843 3.17157 5 4 5 4.82843 5 5.5 4.32843 5.5 3.5 5.5 2.67157 4.82843 2 4 2 3.17157 2 2.5 2.67157 2.5 3.5z"/></svg>;
}

const IconCozListDisorderVertical = React.forwardRef(IconCozListDisorderVerticalComponent);
export default IconCozListDisorderVertical;
