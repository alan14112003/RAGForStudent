// User related types

export interface UserInfo {
    name?: string;
    picture?: string;
}

// User type used in auth state (extends UserInfo with full details)
export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
    createdAt?: string;
}
