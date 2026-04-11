import { Injectable, Logger } from '@nestjs/common';
import mjml2html from 'mjml';
import * as Handlebars from 'handlebars';
import { Section, Block, Column } from '../../database/entities/notification-block.types';

@Injectable()
export class TemplateRendererService {
  private readonly logger = new Logger(TemplateRendererService.name);

  /**
   * Ensambla header + body + footer en MJML, compila a HTML y cachea el resultado.
   * Llamar al guardar el template — el HTML compilado se almacena en compiledHtml.
   */
  compile(
    headerSections: Section[],
    bodySections: Section[],
    footerSections: Section[],
  ): string {
    const mjml = this.assembleMjml(headerSections, bodySections, footerSections);

    const { html, errors } = mjml2html(mjml, { validationLevel: 'soft' });

    if (errors.length) {
      this.logger.warn('MJML compilation warnings:', errors.map((e) => e.message));
    }

    return html;
  }

  /**
   * Reemplaza las variables Handlebars en el HTML ya compilado.
   * Llamar al momento de enviar — nunca almacenar el resultado.
   */
  render(compiledHtml: string, variables: Record<string, unknown>): string {
    const template = Handlebars.compile(compiledHtml);
    return template(variables);
  }

  // ─── MJML assembly ──────────────────────────────────────────────────────────

  private assembleMjml(
    headerSections: Section[],
    bodySections: Section[],
    footerSections: Section[],
  ): string {
    const allSections = [...headerSections, ...bodySections, ...footerSections];
    return `
<mjml>
  <mj-body>
    ${allSections.map((s) => this.renderSection(s)).join('\n    ')}
  </mj-body>
</mjml>`.trim();
  }

  private renderSection(section: Section): string {
    const attrs = this.buildAttrs({
      'background-color': section.backgroundColor,
      padding: section.padding,
    });

    return `<mj-section${attrs}>${section.columns.map((c) => this.renderColumn(c)).join('')}</mj-section>`;
  }

  private renderColumn(column: Column): string {
    const attrs = this.buildAttrs({
      width: column.width,
      padding: column.padding,
      'vertical-align': column.verticalAlign,
    });

    return `<mj-column${attrs}>${column.blocks.map((b) => this.renderBlock(b)).join('')}</mj-column>`;
  }

  private renderBlock(block: Block): string {
    switch (block.type) {
      case 'text': {
        const attrs = this.buildAttrs({
          color: block.color,
          'font-size': block.fontSize,
          align: block.align,
          padding: block.padding,
        });
        return `<mj-text${attrs}>${block.content}</mj-text>`;
      }

      case 'heading': {
        const sizes: Record<1 | 2 | 3, string> = { 1: '32px', 2: '24px', 3: '18px' };
        const attrs = this.buildAttrs({
          'font-size': sizes[block.level],
          'font-weight': 'bold',
          color: block.color,
          align: block.align,
          padding: block.padding,
        });
        return `<mj-text${attrs}>${block.content}</mj-text>`;
      }

      case 'button': {
        const attrs = this.buildAttrs({
          href: block.url,
          align: block.align ?? 'center',
          'background-color': block.backgroundColor,
          color: block.color,
          'border-radius': block.borderRadius,
        });
        return `<mj-button${attrs}>${block.label}</mj-button>`;
      }

      case 'image': {
        const attrs = this.buildAttrs({
          src: block.src,
          alt: block.alt ?? '',
          href: block.link,
          width: block.width,
          align: block.align,
        });
        return `<mj-image${attrs} />`;
      }

      case 'divider': {
        const attrs = this.buildAttrs({
          'border-color': block.borderColor,
          'border-width': block.borderWidth,
          padding: block.padding,
        });
        return `<mj-divider${attrs} />`;
      }

      case 'spacer': {
        return `<mj-spacer height="${block.height}px" />`;
      }
    }
  }

  private buildAttrs(attrs: Record<string, string | undefined>): string {
    return Object.entries(attrs)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => ` ${k}="${v}"`)
      .join('');
  }
}
