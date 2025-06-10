import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCoinComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_coin${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12.6301 6.97571C12.3346 6.51819 11.6654 6.51819 11.37 6.97571L9.93849 9.19242C9.87149 9.29618 9.76845 9.37147 9.64923 9.40377L7.10565 10.093C6.58392 10.2344 6.37855 10.8646 6.71677 11.2862L8.37697 13.3559C8.45365 13.4515 8.49255 13.5719 8.4863 13.6943L8.35077 16.3462C8.32305 16.8886 8.86304 17.2797 9.36972 17.0842L11.8201 16.139C11.9359 16.0943 12.0641 16.0943 12.18 16.139L14.6303 17.0842C15.137 17.2797 15.677 16.8886 15.6492 16.3462L15.5137 13.6943C15.5075 13.5719 15.5464 13.4515 15.623 13.3559L17.2832 11.2862C17.6215 10.8646 17.4161 10.2344 16.8944 10.093L14.3508 9.40377C14.2316 9.37147 14.1285 9.29618 14.0615 9.19242L12.6301 6.97571Z"/><path fillRule="evenodd" clipRule="evenodd" d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/></svg>;
}

const IconCozCoin = React.forwardRef(IconCozCoinComponent);
export default IconCozCoin;
