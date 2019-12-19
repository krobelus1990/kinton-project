import { AppID, RecordID, Revision } from "../KintoneTypes";
import { HttpClient } from "../http";

type Lang = "ja" | "en" | "zh" | "user" | "default";

type Properties = {
  [fieldCode: string]: any;
};

type Layout = object[];

type App = {
  appId: string;
  code: string;
  name: string;
  description: string;
  spaceId: string | null;
  threadId: string | null;
  createdAt: string;
  creator: { code: string; name: string };
  modifiedAt: string;
  modifier: {
    code: string;
    name: string;
  };
};

type ViewBase = {
  builtinType?: "ASSIGNEE";
  name: string;
  id: string;
  filterCond: string;
  sort: string;
  index: string;
};

type ListView = ViewBase & {
  type: "LIST";
  fields: string[];
};

type CalendarView = ViewBase & {
  type: "CALENDAR";
  date: string;
  title: string;
};

type CustomView = ViewBase & {
  type: "CUSTOM";
  html: string;
  pager: boolean;
  device: "DESKTOP" | "ANY";
};

type View = ListView | CalendarView | CustomView;

type ViewBaseForUpdate = {
  index: string | number;
  name?: string;
  filterCond?: string;
  sort?: string;
};

type ListViewForUpdate = ViewBaseForUpdate & {
  type: "LIST";
  fields?: string[];
};

type CalendarViewForUpdate = ViewBaseForUpdate & {
  type: "CALENDAR";
  date?: string;
  title?: string;
};

type CustomViewForUpdate = ViewBaseForUpdate & {
  type: "CUSTOM";
  html?: string;
  pager?: boolean;
  device?: "DESKTOP" | "ANY";
};

type ViewForUpdate =
  | ListViewForUpdate
  | CalendarViewForUpdate
  | CustomViewForUpdate;

type State = {
  name: string;
  index: string;
  assignee: {
    type: "ONE" | "ALL" | "ANY";
    entities: Array<{
      entity:
        | {
            type:
              | "USER"
              | "GROUP"
              | "ORGANIZATION"
              | "FIELD_ENTITY"
              | "CUSTOM_FIELD";
            code: string;
          }
        | {
            type: "CREATOR";
            code: null;
          };
      includeSubs: boolean;
    }>;
  };
};

type Action = {
  name: string;
  from: string;
  to: string;
  filterCond: string;
};
type DeployStatus = "PROCESSING" | "SUCCESS" | "FAIL" | "CANCEL";

type Overwrite<T1, T2> = {
  [P in Exclude<keyof T1, keyof T2>]: T1[P];
} &
  T2;

type FieldRightEntity = {
  accessibility: "READ" | "WRITE" | "NONE";
  includeSubs: boolean;
  entity: {
    code: string;
    type: "USER" | "GROUP" | "ORGANIZATION" | "FIELD_ENTITY";
  };
};
type FieldRightEntityForUpdate = Overwrite<
  FieldRightEntity,
  { includeSubs?: boolean }
>;

type FieldRight = {
  code: string;
  entities: FieldRightEntity[];
};

type FieldRightForUpdate = Overwrite<
  FieldRight,
  { entities: FieldRightEntityForUpdate[] }
>;

type RecordRightEntity = {
  entity: {
    code: string;
    type: "USER" | "GROUP" | "ORGANIZATION" | "FIELD_ENTITY";
  };
  viewable: boolean;
  editable: boolean;
  deletable: boolean;
  includeSubs: boolean;
};

type RecordRight = {
  filterCond: string;
  entities: RecordRightEntity[];
};

type Rights = {
  id: string;
  record: {
    viewable: boolean;
    editable: boolean;
    deletable: boolean;
  };
  fields: object;
};

export class AppClient {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  public getFormFields<T extends Properties>(params: {
    app: AppID;
    lang?: Lang;
    preview?: boolean;
  }): Promise<{ properties: T; revision: string }> {
    const { preview, ...rest } = params;
    const path = `/k/v1${preview ? "/preview" : ""}/app/form/fields.json`;
    return this.client.get(path, { ...rest });
  }

  public addFormFields(params: {
    app: AppID;
    properties: object;
    revision?: Revision;
  }): Promise<{ revision: string }> {
    const path = "/k/v1/preview/app/form/fields.json";
    return this.client.post(path, params);
  }

  public updateFormFields(params: {
    app: AppID;
    properties: object;
    revision?: Revision;
  }): Promise<{ revision: string }> {
    const path = "/k/v1/preview/app/form/fields.json";
    return this.client.put(path, params);
  }

