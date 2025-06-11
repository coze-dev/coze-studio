import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMusicComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_music${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12.8615 4.70824C12.8615 4.20831 13.1974 3.77072 13.6804 3.64133L20.1796 1.90041C20.5304 1.80642 20.875 2.07074 20.875 2.43389L20.875 5.2104C20.875 5.71034 20.5391 6.14795 20.056 6.27733L15.0713 7.61244L15.0713 17.1092L15.0713 17.1178C15.0713 19.7486 12.4046 21.8813 9.1151 21.8813C5.8256 21.8813 3.15894 19.7486 3.15894 17.1178C3.15894 14.487 5.8256 12.3543 9.1151 12.3543C10.5346 12.3543 11.8381 12.7514 12.8614 13.4144V6.77215C12.8614 6.76971 12.8614 6.76727 12.8614 6.76482L12.8615 4.70824Z"/></svg>;
}

const IconCozMusic = React.forwardRef(IconCozMusicComponent);
export default IconCozMusic;
