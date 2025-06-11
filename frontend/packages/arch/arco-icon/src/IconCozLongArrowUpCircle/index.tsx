import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLongArrowUpCircleComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_long_arrow_up_circle${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11.2939 6.04862C11.684 5.65898 12.316 5.65897 12.7061 6.04861C14.1223 7.46287 15.5365 8.87899 16.9515 10.2945C17.3419 10.6851 17.3434 11.3183 16.9538 11.7098C16.567 12.0984 15.932 12.1036 15.5443 11.7159L13 9.17152V17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17V9.17152L8.4634 11.7082C8.07342 12.0982 7.43986 12.0975 7.04987 11.7075C6.65989 11.3175 6.6592 10.684 7.04911 10.2939C8.46384 8.87862 9.87795 7.4627 11.2939 6.04862Z"/><path d="M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z"/></svg>;
}

const IconCozLongArrowUpCircle = React.forwardRef(IconCozLongArrowUpCircleComponent);
export default IconCozLongArrowUpCircle;
