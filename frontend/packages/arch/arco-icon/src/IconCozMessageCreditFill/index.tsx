import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMessageCreditFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_message_credit_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M23 12C23 18.0751 18.0751 23 12 23H4.61803C3.87465 23 3.39116 22.2177 3.72361 21.5528L4.48405 20.0319C2.3399 18.0247 1 15.1688 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM13.6705 17.8847C14.5058 17.7186 15.2923 17.3773 15.98 16.8877C16.4299 16.5674 16.4261 15.9261 16.0355 15.5355C15.645 15.145 15.0158 15.1586 14.5411 15.4408C13.9436 15.796 13.2456 16 12.5 16C10.2909 16 8.5 14.2091 8.5 12C8.5 9.79086 10.2909 8 12.5 8C13.2456 8 13.9436 8.204 14.5411 8.55923C15.0158 8.84145 15.645 8.85499 16.0355 8.46447C16.4261 8.07395 16.4299 7.43262 15.98 7.1123C15.2923 6.62268 14.5058 6.28144 13.6705 6.11529C12.5067 5.88378 11.3003 6.0026 10.2039 6.45673C9.10754 6.91085 8.17047 7.67989 7.51118 8.66658C6.85189 9.65328 6.5 10.8133 6.5 12C6.5 13.1867 6.85189 14.3467 7.51118 15.3334C8.17047 16.3201 9.10754 17.0892 10.2039 17.5433C11.3003 17.9974 12.5067 18.1162 13.6705 17.8847Z"/></svg>;
}

const IconCozMessageCreditFill = React.forwardRef(IconCozMessageCreditFillComponent);
export default IconCozMessageCreditFill;
