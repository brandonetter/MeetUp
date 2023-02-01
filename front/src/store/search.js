import Cookies from "js-cookie";
const initialState = {
  location: null,
  type: null,
  results: null,
};
const SETLOCATION = "search/setLocation";
const SETTYPE = "search/setType";
const SETRESULTS = "search/setResults";
const CLEAR = "search/clear";

export const setType = (type) => ({
  type: SETTYPE,
  payload: type,
});
export const setResults = (results) => ({
  type: SETRESULTS,
  payload: results,
});
export const setLocation = (location) => ({
  type: SETLOCATION,
  payload: location,
});
const clearState = () => ({
  type: CLEAR,
});
export const getAllGroups = () => async (dispatch) => {
  const response = await window.fetch(`apiv1/groups/all`, {
    method: "GET",
  });
  if (response.ok) {
    const groups = await response.json();
    console.log(groups);
    dispatch(setResults(groups));
  }
};

// export const sessionLogout = () => async (dispatch) => {
//   dispatch(setSession({ user: null }));
// };
// export const sessionRestore = () => async (dispatch) => {
//   const response = await window.fetch(`apiv1/auth`, {
//     method: "GET",
//   });
//   if (response.ok) {
//     const user = await response.json();
//     dispatch(setSession({ user: user }));
//   }
// };

// export const sessionRegister = (userData) => async (dispatch) => {
//   let options = {};
//   options.method = "POST";
//   // set options.headers to an empty object if there is no headers
//   options.headers = options.headers || {};
//   options.body = JSON.stringify(userData);
//   // if the options.method is not 'GET', then set the "Content-Type" header to
//   // "application/json", and set the "XSRF-TOKEN" header to the value of the
//   // "XSRF-TOKEN" cookie
//   if (options.method.toUpperCase() !== "GET") {
//     options.headers["Content-Type"] =
//       options.headers["Content-Type"] || "application/json";
//     options.headers["XSRF-Token"] = Cookies.get("XSRF-TOKEN");
//   }
//   const response = await window.fetch(`apiv1/auth/new`, options);
//   if (response.status >= 400) throw response;
//   if (response.ok) {
//     const user = await response.json();
//     let login = await dispatch(
//       sessionLogin({ credential: userData.email, password: userData.hash })
//     );
//     login = await login.json();
//     dispatch(setSession(login));
//   }
// };
// export const sessionLogin = (userData) => async (dispatch) => {
//   userData.email = userData.credential;
//   delete userData.credential;
//   let options = {};
//   options.method = "POST";
//   // set options.headers to an empty object if there is no headers
//   options.headers = options.headers || {};
//   options.body = JSON.stringify(userData);
//   // if the options.method is not 'GET', then set the "Content-Type" header to
//   // "application/json", and set the "XSRF-TOKEN" header to the value of the
//   // "XSRF-TOKEN" cookie
//   if (options.method.toUpperCase() !== "GET") {
//     options.headers["Content-Type"] =
//       options.headers["Content-Type"] || "application/json";
//     options.headers["XSRF-Token"] = Cookies.get("XSRF-TOKEN");
//   }
//   const response = await window.fetch(`apiv1/auth`, options);

//   if (response.status >= 400) throw response;
//   if (response.ok) {
//     const user = await response.json();
//     dispatch(setSession(user));
//   }
// };

const searchReducer = (state = initialState, action) => {
  console.log("AAAAAAAAAAAAAAAA");
  switch (action.type) {
    case SETRESULTS:
      state.results = action.payload;
      console.log(state.results, "asdas");
      return state;
    case SETLOCATION:
      state.location = action.payload;
      return state;
    case CLEAR:
      state = initialState;
      return state;
    default:
      return state;
  }
};

export default searchReducer;
