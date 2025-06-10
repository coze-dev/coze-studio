import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozFontSizeComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_font_size${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2.07483 3.12195C1.52254 3.12195 1.07483 3.56966 1.07483 4.12195C1.07483 4.67423 1.52254 5.12195 2.07483 5.12195H7.16979V19.8781C7.16979 20.4304 7.61751 20.8781 8.16979 20.8781C8.72208 20.8781 9.16979 20.4304 9.16979 19.8781V5.12195H14.2648C14.817 5.12195 15.2648 4.67423 15.2648 4.12195C15.2648 3.56966 14.817 3.12195 14.2648 3.12195H2.07483Z"/><path d="M13.3886 10.3991C12.8364 10.3991 12.3886 10.8469 12.3886 11.3991C12.3886 11.9514 12.8364 12.3991 13.3886 12.3991H16.508V19.8781C16.508 20.4304 16.9557 20.8781 17.508 20.8781C18.0602 20.8781 18.508 20.4304 18.508 19.8781V12.3991H21.6273C22.1796 12.3991 22.6273 11.9514 22.6273 11.3991C22.6273 10.8469 22.1796 10.3991 21.6273 10.3991H13.3886Z"/></svg>;
}

const IconCozFontSize = React.forwardRef(IconCozFontSizeComponent);
export default IconCozFontSize;
