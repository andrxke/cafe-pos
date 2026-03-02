// c:\Coding\OpenCafe\cafe-pos\backend\src\types\express.d.ts
import type { Request } from 'express';

export interface RequestWithId extends Request {
  requestId?: string;
}

