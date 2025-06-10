import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozArrowDobbleRightComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_arrow_dobble_right${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.17171 19.7782L13.2428 12.7071C13.6333 12.3166 13.6333 11.6834 13.2428 11.2929L6.17171 4.22185C5.78118 3.83132 5.14802 3.83132 4.75749 4.22185C4.36697 4.61237 4.36697 5.24554 4.75749 5.63606L11.1215 12L4.75749 18.364C4.36697 18.7545 4.36697 19.3877 4.75749 19.7782C5.14802 20.1687 5.78118 20.1687 6.17171 19.7782Z"/><path d="M13.1717 19.7782L20.2428 12.7072C20.6333 12.3166 20.6333 11.6835 20.2428 11.2929L13.1717 4.22187C12.7812 3.83135 12.148 3.83135 11.7575 4.22187C11.3669 4.6124 11.3669 5.24556 11.7575 5.63609L18.1214 12L11.7575 18.364C11.3669 18.7545 11.3669 19.3877 11.7575 19.7782C12.148 20.1687 12.7812 20.1687 13.1717 19.7782Z"/></svg>;
}

const IconCozArrowDobbleRight = React.forwardRef(IconCozArrowDobbleRightComponent);
export default IconCozArrowDobbleRight;
