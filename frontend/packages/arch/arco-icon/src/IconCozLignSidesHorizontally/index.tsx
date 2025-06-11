import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLignSidesHorizontallyComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_lign_sides_horizontally${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M2.82211 1.5C2.60121 1.5 2.42212 1.67909 2.42212 1.9V22.1C2.42212 22.321 2.60121 22.5 2.82211 22.5H4.02211C4.24303 22.5 4.42211 22.321 4.42211 22.1V1.9C4.42211 1.67909 4.24303 1.5 4.02211 1.5H2.82211ZM21.1229 1.5C20.9019 1.5 20.7229 1.67909 20.7229 1.9V22.1C20.7229 22.321 20.9019 22.5 21.1229 22.5H22.3229C22.5439 22.5 22.7229 22.321 22.7229 22.1V1.9C22.7229 1.67909 22.5439 1.5 22.3229 1.5H21.1229ZM5.72289 5.99844C5.72289 5.66706 5.99153 5.39844 6.32289 5.39844H10.4229C10.7543 5.39844 11.0229 5.66706 11.0229 5.99844V18.0984C11.0229 18.4298 10.7543 18.6984 10.4229 18.6984H6.32289C5.99153 18.6984 5.72289 18.4298 5.72289 18.0984V5.99844ZM14.8229 5.39844C14.4915 5.39844 14.2229 5.66706 14.2229 5.99844V18.0984C14.2229 18.4298 14.4915 18.6984 14.8229 18.6984H18.9229C19.2543 18.6984 19.5229 18.4298 19.5229 18.0984V5.99844C19.5229 5.66706 19.2543 5.39844 18.9229 5.39844H14.8229Z"/></svg>;
}

const IconCozLignSidesHorizontally = React.forwardRef(IconCozLignSidesHorizontallyComponent);
export default IconCozLignSidesHorizontally;
