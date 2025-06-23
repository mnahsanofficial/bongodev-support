export const jwtConstants = {
  secret: 'DO_NOT_USE_THIS_SECRET_IN_PRODUCTION', // Should be from env variables
  expiresIn: '60m',
};

export const bcryptConstants = {
  saltOrRounds: 10,
};
