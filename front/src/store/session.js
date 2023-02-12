import Cookies from "js-cookie";
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
  const response = await window.fetch(`/apiv1/auth`, {
    method: "GET",
  });
  if (response.ok) {
    const user = await response.json();
    dispatch(setSession({ user: user }));
  }
};
export const addGroup = (group) => async (dispatch) => {
  let options = {};
  options.method = "POST";
  options.headers = options.headers || {};
  options.body = JSON.stringify(group);
  if (options.method.toUpperCase() !== "GET") {
    options.headers["Content-Type"] = "application/json";
    options.headers["XSRF-Token"] = Cookies.get("XSRF-TOKEN");
  }
  const response = await window.fetch(`apiv1/groups`, options);
  if (response.status >= 400) throw response;
  if (response.ok) {
    const res = await response.json();
    return res;
    // dispatch(setSession({ user: user }));
  }
};

export const uploadImage = (image) => async (dispatch) => {
  let options = {};
  options.method = "POST";
  options.headers = options.headers || {};
  console.log(image);
  let formData = new FormData();
  formData.append("image", image);
  options.body = formData;

  if (options.method.toUpperCase() !== "GET") {
    options.headers["XSRF-Token"] = Cookies.get("XSRF-TOKEN");
  }
  const response = await window.fetch(`/apiv1/uploadImage`, options);
  if (response.status >= 400) throw response;
  if (response.ok) {
    const res = await response.json();
    return res;
    // dispatch(setSession({ user: user }));
  }
};

export const sessionRegister = (userData) => async (dispatch) => {
  let options = {};
  options.method = "POST";
  // set options.headers to an empty object if there is no headers
  options.headers = options.headers || {};
  options.body = JSON.stringify(userData);
  // if the options.method is not 'GET', then set the "Content-Type" header to
  // "application/json", and set the "XSRF-TOKEN" header to the value of the
  // "XSRF-TOKEN" cookie
  if (options.method.toUpperCase() !== "GET") {
    options.headers["Content-Type"] =
      options.headers["Content-Type"] || "application/json";
    options.headers["XSRF-Token"] = Cookies.get("XSRF-TOKEN");
  }
  const response = await window.fetch(`apiv1/auth/new`, options);
  if (response.status >= 400) throw response;
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
  let options = {};
  options.method = "POST";
  // set options.headers to an empty object if there is no headers
  options.headers = options.headers || {};
  options.body = JSON.stringify(userData);
  // if the options.method is not 'GET', then set the "Content-Type" header to
  // "application/json", and set the "XSRF-TOKEN" header to the value of the
  // "XSRF-TOKEN" cookie
  if (options.method.toUpperCase() !== "GET") {
    options.headers["Content-Type"] =
      options.headers["Content-Type"] || "application/json";
    options.headers["XSRF-Token"] = Cookies.get("XSRF-TOKEN");
  }
  const response = await window.fetch(`apiv1/auth`, options);

  if (response.status >= 400) throw response;
  if (response.ok) {
    const user = await response.json();
    dispatch(setSession(user));
  }
};

const sessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET:
      state = action.payload;
      return state;

    case CLEAR:
      state = initialState;
      return state;
    default:
      return state;
  }
};

export default sessionReducer;
