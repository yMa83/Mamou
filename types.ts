
export interface Stage {
  name: string;
  offsetMinutes: number;
  offsetSeconds?: number;
}

export interface CalculatedStage extends Stage {
  time: Date;
}
