import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import Furm from './furm';

export default function ReactFurm(config = {}) {
  let api = Furm(config);

  api.useFieldValue = function (name) {
    let [state, setState] = useState(() => api.get(name));
    let change = useCallback(value => api.change(name, value), [
      name
    ]);
    useLayoutEffect(() => api.watchFieldValue(name, setState), [name]);
    useEffect(() => {
      // @TODO: There'll may be a performance issue
      setState(api.get(name));
    }, [name]);
    return [state, change];
  };

  api.useMeta = function () {
    let [state, setState] = useState(() => api.meta());
    useLayoutEffect(() => api.watchMeta(setState), []);
    return state;
  };

  api.useValues = function () {
    let [state, setState] = useState(() => api.values());
    let change = useCallback(
      (name, value) => api.change(name, value),
      []
    );
    let get = useCallback(name => api.HELPERS.get(state, name), [state]);
    useLayoutEffect(() => api.watchValues(setState), []);
    return [get, change];
  };

  return api;
}
