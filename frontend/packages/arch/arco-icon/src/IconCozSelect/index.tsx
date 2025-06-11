import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSelectComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_select${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M14.5529 11.7071L16.6566 13.8108C16.6623 13.8168 16.6681 13.8228 16.674 13.8287C17.0646 14.2192 17.6977 14.2192 18.0883 13.8287L20.2096 11.7074C20.6001 11.3168 20.6001 10.6837 20.2096 10.2931C19.819 9.90261 19.1859 9.90261 18.7954 10.2931L17.3814 11.7071L15.9671 10.2929C15.5766 9.90237 14.9434 9.90237 14.5529 10.2929C14.1624 10.6834 14.1624 11.3166 14.5529 11.7071Z"/><path fillRule="evenodd" clipRule="evenodd" d="M0 9C0 6.79086 1.79086 5 4 5H20C22.2091 5 24 6.79086 24 9V15C24 17.2091 22.2091 19 20 19H4C1.79086 19 0 17.2091 0 15V9ZM2 9C2 7.89543 2.89543 7 4 7H20C21.1046 7 22 7.89543 22 9V15C22 16.1046 21.1046 17 20 17H4C2.89543 17 2 16.1046 2 15V9Z"/></svg>;
}

const IconCozSelect = React.forwardRef(IconCozSelectComponent);
export default IconCozSelect;
