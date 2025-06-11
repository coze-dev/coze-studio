import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozExpandComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_expand${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.39975 19H9C9.55228 19 10 19.4477 10 20C10 20.5523 9.55228 21 9 21H4C3.72386 21 3.47386 20.8881 3.29289 20.7071C3.11193 20.5262 3 20.2762 3 20V15C3 14.4477 3.44772 14 4 14C4.55228 14 5 14.4477 5 15V17.5713L9.48615 13.0852C9.87072 12.7006 10.4913 12.699 10.8747 13.0848C11.2681 13.4808 11.2748 14.125 10.8801 14.5197L6.39975 19ZM18.9852 6.50005L14.5567 10.9286C14.1683 11.317 13.5395 11.3171 13.1515 10.9283C12.7601 10.5361 12.7575 9.89939 13.1493 9.50758L17.6568 5H14.9852C14.4329 5 13.9852 4.55228 13.9852 4C13.9852 3.44772 14.4329 3 14.9852 3H19.9852C20.2614 3 20.5114 3.11193 20.6923 3.29289C20.8733 3.47386 20.9852 3.72386 20.9852 4V9C20.9852 9.55228 20.5375 10 19.9852 10C19.4329 10 18.9852 9.55228 18.9852 9V6.50005Z"/></svg>;
}

const IconCozExpand = React.forwardRef(IconCozExpandComponent);
export default IconCozExpand;
