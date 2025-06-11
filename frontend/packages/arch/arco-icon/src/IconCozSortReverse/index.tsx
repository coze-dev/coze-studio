import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSortReverseComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_sort_reverse${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.99114 3.01923C6.99185 2.98013 6.99025 2.94113 6.98642 2.90241 6.97225 2.7564 6.92669 2.61958 6.85656 2.49879 6.78769 2.37965 6.69345 2.27345 6.57623 2.1891 6.47913 2.11894 6.36894 2.06578 6.25002 2.034 6.13227 2.00237 6.01146 1.99318 5.89338 2.00488 5.74787 2.019 5.61148 2.0643 5.49099 2.13403 5.37041 2.20351 5.26302 2.29894 5.17807 2.41787 5.15538 2.44949 5.13449 2.48249 5.11555 2.51672L1.62511 8.56234C1.34897 9.04064 1.51284 9.65223 1.99113 9.92837 2.46943 10.2045 3.08102 10.0406 3.35716 9.56234L4.99114 6.73221 4.99113 21.0002C4.99113 21.5525 5.43885 22.0002 5.99113 22.0002 6.54342 22.0002 6.99114 21.5525 6.99114 21.0002L6.99114 3.01923zM9.00005 19.0002C9.00005 18.4479 9.44777 18.0002 10.0001 18.0002H17.0001C17.5523 18.0002 18.0001 18.4479 18.0001 19.0002 18.0001 19.5524 17.5523 20.0002 17.0001 20.0002L10.0001 20.0002C9.44777 20.0002 9.00005 19.5524 9.00005 19.0002zM9.00005 12.0002C9.00005 11.4479 9.44777 11.0002 10.0001 11.0002H19.0001C19.5523 11.0002 20.0001 11.4479 20.0001 12.0002 20.0001 12.5524 19.5523 13.0002 19.0001 13.0002H10.0001C9.44777 13.0002 9.00005 12.5524 9.00005 12.0002zM10.0001 4.00016C9.44777 4.00016 9.00005 4.44788 9.00005 5.00016 9.00005 5.55245 9.44777 6.00016 10.0001 6.00016L21.0001 6.00016C21.5523 6.00016 22.0001 5.55245 22.0001 5.00016 22.0001 4.44788 21.5523 4.00016 21.0001 4.00016L10.0001 4.00016z"/></svg>;
}

const IconCozSortReverse = React.forwardRef(IconCozSortReverseComponent);
export default IconCozSortReverse;
