/*! Generated by redux-scfld */

export default function (getState, newParams) {
  const { params } = getState();
  return { ...params, ...newParams };
}
