export interface ISwaggerService {
  getActions: () => Promise<string[]>;
}
