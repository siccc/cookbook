import fetch from 'cross-fetch';

type RecaptchaResponse = {
  'success': true|false,
  'challenge_ts': string,
  'hostname': string,
  'error-codes'?: string[]
}

export default async (recaptchaToken: string): Promise<RecaptchaResponse> => {
  const data = new URLSearchParams();
  data.append('secret', process.env.RECAPCHA_SECRET_KEY_INVISIBLE || '');
  data.append('response', recaptchaToken);
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: data
  });
  return response.json();
}