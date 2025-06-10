import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozModelFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_model_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M19.4879 18.9282C22.8174 17.0059 24.0684 13.2835 23.2407 10.0086L23.2359 10.0117C21.6594 7.64112 18.5075 6.99899 15.1832 7.62101C15.7152 8.54497 16.0305 9.65871 16.1798 10.8064C16.4224 12.6724 16.2529 14.8077 15.7059 16.8376C15.1031 19.0745 13.9855 21.3423 12.3247 22.9466C12.7214 22.7946 13.1142 22.6081 13.5 22.3853L19.4879 18.9282Z"/><path d="M7.34826 23.167C4.09824 22.2463 1.5 19.3018 1.5 15.4571V8.54294C1.5 8.09745 1.53489 7.66404 1.60163 7.24447C2.16053 9.48489 3.5657 11.5867 5.20155 13.2272C6.68597 14.7158 8.45045 15.9303 10.1878 16.6532C11.2563 17.0978 12.3785 17.3815 13.4447 17.3828C12.3212 20.5727 10.1891 22.9813 7.34789 23.1613L7.34826 23.167Z"/><path d="M14.0035 15.3401C13.2076 15.4684 12.162 15.3084 10.9561 14.8066C9.7527 14.306 8.49333 13.5053 7.34966 12.5016C7.63649 11.7482 8.29785 10.9226 9.33533 10.1292C10.3706 9.33738 11.6937 8.64705 13.1348 8.15847C13.6438 8.78357 14.0281 9.7691 14.1965 11.0643C14.3646 12.3568 14.3009 13.8477 14.0035 15.3401Z"/><path d="M19.4879 5.07183C19.8737 5.29458 20.2316 5.5415 20.5616 5.80909C18.3419 5.1729 15.8191 5.33892 13.5804 5.93536C11.549 6.47658 9.61498 7.3974 8.12032 8.54054C7.20101 9.24364 6.39417 10.0736 5.85998 10.9963C3.65915 8.4284 2.63928 5.37766 3.90406 2.82708L3.89891 2.82453C6.32128 0.470289 10.1705 -0.307572 13.5 1.61474L19.4879 5.07183Z"/></svg>;
}

const IconCozModelFill = React.forwardRef(IconCozModelFillComponent);
export default IconCozModelFill;
