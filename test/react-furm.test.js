import { act, cleanup, renderHook } from '@testing-library/react-hooks';
import Furm from '../src/react-furm';

afterEach(cleanup);

test('FORM VALUES', () => {
  let form = Furm({
    initialValues: {
      name: 'Mehdi',
      email: 'mehdi@example.com',
      password: ''
    }
  });

  let { result } = renderHook(() => form.useValues());

  expect(result.current[0]('email'))
    .toEqual('mehdi@example.com');

  act(() => {
    result.current[1]('email', 'ilxanlar@example.com');
  });

  expect(result.current[0]('email'))
    .toEqual('ilxanlar@example.com');

  act(() => {
    form.reset();
  });

  expect(result.current[0]('email'))
    .toEqual('mehdi@example.com');
});


test('VALIDATION', async () => {
  let form = Furm({
    async onSubmit(values) {
      if (values.name === 'Mehdi') {
        throw {
          name: 'You have to pick a unique name.'
        };
      }
    },
    validator(values) {
      if (!values.name || values.name.length === 0) {
        return {
          name: 'Name is required.'
        };
      }
      if (values.name.length < 3) {
        return {
          name: 'Name too short.'
        };
      }
    }
  });

  let meta = renderHook(() => form.useMeta());
  let error = () => meta.result.current.error;
  let status = () => meta.result.current.status;

  expect(status())
    .toEqual('');

  act(() => {
    form.validate();
  });

  expect(status())
    .toEqual('failed');

  expect(error())
    .toEqual({
      name: 'Name is required.'
    });

  act(() => {
    form.change('name', '');
  });

  act(() => {
    form.validate();
  });

  expect(status())
    .toEqual('failed');

  expect(error())
    .toEqual({
      name: 'Name is required.'
    });

  act(() => {
    form.change('name', 'Me');
  });

  act(() => {
    form.validate();
  });

  expect(status())
    .toEqual('failed');

  expect(error())
    .toEqual({
      name: 'Name too short.'
    });

  act(() => {
    form.change('name', 'Mehdi');
  });

  act(() => {
    form.validate();
  });

  expect(status())
    .toEqual('');

  expect(error())
    .toEqual(undefined);

  await act(async () => {
    await form.submit();
  });

  expect(status())
    .toEqual('failed');

  expect(error())
    .toEqual({
      name: 'You have to pick a unique name.'
    });

  act(() => {
    form.change('name', 'Mehdi');
  });

  await act(async () => {
    await form.submit();
  });

  expect(status())
    .toEqual('failed');

  expect(error())
    .toEqual({
      name: 'You have to pick a unique name.'
    });
});
