import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozStarComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_star${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11.9999 3.68677L14.4428 7.46974C14.8449 8.0923 15.4631 8.54403 16.1784 8.73786L20.5285 9.91665L17.6859 13.4603C17.2259 14.0339 16.9924 14.7563 17.03 15.4906L17.2617 20.0252L13.0797 18.412C12.3848 18.1439 11.6151 18.1439 10.9202 18.412L6.73818 20.0252L6.96992 15.4906C7.00745 14.7563 6.77403 14.0339 6.31399 13.4603L3.47144 9.91665L7.8215 8.73786C8.53679 8.54403 9.15503 8.0923 9.55706 7.46974L11.9999 3.68677ZM13.26 1.95135C12.6692 1.03632 11.3307 1.03632 10.7398 1.95135L7.87692 6.38477C7.74292 6.59229 7.53684 6.74287 7.2984 6.80748L2.21124 8.186C1.16779 8.46876 0.757036 9.72905 1.43349 10.5724L4.75389 14.7118C4.90723 14.9029 4.98504 15.1438 4.97253 15.3885L4.70147 20.6923C4.64604 21.7771 5.72602 22.5593 6.73937 22.1684L11.64 20.278C11.8717 20.1886 12.1282 20.1886 12.3598 20.278L17.2605 22.1684C18.2739 22.5593 19.3539 21.7771 19.2984 20.6923L19.0274 15.3885C19.0149 15.1438 19.0927 14.9029 19.246 14.7118L22.5664 10.5724C23.2429 9.72905 22.8321 8.46876 21.7887 8.186L16.7015 6.80748C16.4631 6.74287 16.257 6.59229 16.123 6.38477L13.26 1.95135Z"/></svg>;
}

const IconCozStar = React.forwardRef(IconCozStarComponent);
export default IconCozStar;
