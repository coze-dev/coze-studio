import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozVolumeComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_volume${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11.6218 21.7823L5 16.9999V6.99994L11.6218 2.21755C12.6138 1.50111 14 2.20992 14 3.43357V20.5663C14 21.79 12.6138 22.4988 11.6218 21.7823zM7 15.9773L12 19.5884V4.41145L7 8.02256V15.9773zM2 7C1.44772 7 1 7.44772 1 8V16C1 16.5523 1.44772 17 2 17H3V7H2zM16.371 8.22266C16.8003 7.87525 17.43 7.94166 17.7774 8.37099 18.5897 9.37484 19.1111 10.5413 19.1111 12 19.1111 13.4588 18.5897 14.6252 17.7774 15.6291 17.43 16.0584 16.8003 16.1248 16.371 15.7774 15.9417 15.43 15.8753 14.8003 16.2227 14.371 16.8001 13.6574 17.1111 12.9228 17.1111 12 17.1111 11.0773 16.8001 10.3427 16.2227 9.62908 15.8753 9.19975 15.9417 8.57008 16.371 8.22266z"/><path d="M19.6669 4.54662C19.2554 4.1783 18.6232 4.21332 18.2549 4.62484C17.8865 5.03637 17.9216 5.66857 18.3331 6.03689C19.9714 7.50318 21 9.63084 21 12.0001C21 14.3693 19.9714 16.497 18.3331 17.9633C17.9216 18.3316 17.8865 18.9638 18.2549 19.3753C18.6232 19.7868 19.2554 19.8219 19.6669 19.4535C21.7112 17.6239 23 14.9618 23 12.0001C23 9.03832 21.7112 6.37626 19.6669 4.54662Z"/></svg>;
}

const IconCozVolume = React.forwardRef(IconCozVolumeComponent);
export default IconCozVolume;
