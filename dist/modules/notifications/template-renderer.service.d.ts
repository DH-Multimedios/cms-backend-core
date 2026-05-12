import { Section } from '../../database/entities/notification-block.types';
export declare class TemplateRendererService {
    private readonly logger;
    compile(headerSections: Section[], bodySections: Section[], footerSections: Section[]): string;
    render(compiledHtml: string, variables: Record<string, unknown>): string;
    private assembleMjml;
    private renderSection;
    private renderColumn;
    private renderBlock;
    private buildAttrs;
}
//# sourceMappingURL=template-renderer.service.d.ts.map