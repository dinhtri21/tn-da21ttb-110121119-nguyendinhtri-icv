export interface IUser {
    id?: string;
    name?: string;
    email?: string;
    password?: string;
    provider?: string;
    pictureUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserLoginData {
    token?: string;
    user?: IUser;
}