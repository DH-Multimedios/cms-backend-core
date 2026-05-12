export type EmailProviderType = 'smtp' | 'resend' | 'google-oauth';
export interface SmtpConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
}
export interface ResendConfig {
    apiKey: string;
}
export interface GoogleOAuthConfig {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    user: string;
}
export type EmailProviderConfigUnion = SmtpConfig | ResendConfig | GoogleOAuthConfig;
export declare class EmailProvider {
    id: number;
    name: string;
    provider: EmailProviderType;
    from: string;
    config: EmailProviderConfigUnion;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=email-provider.entity.d.ts.map