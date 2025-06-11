import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLightningFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_lightning_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2.54798 13.231L13.1306 1.13654C13.7792 0.395314 15 0.854027 15 1.83895V9.00007H20.6494C21.5658 9.00007 22.0556 10.0795 21.4521 10.7691L10.8695 22.8636C10.2209 23.6048 9.00004 23.1461 9.00004 22.1612V15.0001H3.35073C2.43429 15.0001 1.9445 13.9207 2.54798 13.231Z"/></svg>;
}

const IconCozLightningFill = React.forwardRef(IconCozLightningFillComponent);
export default IconCozLightningFill;
