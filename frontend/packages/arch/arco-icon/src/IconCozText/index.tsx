import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTextComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_text${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M7.38277 6.96948C7.37727 6.96948 7.3728 6.97395 7.3728 6.97945V9.82273C7.3728 9.94525 7.47418 10.0435 7.59664 10.0396C7.70341 10.0362 7.79078 9.95525 7.81236 9.85064C8.02341 8.82773 8.87387 8.1374 9.36938 8.01723C9.89462 7.88932 10.9056 8.02875 10.9056 8.02875C10.9056 8.02875 10.8926 15.3703 10.8926 15.8166C10.8926 16.2636 10.2779 16.4555 10.2779 16.4555L9.73175 16.4641C9.57966 16.4665 9.45664 16.5887 9.45315 16.7408C9.44949 16.8996 9.5773 17.0304 9.73623 17.0304H14.2801C14.4315 17.0304 14.5542 16.9077 14.5542 16.7563C14.5542 16.6048 14.4315 16.4821 14.2801 16.4821H13.6197C13.1975 16.444 12.9417 15.9072 12.9417 15.9072L12.9532 7.96476C12.9532 7.96476 13.5938 7.85051 14.5154 8.01653C15.2789 8.15409 15.946 9.48356 16.1523 9.93538C16.1936 10.0258 16.2828 10.0848 16.3822 10.0848C16.5175 10.0848 16.6272 9.97509 16.6272 9.83978V7.46948C16.6272 7.19334 16.4033 6.96948 16.1272 6.96948H7.38277Z"/><path fillRule="evenodd" clipRule="evenodd" d="M2 20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V4C22 2.9 21.1 2 20 2H4C2.9 2 2 2.9 2 4V20ZM20 20H4V4H20V20Z"/></svg>;
}

const IconCozText = React.forwardRef(IconCozTextComponent);
export default IconCozText;
