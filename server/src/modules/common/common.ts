export const privateKey:string|any=process.env.PRIVATE_KEY||"asdWasdWfsar3ter9gjeri";

export interface TokenPayload {
      Id: number;
      name: string;
      last_name: string;
  }