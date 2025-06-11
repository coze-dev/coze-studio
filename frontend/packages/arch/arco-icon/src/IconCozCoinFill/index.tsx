import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCoinFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_coin_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM12.63 6.97571C12.3345 6.51819 11.6653 6.51819 11.3699 6.97571L9.93843 9.19242C9.87143 9.29618 9.76839 9.37147 9.64917 9.40377L7.10559 10.093C6.58386 10.2344 6.37849 10.8646 6.71671 11.2862L8.37691 13.3559C8.45359 13.4515 8.49249 13.5719 8.48623 13.6943L8.35071 16.3462C8.32299 16.8886 8.86298 17.2797 9.36965 17.0842L11.82 16.139C11.9358 16.0943 12.0641 16.0943 12.1799 16.139L14.6302 17.0842C15.1369 17.2797 15.6769 16.8886 15.6492 16.3462L15.5137 13.6943C15.5074 13.5719 15.5463 13.4515 15.623 13.3559L17.2832 11.2862C17.6214 10.8646 17.416 10.2344 16.8943 10.093L14.3507 9.40377C14.2315 9.37147 14.1285 9.29618 14.0615 9.19242L12.63 6.97571Z"/></svg>;
}

const IconCozCoinFill = React.forwardRef(IconCozCoinFillComponent);
export default IconCozCoinFill;
