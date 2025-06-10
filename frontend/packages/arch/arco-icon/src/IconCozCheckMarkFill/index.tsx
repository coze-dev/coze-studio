import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCheckMarkFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_check_mark_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M20.2909 5.83049C19.9004 5.43997 19.2672 5.43997 18.8767 5.83049L9.702 15.0052L5.45938 10.7626C5.06886 10.372 4.43569 10.372 4.04517 10.7626L3.33806 11.4697C2.94753 11.8602 2.94754 12.4934 3.33806 12.8839L8.99491 18.5407C9.38544 18.9313 10.0186 18.9313 10.4091 18.5407L11.1162 17.8336C11.1182 17.8316 11.1202 17.8296 11.1222 17.8276L20.998 7.95181C21.3885 7.56129 21.3885 6.92812 20.998 6.5376L20.2909 5.83049Z"/></svg>;
}

const IconCozCheckMarkFill = React.forwardRef(IconCozCheckMarkFillComponent);
export default IconCozCheckMarkFill;
