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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailSenderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailSenderService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const resend_1 = require("resend");
const email_providers_service_1 = require("../email-providers/email-providers.service");
let EmailSenderService = EmailSenderService_1 = class EmailSenderService {
    emailProvidersService;
    logger = new common_1.Logger(EmailSenderService_1.name);
    constructor(emailProvidersService) {
        this.emailProvidersService = emailProvidersService;
    }
    async send(options) {
        const provider = await this.emailProvidersService.findActive();
        if (!provider) {
            this.logger.warn(`No hay provider de email activo. Email a ${options.to} no enviado.`);
            return;
        }
        const from = provider.from ?? options.to;
        switch (provider.provider) {
            case 'smtp': {
                const cfg = provider.config;
                const transport = nodemailer.createTransport({
                    host: cfg.host,
                    port: cfg.port,
                    secure: cfg.secure,
                    ...(cfg.user && cfg.pass ? { auth: { user: cfg.user, pass: cfg.pass } } : {}),
                });
                await transport.sendMail({
                    from,
                    to: options.to,
                    subject: options.subject,
                    html: options.html,
                });
                break;
            }
            case 'resend': {
                const cfg = provider.config;
                const resend = new resend_1.Resend(cfg.apiKey);
                await resend.emails.send({
                    from,
                    to: options.to,
                    subject: options.subject,
                    html: options.html,
                });
                break;
            }
            case 'google-oauth': {
                const cfg = provider.config;
                const transport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        type: 'OAuth2',
                        user: cfg.user,
                        clientId: cfg.clientId,
                        clientSecret: cfg.clientSecret,
                        refreshToken: cfg.refreshToken,
                    },
                });
                await transport.sendMail({
                    from,
                    to: options.to,
                    subject: options.subject,
                    html: options.html,
                });
                break;
            }
        }
        this.logger.log(`Email enviado a ${options.to} via ${provider.provider}`);
    }
};
exports.EmailSenderService = EmailSenderService;
exports.EmailSenderService = EmailSenderService = EmailSenderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_providers_service_1.EmailProvidersService])
], EmailSenderService);
//# sourceMappingURL=email-sender.service.js.map