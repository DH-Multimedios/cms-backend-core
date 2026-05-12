import { User } from './user.entity';
export declare class File {
    id: string;
    filename: string;
    originalName: string;
    name: string;
    description: string | null;
    mimetype: string;
    size: number;
    path: string;
    uploadedByUserId: string;
    uploadedBy: User;
    fileOwnerUserId: string | null;
    fileOwner: User | null;
    usage: string;
    isPublic: boolean;
    downloadCount: number;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=file.entity.d.ts.map