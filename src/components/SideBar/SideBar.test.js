import React from 'react';
import Home from '../Home/Home.js';
import SideBar from './SideBar';
import {shallow, mount} from 'enzyme'

let displayName = 'test';
let fandoms = ['fandom 1', 'fandom 2', 'fandom 3'];

it('renders without crashing', () => {
  shallow(<SideBar displayName={displayName} fandoms={fandoms} />);
});

it('changes display name after entering new text and clicking button', () => {
	const wrapper = mount(<SideBar displayName={displayName} fandoms={fandoms} />);
	const input = wrapper.find('#changeDisplayName input');
	const button = wrapper.find('#changeDisplayName button');
	const display = wrapper.find('#displayName');
	input.instance().value = 'new name';
	input.simulate('change', {target: {value: 'new name'}});
	button.simulate('click');
	expect(display.text()).toEqual('display name: new name');
})