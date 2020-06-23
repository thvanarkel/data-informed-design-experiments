import React from 'react';

export function useStateWithLocalStorage(localStorageKey, d) {
  const [value, setValue] = React.useState(
    localStorage.getItem(localStorageKey) || d
  );

  React.useEffect(() => {
    localStorage.setItem(localStorageKey, value);
  }, [value]);

  return [value, setValue];
};

export function useLocallyPersistedReducer(reducer, defaultState, storageKey, init = null) {
  const hookVars = React.useReducer(reducer, defaultState, (defaultState) => {
    const persisted = JSON.parse(localStorage.getItem(storageKey))
    return persisted !== null
      ? persisted
      : init !== null ? init(defaultState) : defaultState
  })

  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(hookVars[0]))
  }, [storageKey, hookVars[0]])

  return hookVars
}
