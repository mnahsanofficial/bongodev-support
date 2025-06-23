import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context: ExecutionContext) {
    // err: error object if an error occurred during authentication (e.g., token expired, invalid signature)
    // user: the user object if authentication was successful, false or undefined otherwise
    // info: additional information about the authentication process (e.g., error message)
    // context: the execution context (e.g., request, response)

    // For an optional guard, we don't throw an error if user is not found or token is invalid.
    // We simply return the user (which could be undefined or false) or null.
    // The route handler can then check if req.user exists.
    return user || null; // Return user if authenticated, otherwise null (or undefined)
  }
}
