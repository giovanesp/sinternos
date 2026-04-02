import { Image, type ImageProps } from 'primereact/image';

export const PublicImage = ({ src, zoomSrc, ...props }: ImageProps) => {
    const publicPath = `${import.meta.env.APP_URL}/images/`;
    return (
        <Image
            src={src ? publicPath + src : src}
            zoomSrc={zoomSrc ? publicPath + zoomSrc : zoomSrc}
            {...props}
        />
    );
};