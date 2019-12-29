import { clone, get, set } from './helpers';

export default function Furm(config = {}) {
  let formName =
    config.name ||
    String(
      Math.random()
        .toString(36)
        .substr(2, 9)
    );

  let KEY = '_FURMS_';

  if (get(window, `${KEY}.${formName}.api`)) {
    return get(window, `${KEY}.${formName}.api`);
  }

  let initialValues =
    typeof config.initialValues === 'function'
      ? config.initialValues()
      : clone(config.initialValues || {});

  let form = {
    initialValues: clone(initialValues),
    listeners: {},
    meta: {
      status: ''
    },
    onSubmit: config.onSubmit,
    validator: config.validator,
    values: clone(initialValues)
  };

  function notify(name, payload) {
    if (name in form.listeners && form.listeners[name].length > 0) {
      for (let i = 0; i < form.listeners[name].length; i++) {
        form.listeners[name][i](payload);
      }
    }
  }

  function watch(name, listener) {
    if (!(name in form.listeners)) {
      form.listeners[name] = [];
    }
    form.listeners[name].push(listener);
    return () => {
      form.listeners[name].splice(form.listeners[name].indexOf(listener), 1);
    };
  }

  function getFormMeta() {
    return clone(form.meta);
  }

  function getFormValues() {
    return clone(form.values);
  }

  function getFieldValue(name) {
    return get(form.values, name);
  }

  function getRegisteredFieldNames() {
    return Object.keys(form.listeners)
      .filter(key => key.indexOf('field/value/') === 0)
      .map(key => key.substr(7));
  }

  function changeFieldValue(name, value) {
    set(form.values, name, value);
    notify(`field/value/${name}`, getFieldValue(name));
    notify('values', getFormValues());
  }

  function changeFormMeta(meta) {
    form.meta = meta;
    notify('meta', getFormMeta());
  }

  function createAPI() {
    return {
      HELPERS: {
        clone,
        get,
        set
      },

      change(name, value) {
        return changeFieldValue(name, value);
      },

      get(name) {
        return getFieldValue(name);
      },

      initialize(values) {
        form.values = clone(values);
        form.initialValues = clone(values);
        let fields = getRegisteredFieldNames();
        for (let i = 0; i < fields.length; i++) {
          notify(`field/value/${fields[i]}`, getFieldValue(fields[i]));
        }
        notify('values', getFormValues());
      },

      meta() {
        return getFormMeta();
      },

      onSubmit(submitFunc) {
        form.onSubmit = submitFunc;
      },

      reset() {
        this.initialize(form.initialValues);
        changeFormMeta({
          status: ''
        });
      },

      async submit() {
        if (this.validate()) {
          try {
            let response = await form.onSubmit(getFormValues());
            changeFormMeta({
              response,
              status: 'succeeded'
            });
          } catch (error) {
            changeFormMeta({
              error,
              status: 'failed'
            });
          }
        }
      },

      validate() {
        if (typeof form.validator === 'function') {
          let error = form.validator(getFormValues());
          if (error) {
            changeFormMeta({
              error,
              status: 'failed'
            });
            return false;
          }
        }
        changeFormMeta({
          status: ''
        });
        return true;
      },

      validator(validatorFunc) {
        form.validator = validatorFunc;
      },

      values() {
        return getFormValues();
      },

      watchFieldValue(name, listener) {
        return watch(`field/value/${name}`, listener);
      },

      watchValues(listener) {
        return watch('values', listener);
      },

      watchMeta(listener) {
        return watch('meta', listener);
      }
    };
  }

  form.api = createAPI();

  set(window, `${KEY}.${formName}`, form);

  return form.api;
}
