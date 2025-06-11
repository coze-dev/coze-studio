import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCompassFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_compass_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM13.2689 14.3301C13.744 14.1277 14.1224 13.7494 14.325 13.2744L16.5061 8.15857C16.6773 7.75685 16.2556 7.32526 15.8459 7.50432L10.7478 9.73226C10.2855 9.93432 9.91656 10.3037 9.71508 10.7663L7.50182 15.8479C7.32758 16.2479 7.74511 16.6826 8.15614 16.5076L13.2689 14.3301Z"/></svg>;
}

const IconCozCompassFill = React.forwardRef(IconCozCompassFillComponent);
export default IconCozCompassFill;
