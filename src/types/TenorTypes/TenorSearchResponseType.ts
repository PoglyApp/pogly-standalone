import TenorMediaFormatType from "./TenorMediaFormatType";

export default interface TenorSearchResponseType {
    content_description: string,
    created: number,
    flags: any,
    hasaudio: boolean,
    id: string,
    itemurl: string,
    media_formats: TenorMediaFormatType,
    tags: string[],
    title: string,
    url: string,
}