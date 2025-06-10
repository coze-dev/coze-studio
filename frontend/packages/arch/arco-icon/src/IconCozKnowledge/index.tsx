import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozKnowledgeComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_knowledge${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M10 9C10 8.44772 10.4477 8 11 8H17C17.5523 8 18 8.44772 18 9 18 9.55228 17.5523 10 17 10H11C10.4477 10 10 9.55228 10 9zM11 13C10.4477 13 10 13.4477 10 14 10 14.5523 10.4477 15 11 15H15C15.5523 15 16 14.5523 16 14 16 13.4477 15.5523 13 15 13H11z"/><path fillRule="evenodd" clipRule="evenodd" d="M6 4C6 2.89543 6.89543 2 8 2H18C20.2091 2 22 3.79086 22 6V20C22 21.1046 21.1046 22 20 22H10C7.79086 22 6 20.2091 6 18V4ZM8 4H18C19.1046 4 20 4.89543 20 6V20H10C8.89543 20 8 19.1046 8 18V4Z"/><path d="M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20V4Z"/></svg>;
}

const IconCozKnowledge = React.forwardRef(IconCozKnowledgeComponent);
export default IconCozKnowledge;
