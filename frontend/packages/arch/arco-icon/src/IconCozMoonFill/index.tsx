import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMoonFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_moon_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M22.3223 17.174C22.6004 16.6513 21.9681 16.1345 21.4223 16.3642C19.7927 17.0501 17.9313 17.2196 16.0913 16.7267C11.6902 15.5477 9.07837 11.025 10.2576 6.625C10.7507 4.78542 11.8283 3.25852 13.2371 2.19055C13.709 1.83287 13.5775 1.02695 12.9857 1.00638C7.98257 0.83246 3.339 4.11249 1.98793 9.15355C0.415569 15.0203 3.89797 21.0505 9.7661 22.6225C14.8084 23.9733 19.9714 21.5928 22.3223 17.174Z"/></svg>;
}

const IconCozMoonFill = React.forwardRef(IconCozMoonFillComponent);
export default IconCozMoonFill;
