export interface IUser {
    Id?: string;
    Name?: string;
    Email?: string;
    Password?: string;
    Provider?: string;
    PictureUrl?: string;
    CreatedAt?: Date;
    UpdatedAt?: Date;
}

export interface IUserLoginData {
    token?: string;
    user?: IUser;
}