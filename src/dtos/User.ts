import { Link } from "../schema";

export interface User {
    id: Number;
    name: String;
    email: String;
    password: String;
    links?: Link[]
}