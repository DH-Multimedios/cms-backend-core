import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController cookie configuration', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it('preserves the secure production default when cookieSecure is omitted', () => {
    process.env.NODE_ENV = 'production';

    expect(() => new AuthController({} as AuthService, {})).not.toThrow();
  });

  it('rejects an explicitly insecure production cookie', () => {
    process.env.NODE_ENV = 'production';

    expect(() => new AuthController({} as AuthService, { cookieSecure: false })).toThrow(
      'cookieSecure cannot be false when NODE_ENV=production',
    );
  });

  it('rejects SameSite=None without a secure cookie', () => {
    process.env.NODE_ENV = 'development';

    expect(
      () =>
        new AuthController({} as AuthService, {
          cookieSameSite: 'none',
          cookieSecure: false,
        }),
    ).toThrow('cookieSecure cannot be false when cookieSameSite=none');
  });
});
