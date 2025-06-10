import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPlugComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_plug${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M21.4955 3.91881C23.5511 6.66063 23.3321 10.5675 20.8386 13.0611 20.0575 13.8421 18.7912 13.8421 18.0101 13.0611L10.9391 5.99001C10.158 5.20896 10.158 3.94263 10.9391 3.16158 13.4326.667991 17.3395.448995 20.0813 2.50459L21.1924 1.39348C21.583 1.00295 22.2161 1.00295 22.6066 1.39348 22.9972 1.784 22.9972 2.41717 22.6066 2.80769L21.4955 3.91881zM19.4243 4.57579C17.4717 2.62317 14.3059 2.62317 12.3533 4.57579L19.4243 11.6469C21.377 9.69424 21.377 6.52841 19.4243 4.57579zM9.5247 11.6467L12.3533 14.4753 14.1848 12.6439C14.5753 12.2533 15.2084 12.2533 15.599 12.6439 15.9895 13.0344 15.9895 13.6676 15.599 14.0581L13.7675 15.8895 14.4746 16.5966C15.2557 17.3777 15.2557 18.644 14.4746 19.4251L13.0604 20.8393C10.5668 23.3329 6.65993 23.5519 3.9181 21.4962L2.80769 22.6066C2.41717 22.9972 1.784 22.9972 1.39348 22.6066 1.00295 22.2161 1.00295 21.583 1.39348 21.1924L2.5039 20.082C.448316 17.3402.667317 13.4334 3.1609 10.9398L4.57511 9.52557C5.35616 8.74452 6.62249 8.74452 7.40354 9.52557L8.11048 10.2325 9.94192 8.40106C10.3324 8.01054 10.9656 8.01054 11.3561 8.40106 11.7467 8.79159 11.7467 9.42475 11.3561 9.81528L9.5247 11.6467zM4.57511 12.354L5.98933 10.9398 13.0604 18.0108 11.6462 19.4251C9.69356 21.3777 6.52774 21.3777 4.57511 19.4251 2.62249 17.4724 2.62249 14.3066 4.57511 12.354z"/></svg>;
}

const IconCozPlug = React.forwardRef(IconCozPlugComponent);
export default IconCozPlug;
