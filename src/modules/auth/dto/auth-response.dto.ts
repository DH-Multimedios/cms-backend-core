import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseDto {
  /**
   * Session ID en texto plano.
   * Web:     ignorar — viaja automáticamente en cookie HttpOnly `session_id`.
   * Flutter: guardar en SecureStorage y enviar en header `X-Session-Id`.
   */
  sessionId: string;
  user: UserResponseDto;
}
