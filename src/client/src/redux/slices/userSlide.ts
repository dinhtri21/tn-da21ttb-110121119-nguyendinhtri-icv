import { IUser } from "@/interface/user";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IUserState {
  user?: IUser;
}

const initialState: IUserState = {
};

const userSlide = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = undefined; 
    },
  },
});

export const { setUser, clearUser } = userSlide.actions;
export default userSlide.reducer;
