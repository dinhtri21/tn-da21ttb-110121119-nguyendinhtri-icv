import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IAuthState {
  token?: string;
}

const initialState: IAuthState = {
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload; 
    },
    clearToken: (state) => {
      state.token = undefined; 
    },
  },
});

export const { setToken, clearToken } = authSlice.actions; // Export actions
export default authSlice.reducer;
