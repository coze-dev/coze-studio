import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSkillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_skill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4 2C2.89543 2 2 2.89543 2 4V20C2 21.1046 2.89543 22 4 22H11.6665C11.2642 21.4227 11.0382 20.7274 11.038 20H4V4H20V11.1156L22 12.2703V4C22 2.89543 21.1046 2 20 2H4Z"/><path d="M19.5 18.0002C19.5 18.8286 18.8284 19.5002 18 19.5002C17.1716 19.5002 16.5 18.8286 16.5 18.0002C16.5 17.1718 17.1716 16.5002 18 16.5002C18.8284 16.5002 19.5 17.1718 19.5 18.0002Z"/><path fillRule="evenodd" clipRule="evenodd" d="M19.0001 12.2728C18.3813 11.9156 17.6189 11.9156 17.0001 12.2728L13.54 14.2705C12.9212 14.6277 12.54 15.288 12.54 16.0025V19.9978C12.54 20.7123 12.9212 21.3726 13.54 21.7299L17.0001 23.7275C17.6189 24.0848 18.3813 24.0848 19.0001 23.7275L22.4601 21.7299C23.0789 21.3726 23.4601 20.7123 23.4601 19.9978V16.0025C23.4601 15.288 23.0789 14.6277 22.4601 14.2705L19.0001 12.2728ZM21.4601 16.0025L18.0001 14.0049L14.54 16.0025V19.9978L18.0001 21.9955L21.4601 19.9978V16.0025Z"/><path d="M6 8C6 7.44772 6.44772 7 7 7H17C17.5523 7 18 7.44772 18 8 18 8.55228 17.5523 9 17 9H7C6.44771 9 6 8.55228 6 8zM7 11C6.44772 11 6 11.4477 6 12 6 12.5523 6.44772 13 7 13H12C12.5523 13 13 12.5523 13 12 13 11.4477 12.5523 11 12 11H7z"/></svg>;
}

const IconCozSkill = React.forwardRef(IconCozSkillComponent);
export default IconCozSkill;
