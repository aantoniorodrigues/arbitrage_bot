import nock from "nock";

nock.back.fixtures = "fixtures";

function stripId(jsonString: string): string {
  try {
    const obj = JSON.parse(jsonString);
    delete obj.id;
    return JSON.stringify(obj);
  } catch {
    return jsonString;
  }
}

function responseByteLength(response: string): string {
  return String(Buffer.byteLength(JSON.stringify(response)));
}

function sanitizeScope(scope: any) {
  if (scope.body.id) delete scope.body.id;
  if (scope.response && scope.rawHeaders) {
    scope.rawHeaders["content-length"] = responseByteLength(scope.response);
  }
  return scope;
}

const defaultOptions = {
  before: (scope: any) => {
    scope.filteringRequestBody = (body: string) => stripId(body);
    if (scope.rawHeaders) {
      scope.rawHeaders["content-length"] = responseByteLength(scope.response);
    }
  },
  afterRecord: (outputs: any[]) => outputs.map(sanitizeScope),
};

export async function withFixture<T>(
  fixtureName: string,
  fn: () => Promise<T>,
): Promise<T> {
  nock.back.setMode("record");
  const { nockDone } = await nock.back(fixtureName, defaultOptions);
  try {
    return await fn();
  } finally {
    nockDone();
    nock.back.setMode("wild");
  }
}