  public deleteFormFields(params: {
    app: AppID;
    fields: string[];
    revision?: Revision;
  }) {
    const path = "/k/v1/preview/app/form/fields.json";
    return this.client.delete(path, params);
  }

  public getFormLayout<T extends Layout>(params: {
    app: AppID;
    preview?: boolean;
  }): Promise<{ layout: T; revision: string }> {
    const { preview, ...rest } = params;
    const path = `/k/v1${preview ? "/preview" : ""}/app/form/layout.json`;
    return this.client.get(path, { ...rest });
  }

  public updateFormLayout(params: {
    app: AppID;
    layout: object[];
    revision?: Revision;
  }): Promise<{ revision: string }> {
    const path = "/k/v1/preview/app/form/layout.json";
    return this.client.put(path, params);
  }

  public getViews(params: {
    app: AppID;
    lang?: Lang;
    preview?: boolean;
  }): Promise<{ views: { [viewName: string]: View }; revision: string }> {
    const { preview, ...rest } = params;
    const path = `/k/v1${preview ? "/preview" : ""}/app/views.json`;
    return this.client.get(path, rest);
  }

  public updateViews(params: {
    app: AppID;
    views: { [viewName: string]: ViewForUpdate };
    revision?: Revision;
  }): Promise<{
    views: { [viewName: string]: { id: string } };
    revision: string;
  }> {
    const path = `/k/v1/preview/app/views.json`;
    return this.client.put(path, params);
  }

  public getApp(params: { id: AppID }): Promise<App> {
    const path = "/k/v1/app.json";
    return this.client.get(path, params);
  }

  public getApps(params: {
    ids?: AppID[] | null;
    codes?: string[] | null;
    name?: string | null;
    spaceIds?: Array<string | number> | null;
    limit?: string | number;
    offset?: string | number;
  }): Promise<{ apps: App[] }> {
    const path = "/k/v1/apps.json";
    return this.client.get(path, params);
  }

  public async addApp(params: {
    name: string;
    space?: string | number;
  }): Promise<{ app: string; revision: string }> {
    const { name, space } = params;
    const path = "/k/v1/preview/app.json";
    if (space) {
      const spacePath = "/k/v1/space.json";
      const { defaultThread } = await this.client.get(spacePath, {
        id: space
      });
      return this.client.post(path, { ...params, thread: defaultThread });
    }
    return this.client.post(path, { name });
  }

  public getProcessManagement(params: {
    app: AppID;
    lang?: Lang;
    preview?: boolean;
  }): Promise<{
    enable: boolean;
    states: {
      [statesName: string]: State;
    };
    actions: Action[];
    revision: string;
  }> {
    const { preview, ...rest } = params;
    const path = `/k/v1${preview ? "/preview" : ""}/app/status.json`;
    return this.client.get(path, rest);
  }

  public getDeployStatus(params: {
    apps: AppID[];
  }): Promise<{ apps: Array<{ app: string; status: DeployStatus }> }> {
    const path = "/k/v1/preview/app/deploy.json";
    return this.client.get(path, params);
  }

  public deployApp(params: {
    apps: Array<{ app: AppID; revision?: Revision }>;
    revert?: boolean;
  }): Promise<{}> {
    const path = "/k/v1/preview/app/deploy.json";
    return this.client.post(path, params);
  }

  public getFieldAcl(params: {
    app: AppID;
    preview?: boolean;
  }): Promise<{ rights: FieldRight[]; revision: string }> {
    const { preview, ...rest } = params;
    const path = `/k/v1${preview ? "/preview" : ""}/field/acl.json`;
    return this.client.get(path, { ...rest });
  }

  public evaluateRecordsAcl(params: {
    app: AppID;
    ids: RecordID[];
  }): Promise<{ rights: Rights }> {
    const path = "/k/v1/records/acl/evaluate.json";
    return this.client.get(path, params);
  }

  public updateFieldAcl(params: {
    app?: AppID;
    id?: AppID;
    rights: FieldRightForUpdate[];
    revision?: Revision;
  }): Promise<{ revision: string }> {
    // NOTE: When executing this API without `preview`,
    // all pre-live app's settings will be deployed to live app.
    // This behavior may not be what the users expected,
    // so we disable it temporarily.
    const path = "/k/v1/preview/field/acl.json";
    return this.client.put(path, params);
  }

  public getRecordAcl(params: {
    app: AppID;
    lang?: Lang;
    preview?: boolean;
  }): Promise<{ rights: RecordRight[]; revision: string }> {
    const { preview, ...rest } = params;
    const path = `/k/v1${preview ? "/preview" : ""}/record/acl.json`;
    return this.client.get(path, { ...rest });
  }
}
