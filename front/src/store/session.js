import { async } from "q";

const initialState = {
  user: null,
};
const SET = "session/set";
const CLEAR = "session/clear";

export const setSession = (user) => ({
  type: SET,
  payload: user,
});
const clearSession = () => ({
  type: CLEAR,
});

export const sessionLogout = () => async (dispatch) => {
  dispatch(setSession({ user: null }));
};
export const sessionRestore = () => async (dispatch) => {
  const response = await window.csrfFetch(`apiv1/auth`, {
    method: "GET",
  });
  if (response.ok) {
    const user = await response.json();
    dispatch(setSession({ user: user }));
  }
};

export const sessionRegister = (userData) => async (dispatch) => {
  const response = await window.csrfFetch(`apiv1/auth/new`, {
    method: "POST",
    body: JSON.stringify(userData),
  });

  if (response.ok) {
    const user = await response.json();
    let login = await dispatch(
      sessionLogin({ credential: userData.email, password: userData.hash })
    );
    login = await login.json();
    dispatch(setSession(login));
  }
};
export const sessionLogin = (userData) => async (dispatch) => {
  userData.email = userData.credential;
  delete userData.credential;

  const response = await window.csrfFetch(`apiv1/auth`, {
    method: "POST",
    body: JSON.stringify(userData),
  });

  if (response.ok) {
    const user = await response.json();
    dispatch(setSession(user));
  }
};

const sessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET:
      state = action.payload;
      console.log(state);
      return state;

    case CLEAR:
      state = initialState;
      return state;
    default:
      return state;
  }
};

export default sessionReducer;
