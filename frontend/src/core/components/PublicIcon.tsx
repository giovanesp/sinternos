import Color from 'color';
import { Image, type ImageProps } from 'primereact/image';
import { useEffect, useRef, useState } from 'react';

const getDefaultBackground = () => {
    const span = document.createElement('span');
    document.body.appendChild(span);
    const bg = window.getComputedStyle(span).backgroundColor;
    document.body.removeChild(span);
    return bg;
};

const getBackgroundColor = (element: HTMLElement, defaultBg?: string) => {
    if (!defaultBg) {
        defaultBg = getDefaultBackground();
    }
    const bg = window.getComputedStyle(element).backgroundColor;
    if (bg !== defaultBg) {
        return bg;
    }
    if (!element.parentElement) {
        return defaultBg;
    }
    return getBackgroundColor(element.parentElement, defaultBg);
};

export const PublicIcon = (
    props: Omit<ImageProps, 'zoomSrc'> & { isHovered?: boolean },
) => {
    const { className, isHovered, src, ...rest } = props;
    const [fullSrc, setFullSrc] = useState<string | undefined>(undefined);
    const publicPath = `${import.meta.env.APP_URL}/icons/`;
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!src) {
            return;
        }
        const hasColor = src.includes('?color=');
        if (hasColor && src.includes('&.+=')) {
            setFullSrc(`${publicPath}${src}`);
            return;
        }
        const background =
            ref.current &&
            Color(getBackgroundColor(ref.current)).hex().slice(1);
        if (!background) {
            return;
        }
        const sep = src.includes('?') ? '&' : '?';
        let colorParam = `${sep}background=${background}`;
        if (hasColor) {
            setFullSrc(`${publicPath}${src}${colorParam}`);
            return;
        }
        const color =
            ref.current &&
            Color(window.getComputedStyle(ref.current).color).hex().slice(1);
        if (!color) {
            return;
        }
        colorParam += `&color=${color}`;
        setFullSrc(`${publicPath}${src}${colorParam}`);
    }, [isHovered, ref, src]);

    return (
        <span className={className} ref={ref}>
            <Image src={fullSrc} {...rest} />
        </span>
    );
};