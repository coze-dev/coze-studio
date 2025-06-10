import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPauseComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_pause${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.677 5.5C6.677 4.94772 7.12472 4.5 7.677 4.5 8.22929 4.5 8.677 4.94772 8.677 5.5L8.677 18.5C8.677 19.0523 8.22929 19.5 7.677 19.5 7.12472 19.5 6.677 19.0523 6.677 18.5V5.5zM15.677 5.5C15.677 4.94772 16.1247 4.5 16.677 4.5 17.2293 4.5 17.677 4.94772 17.677 5.5V18.5C17.677 19.0523 17.2293 19.5 16.677 19.5 16.1247 19.5 15.677 19.0523 15.677 18.5V5.5z"/></svg>;
}

const IconCozPause = React.forwardRef(IconCozPauseComponent);
export default IconCozPause;
