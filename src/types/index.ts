export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface Script {
  script_id: string;
  file_name: string;
  description: string;
  param?: string[];
  status: boolean;
  tag: string[];
  runner: string[];
  created_at: string;
  updated_at: string;
}

export interface ScriptUpdateData {
  file_name: string;
  description: string;
  status: boolean;
  parameters?: Parameter[];
  tag?: string[];
  runner?: string[];
}

export interface ScriptDetailResponse {
  script: Script;
  parameters: Parameter[];
}

export interface ScriptDetailProps {
  scriptId: string;
  onClose: () => void;
}

export interface ScriptsResponse {
  scripts: Script[];
  data: Script[];
}

export interface ScriptsProps {
  onOpenDetail?: (scriptId: string) => void;
}

export interface Job {
  ID: number;
  RunnerID: string;
  MsgID: string;
  Status: string;
  RequestPayload: string;
  ResponsePayload: string;
  Timeout: boolean;
  created_at: string;
}

export interface JobsResponse {
  jobs: Job[];
  data: Job[];
}

export interface Runner {
  id: string;
  hostname: string;
  ip: string;
  tags: string;
}

export interface RunnersResponse {
  runners: Runner[];
  data: Runner[];
}


export interface Log {
  msg_id: string;
  runner_id: string;
  logs: string;
  status: string;
  message: string;
  created_at: string;
  updated_at: string;
}