import { appParams } from '../lib/app-params';

function isLocalMode() {
  try {
    const s = localStorage.getItem("verilens_settings");
    return s ? JSON.parse(s).local_mode === true : false;
  } catch {
    return false;
  }
}

// No-op stub used when local_mode is enabled — nothing hits base44 servers
const localStub = {
  auth: {
    me: async () => null,
    isAuthenticated: async () => false,
    logout: () => {},
    redirectToLogin: () => {},
    updateMe: async () => {},
  },
  entities: new Proxy({}, {
    get: () => new Proxy({}, {
      get: () => async () => [],
    }),
  }),
  integrations: {
    Core: {
      InvokeLLM: async () => { throw new Error("InvokeLLM unavailable in local mode"); },
      UploadFile: async () => { throw new Error("UploadFile unavailable in local mode"); },
      SendEmail: async () => {},
      GenerateImage: async () => {},
      ExtractDataFromUploadedFile: async () => {},
    },
  },
  functions: {
    invoke: async () => {},
  },
  analytics: {
    track: () => {},
  },
  users: {
    inviteUser: async () => {},
  },
};

const _local = isLocalMode();

export const apiClient = _local ? localStub : localStub; 
