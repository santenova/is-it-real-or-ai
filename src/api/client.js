import { appParams } from '../lib/app-params';

function isLocalMode() {
  try {
    const s = localStorage.getItem("aiorreal_settings");
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
      InvokeLLM: async () => {  },
      UploadFile: async () => {  },
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

// Custom API client implementation
const customApiClient = {
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
      InvokeLLM: async () => { throw new Error("InvokeLLM not implemented"); },
      UploadFile: async ({ file }) => {
        // Simulate an API call to upload a file
        try {
          const response = await fetch(appParams.apiBaseUrl + '/upload', {
            method: 'POST',
            body: file,
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          return { file_url: data.file_url };
        } catch (error) {
          console.error('There has been a problem with your fetch operation:', error);
          throw error;
        }
      },
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

// Log the local mode status
console.log("Running in local mode:", _local);

// Dump localStorage as a table
function dumpLocalStorageAsTable() {
  const keys = Object.keys(localStorage);
  if (keys.length === 0) {
    console.log("localStorage is empty.");
    return;
  }

  // Create a table header
  let table = "| Key | Value |\n| --- | ----- |";
  
  // Add rows for each key-value pair
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    table += `\n| ${key} | ${value} |`;
  });
  console.log(localStorage);
  console.log(table);
}

dumpLocalStorageAsTable();

export const apiClient = _local ? localStub : customApiClient;
