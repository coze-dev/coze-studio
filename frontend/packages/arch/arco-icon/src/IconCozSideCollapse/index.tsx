import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSideCollapseComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_side_collapse${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M14 4C14.5523 4 15 4.44772 15 5 15 5.55228 14.5523 6 14 6H2C1.44772 6 1 5.55228 1 5 1 4.44772 1.44772 4 2 4H14zM2 11H14C14.5523 11 15 11.4477 15 12 15 12.5523 14.5523 13 14 13H2C1.44772 13 1 12.5523 1 12 1 11.4477 1.44772 11 2 11zM15 19C15 18.4477 14.5523 18 14 18H2C1.44772 18 1 18.4477 1 19 1 19.5523 1.44772 20 2 20H14C14.5523 20 15 19.5523 15 19zM17.2929 8.70711C16.9024 8.31658 16.9024 7.68342 17.2929 7.29289 17.6834 6.90237 18.3166 6.90237 18.7071 7.29289L22.7071 11.2929C23.0976 11.6834 23.0976 12.3166 22.7071 12.7071L18.7071 16.7071C18.3166 17.0976 17.6834 17.0976 17.2929 16.7071 16.9024 16.3166 16.9024 15.6834 17.2929 15.2929L20.5858 12 17.2929 8.70711z"/></svg>;
}

const IconCozSideCollapse = React.forwardRef(IconCozSideCollapseComponent);
export default IconCozSideCollapse;
