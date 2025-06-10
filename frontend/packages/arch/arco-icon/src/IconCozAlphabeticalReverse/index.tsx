import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAlphabeticalReverseComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_alphabetical_reverse${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.01658 2.00052C6.56124 2.00935 7.00006 2.45362 7.00006 3.00039V21.0004C7.00006 21.5527 6.55235 22.0004 6.00006 22.0004 5.44778 22.0004 5.00006 21.5527 5.00006 21.0004L5.00006 6.71698 3.35716 9.56257C3.08102 10.0409 2.46943 10.2047 1.99113 9.92859 1.51284 9.65245 1.34897 9.04086 1.62511 8.56257L5.12511 2.50039C5.3147 2.172 5.66243 1.99183 6.01658 2.00052zM9.48922 21.0193C9.48922 21.5611 9.92848 22.0004 10.4703 22.0004H20.5413C21.0715 22.0004 21.5012 21.5706 21.5012 21.0405 21.5012 20.501 21.0568 20.0675 20.5174 20.0809L12.8252 20.2724 20.8436 15.4703C21.1771 15.2706 21.3812 14.9105 21.3812 14.5218 21.3812 14.0129 20.9687 13.6004 20.4598 13.6004L10.6158 13.6004C10.0798 13.6004 9.64522 14.035 9.64522 14.571 9.64522 15.1128 10.0888 15.5497 10.6305 15.5415L17.6012 15.4364 10.056 20.0126C9.70412 20.226 9.48922 20.6077 9.48922 21.0193z"/><path fillRule="evenodd" clipRule="evenodd" d="M9.60585 11.1452C9.41883 11.5431 9.70918 12.0004 10.1489 12.0004H10.8148C11.2871 12.0004 11.7155 11.7233 11.9092 11.2926L12.7689 9.38089L18.1474 9.38089L18.9797 11.2817C19.1709 11.7183 19.6023 12.0004 20.079 12.0004L20.8535 12.0004C21.291 12.0004 21.5814 11.5472 21.3986 11.1496L17.1202 1.8489C16.9244 1.42317 16.4986 1.15039 16.03 1.15039L15.0653 1.15039C14.6003 1.15039 14.1771 1.41908 13.9793 1.83996L9.60585 11.1452ZM17.4499 7.59839H13.4819L15.2187 3.71063C15.3252 3.47229 15.6642 3.47424 15.7679 3.71379L17.4499 7.59839Z"/></svg>;
}

const IconCozAlphabeticalReverse = React.forwardRef(IconCozAlphabeticalReverseComponent);
export default IconCozAlphabeticalReverse;
