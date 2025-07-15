import configuration from "../../content-collections.ts";
import { GetTypeByName } from "@content-collections/core";

export type Doc = GetTypeByName<typeof configuration, "docs">;
export declare const allDocs: Array<Doc>;

export type Meta = GetTypeByName<typeof configuration, "meta">;
export declare const allMetas: Array<Meta>;

export type Author = GetTypeByName<typeof configuration, "author">;
export declare const allAuthors: Array<Author>;

export type Category = GetTypeByName<typeof configuration, "category">;
export declare const allCategories: Array<Category>;

export type Post = GetTypeByName<typeof configuration, "post">;
export declare const allPosts: Array<Post>;

export type Page = GetTypeByName<typeof configuration, "page">;
export declare const allPages: Array<Page>;

export type Release = GetTypeByName<typeof configuration, "release">;
export declare const allReleases: Array<Release>;

export {};
