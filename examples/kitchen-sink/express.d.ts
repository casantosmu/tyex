declare namespace Express {
  export interface Request {
    user?: {
      isAdmin: boolean;
    };
  }
}
