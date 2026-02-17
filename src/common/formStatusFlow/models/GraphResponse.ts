export interface IGraphDataResponseDto {
  /** Nodes */
  GraphNodes?: IGraphNode[] | undefined;
}

export interface IGraphNode {
  /** Titel */
  Title?: string | undefined;
  /** Text */
  Text?: string | undefined;
  /** IsCurrent */
  IsCurrent?: boolean | undefined;
}
