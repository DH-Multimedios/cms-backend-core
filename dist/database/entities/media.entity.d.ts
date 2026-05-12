import { User } from './user.entity';
export declare class Media {
    id: string;
    filename: string;
    originalName: string;
    alt: string;
    mimetype: string;
    size: number;
    width: number;
    height: number;
    path: string;
    url: string;
    uploadedByUserId: string;
    uploadedBy: User;
    usage: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=media.entity.d.ts.map