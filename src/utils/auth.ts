import { Elysia } from 'elysia';
import { createGraphError } from './errors';

export const authPlugin = new Elysia({ name: 'auth' }).derive(({ headers, set }) => {
  const authHeader = headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    set.status = 401;
    throw createGraphError('Invalid OAuth access token.', 'OAuthException', 190);
  }
  
  const token = authHeader.substring(7);
  if (process.env.VALID_TOKEN && token !== process.env.VALID_TOKEN) {
    set.status = 401;
    throw createGraphError('Error validating access token: The session has been invalidated.', 'OAuthException', 190, 460);
  }

  return { token };
});
