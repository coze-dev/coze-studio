import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTransSwitchComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_trans_switch${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M23 12C23 12.9588 22.8773 13.8889 22.6469 14.7755L21.2557 13.3843C21.1527 13.2813 21.0442 13.1914 20.9317 13.114C20.9768 12.749 21 12.3772 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.8196 6.78846 20.7544 11.5499 20.9889C11.641 21.3515 11.8309 21.7022 12.1344 22.0056L13.0767 22.948C12.7225 22.9824 12.3633 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12Z"/><path fillRule="evenodd" clipRule="evenodd" d="M14.1304 14L14.3913 14.75H16.8913L13.6168 5.33574C13.5469 5.13473 13.3574 5 13.1445 5H10.8555C10.6426 5 10.4531 5.13473 10.3832 5.33574L6.59243 16.2343C6.54722 16.3643 6.64372 16.5 6.78132 16.5H8.64454C8.85736 16.5 9.04687 16.3653 9.11679 16.1643L9.86957 14H14.1304ZM12 7.875L13.4348 12H10.5652L12 7.875Z"/><path d="M14 18.25H22.3101C22.9337 18.25 23.246 17.496 22.805 17.055L20.195 14.445C19.754 14.004 19 14.3163 19 14.9399V16.25H14C13.4477 16.25 13 16.6977 13 17.25 13 17.8023 13.4477 18.25 14 18.25zM22 21.75C22.5523 21.75 23 21.3023 23 20.75 23 20.1977 22.5523 19.75 22 19.75H13.69C13.0663 19.75 12.754 20.504 13.195 20.945L15.805 23.555C16.246 23.996 17 23.6837 17 23.06V21.75H22z"/></svg>;
}

const IconCozTransSwitch = React.forwardRef(IconCozTransSwitchComponent);
export default IconCozTransSwitch;
