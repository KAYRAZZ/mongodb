export interface IUser {
    _id?: any;
    name?: string;
    email: string;
    password: string;
    createdAt?: Date;
}
export interface IReviewScores {
    review_scores_rating?: number | null;
}
export interface IAddress {
    country?: string;
    market?: string;
}
export interface IImageItem {
    picture_url?: string | null;
}
export interface IListingDoc {
    _id?: any;
    name?: string | null;
    title?: string | null;
    description?: string | null;
    summary?: string | null;
    review_scores?: IReviewScores | null;
    property_type?: string | null;
    country?: string | null;
    address?: IAddress | null;
    images?: {
        picture_url?: string | null;
    } | IImageItem[] | null;
    picture_url?: string | null;
    price?: number | null;
    beds?: number | null;
    bedrooms?: number | null;
    minimum_nights?: number | null;
    maximum_nights?: number | null;
}
export interface IFavorite {
    _id?: any;
    userId: string;
    listingId: string;
    createdAt: Date;
}
//# sourceMappingURL=types.d.ts.map