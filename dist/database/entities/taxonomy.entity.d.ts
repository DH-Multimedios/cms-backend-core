export declare class Taxonomy {
    id: string;
    name: string;
    slug: string;
    type: string;
    description: string;
    imageId: string;
    parentId: string | null;
    parent: Taxonomy;
    children: Taxonomy[];
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=taxonomy.entity.d.ts.map