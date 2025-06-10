import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozKnowledgeFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_knowledge_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M8 2C6.89543 2 6 2.89543 6 4V18C6 20.2091 7.79086 22 10 22H20C21.1046 22 22 21.1046 22 20V6C22 3.79086 20.2091 2 18 2H8ZM11 8C10.4477 8 10 8.44772 10 9C10 9.55228 10.4477 10 11 10H17C17.5523 10 18 9.55228 18 9C18 8.44772 17.5523 8 17 8H11ZM10 14C10 13.4477 10.4477 13 11 13H15C15.5523 13 16 13.4477 16 14C16 14.5523 15.5523 15 15 15H11C10.4477 15 10 14.5523 10 14Z"/><path d="M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20V4Z"/></svg>;
}

const IconCozKnowledgeFill = React.forwardRef(IconCozKnowledgeFillComponent);
export default IconCozKnowledgeFill;
