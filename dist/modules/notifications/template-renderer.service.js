"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TemplateRendererService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateRendererService = void 0;
const common_1 = require("@nestjs/common");
const mjml_1 = __importDefault(require("mjml"));
const Handlebars = __importStar(require("handlebars"));
let TemplateRendererService = TemplateRendererService_1 = class TemplateRendererService {
    logger = new common_1.Logger(TemplateRendererService_1.name);
    compile(headerSections, bodySections, footerSections) {
        const mjml = this.assembleMjml(headerSections, bodySections, footerSections);
        const { html, errors } = (0, mjml_1.default)(mjml, { validationLevel: 'soft' });
        if (errors.length) {
            this.logger.warn('MJML compilation warnings:', errors.map((e) => e.message));
        }
        return html;
    }
    render(compiledHtml, variables) {
        const template = Handlebars.compile(compiledHtml);
        return template(variables);
    }
    assembleMjml(headerSections, bodySections, footerSections) {
        const allSections = [...headerSections, ...bodySections, ...footerSections];
        return `
<mjml>
  <mj-body>
    ${allSections.map((s) => this.renderSection(s)).join('\n    ')}
  </mj-body>
</mjml>`.trim();
    }
    renderSection(section) {
        const attrs = this.buildAttrs({
            'background-color': section.backgroundColor,
            padding: section.padding,
        });
        return `<mj-section${attrs}>${section.columns.map((c) => this.renderColumn(c)).join('')}</mj-section>`;
    }
    renderColumn(column) {
        const attrs = this.buildAttrs({
            width: column.width,
            padding: column.padding,
            'vertical-align': column.verticalAlign,
        });
        return `<mj-column${attrs}>${column.blocks.map((b) => this.renderBlock(b)).join('')}</mj-column>`;
    }
    renderBlock(block) {
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
                const sizes = { 1: '32px', 2: '24px', 3: '18px' };
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
    buildAttrs(attrs) {
        return Object.entries(attrs)
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => ` ${k}="${v}"`)
            .join('');
    }
};
exports.TemplateRendererService = TemplateRendererService;
exports.TemplateRendererService = TemplateRendererService = TemplateRendererService_1 = __decorate([
    (0, common_1.Injectable)()
], TemplateRendererService);
//# sourceMappingURL=template-renderer.service.js.map