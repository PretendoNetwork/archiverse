import { configureStore, createSlice } from "@reduxjs/toolkit";
import { mergeCommunityData, mergePostData, mergeUserData } from "./merge";

const browserSlice = createSlice({
  name: "browser",
  initialState: {
    clickedButtons: true,
  },
  reducers: {
    clickBrowserButtons: (state, action) => {
      state["clickedButtons"] = true;
    },
    notClickBrowserButtons: (state, action) => {
      state["clickedButtons"] = false;
    },
  },
});

export const { clickBrowserButtons, notClickBrowserButtons } =
  browserSlice.actions;

const apiSlice = createSlice({
  name: "api",
  initialState: {
    data: {},
    errors: {},
  },
  reducers: {
    setData: (state, action) => {
      const { key, data, append, prepend } = action.payload;
      if (key.startsWith("communities")) {
        mergeCommunityData(state, data);
      } else if (key.startsWith("posts")) {
        mergePostData(state, data);
      } else if (key.startsWith("users")) {
        mergeUserData(state, data);
      }
      state.data[key] = data;
      state.errors[key] = null;
    },
    setError: (state, action) => {
      const { key, error } = action.payload;
      state.errors[key] = error;
    },
  },
});

export const { setData, setError } = apiSlice.actions;

const cacheSlice = createSlice({
  name: "cache",
  initialState: {},
  reducers: {
    cachePage: (state, action) => {
      const { path, key, data } = action.payload;
      if (!state[path]) {
        state[path] = {};
      }
      state[path][key] = data;
    },
    clearCache: (state, action) => {
      const { path } = action.payload;
      state[path] = {};
    },
  },
});

export const { cachePage, clearCache } = cacheSlice.actions;

const store = configureStore({
  reducer: {
    api: apiSlice.reducer,
    browser: browserSlice.reducer,
    cache: cacheSlice.reducer,
  },
});

export default store;
