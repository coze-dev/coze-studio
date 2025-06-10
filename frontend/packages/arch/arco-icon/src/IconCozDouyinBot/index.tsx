import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDouyinBotComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_douyin_bot${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M16.9244 9.12764C16.2902 9.29758 15.6287 9.34094 14.9777 9.25524C14.5618 9.20048 14.1554 9.09374 13.7678 8.93817L15.0619 13.7678C15.6337 15.9017 14.3673 18.095 12.2335 18.6668C10.0996 19.2385 7.90627 17.9722 7.3345 15.8384C6.76273 13.7045 8.02906 11.5111 10.1629 10.9394C10.4965 10.85 10.8314 10.8055 11.1615 10.8023L11.7157 12.8709C11.3875 12.7826 11.0324 12.7769 10.6806 12.8712C9.61363 13.1571 8.98047 14.2538 9.26635 15.3207C9.55223 16.3876 10.6489 17.0208 11.7158 16.7349C12.7828 16.449 13.4159 15.3524 13.1301 14.2854L10.8007 5.59211L12.7325 5.07447C12.8345 5.45501 13.0104 5.81174 13.2503 6.1243C13.4901 6.43685 13.7891 6.6991 14.1303 6.89609C14.4715 7.09307 14.8481 7.22092 15.2387 7.27235C15.6293 7.32377 16.0262 7.29775 16.4068 7.19579L16.9244 9.12764Z"/><path fillRule="evenodd" clipRule="evenodd" d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 15.1688 2.3399 18.0247 4.48405 20.0319L3.72361 21.5528C3.39116 22.2177 3.87465 23 4.61803 23H12ZM6.94025 19.5916L5.85088 18.5718C4.09379 16.9269 3 14.5928 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21H6.23607L6.94025 19.5916Z"/></svg>;
}

const IconCozDouyinBot = React.forwardRef(IconCozDouyinBotComponent);
export default IconCozDouyinBot;
