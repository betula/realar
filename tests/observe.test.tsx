import React from 'react';
import { mount } from 'enzyme';
import { use, box, observe } from '../src';

type ForwardRefButtonProps = {
  data?: { value: string };
  onClick?: () => void;
};
const ForwardRefButton = React.forwardRef<HTMLButtonElement, ForwardRefButtonProps>(
  observe((props, ref) => (
    <button ref={ref} onClick={props.onClick}>
      {props.data?.value}
    </button>
  ))
);

test('should support ref forwarding', () => {
  let node;

  class Data {
    @box value = '';
    add = () => (this.value += 'a');
  }

  function A() {
    const data = use(Data);
    return <ForwardRefButton onClick={data.add} data={data} ref={(n: any) => (node = n)} />;
  }

  const el = mount(<A />);

  expect(node).toBeInstanceOf(HTMLButtonElement);
  expect(el.find('button').text()).toBe('');
  el.find('button').simulate('click');
  expect(el.find('button').text()).toBe('a');
});