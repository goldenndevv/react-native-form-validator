'use strict';

import React, {Component} from 'react';
import { Text, View, TextInput } from 'react-native';
import {shallow, mount} from 'enzyme';
import Moment from 'moment';
import {expect} from 'chai';
import sinon from 'sinon';
import FormTest from './formTest';

/*---------------- mock DOM ----------------*/
import {jsdom} from 'jsdom';
var exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js'
};

global.ErrorUtils = {
  setGlobalHandler: () => {}
};



describe('ValidationComponent:', () => {

  it('initialize', () => {
    const wrapper = mount(<FormTest />);
    const formTest = wrapper.instance();

    expect(formTest.errors).to.deep.equal([]);
  });

  it('default fields validation should be ok', () => {
    const wrapper = mount(<FormTest />);
    const formTest = wrapper.instance();

    formTest._onPressButton();

    expect(formTest.errors).to.deep.equal([]);
    expect(formTest.isFormValid()).to.equal(true);
    expect(formTest.getErrorsInField('name')).to.deep.equal([]);
    expect(formTest.getErrorsInField('number')).to.deep.equal([]);
    expect(formTest.getErrorMessages()).to.equal("");
  });

  it('method validate should return false', () => {
    const wrapper = shallow(<FormTest />);
    const textInput = wrapper.find(TextInput).first(); // name input
    //Seize a value lower than 2 chars
    textInput.simulate('changeText', "na"); // minlength = 3

    const formTest = wrapper.instance();
    expect(formTest.validate({name: {minlength:3}})).to.equal(false);
  });

  it('empty field with required rule should not be ok', () => {
    const wrapper = shallow(<FormTest />);
    const textInput = wrapper.find(TextInput).first(); // name input
    //Seize a value lower than 2 chars
    textInput.simulate('changeText', ""); // minlength = 3

    const formTest = wrapper.instance();
    expect(formTest.validate({name: {required:true}})).to.equal(false);
  });

  it('fields validation name should not be ok', () => {
    const wrapper = shallow(<FormTest />);
    const textInput = wrapper.find(TextInput).first(); // name input

    //Seize a value lower than 2 chars
    textInput.simulate('changeText', "na"); // minlength = 3

    const formTest = wrapper.instance();
    formTest._onPressButton();

    expect(formTest.isFormValid()).to.equal(false);
    expect(formTest.getErrorMessages()).to.equal('The field "name" length must be greater than 3.');
    expect(formTest.isFieldInError('name')).to.equal(true);

    // Seize an empty value
    textInput.simulate('changeText', ""); // minlength = 3
    formTest._onPressButton();
    expect(formTest.isFormValid()).to.equal(false);
    expect(formTest.getErrorMessages()).to.
      equal('The field "name" length must be greater than 3.\nThe field "name" is mandatory.');
    expect(formTest.getErrorsInField('name')).to.deep.equal([
      'The field "name" length must be greater than 3.',
      'The field "name" is mandatory.'
    ])
    expect(formTest.isFieldInError('name')).to.equal(true);

    // Seize a value greater than maxlength (7)
    textInput.simulate('changeText', "12345678"); // maxlength = 7
    formTest._onPressButton();
    expect(formTest.isFormValid()).to.equal(false);
    expect(formTest.getErrorMessages()).to.
      equal('The field "name" length must be lower than 7.');
    expect(formTest.isFieldInError('name')).to.equal(true);
  });

  it('fields validation email should not be ok', () => {
    const wrapper = shallow(<FormTest />);
    const textInput = wrapper.find(TextInput).at(1); // email input
    textInput.simulate('changeText', "em");

    const formTest = wrapper.instance();
    formTest._onPressButton();

    expect(formTest.isFormValid()).to.equal(false);
    expect(formTest.getErrorMessages()).to.
      equal('The field "email" must be a valid email address.');
    expect(formTest.isFieldInError('email')).to.equal(true);
  });

  it('fields validation date should not be ok', () => {
    const wrapper = shallow(<FormTest />);
    const textInput = wrapper.find(TextInput).last(); // date input
    textInput.simulate('changeText', "fdsfds");

    const formTest = wrapper.instance();
    formTest._onPressButton();

    expect(formTest.isFormValid()).to.equal(false);
    expect(formTest.getErrorMessages()).to.
      equal('The field "date" must be a valid date (YYYY-MM-DD).');
    expect(formTest.isFieldInError('date')).to.equal(true);
  });


  it('fields validation number should not be ok', () => {
    const wrapper = shallow(<FormTest />);
    const textInput = wrapper.find(TextInput).at(2); // number input
    textInput.simulate('changeText', "not_number");

    const formTest = wrapper.instance();
    formTest._onPressButton();

    expect(formTest.isFormValid()).to.equal(false);
    expect(formTest.getErrorMessages()).to.
      equal('The field "number" must be a valid number.');
    expect(formTest.isFieldInError('number')).to.equal(true);
  });

  it('fields validation number should not be very OK', () => {
    const wrapper = shallow(<FormTest />);
    const textInput = wrapper.find(TextInput).at(2); // number input
    textInput.simulate('changeText', "not_number");

    const formTest = wrapper.instance();
    formTest._onPressButton();

    expect(formTest.isFormValid()).to.equal(false);
    expect(formTest.getErrorMessages()).to.
    equal('The field "number" must be a valid number.');
    expect(formTest.getErrorsInField('number')).to.deep.equal(['The field "number" must be a valid number.'])
    expect(formTest.isFieldInError('number')).to.equal(true);
  });

  it('deviceLocale props should be fr', () => {
    const wrapper = shallow(<FormTest deviceLocale="fr" />);
    const formTest = wrapper.instance();
    expect(formTest.deviceLocale).to.equal("fr");
  });

  it('error messages should be in fr locale', () => {
    const wrapper = shallow(<FormTest deviceLocale="fr" />);
    const textInput = wrapper.find(TextInput).at(1); // email input
    textInput.simulate('changeText', "em");

    const formTest = wrapper.instance();
    formTest._onPressButton();

    expect(formTest.isFormValid()).to.equal(false);
    expect(formTest.getErrorMessages()).to.
      equal('Le champ "email" doit être une adresse email valide.');
    expect(formTest.isFieldInError('email')).to.equal(true);
    expect(formTest.deviceLocale).to.equal("fr");
  });

  it('rules props should be updated', () => {
    const rules = {any: /^(.*)$/};
    const wrapper = shallow(<FormTest rules={rules} />);
    const formTest = wrapper.instance();
    expect(formTest.rules).to.equal(rules);
  });

  it('messages props should be updated', () => {
    const messages = {
      en: {numbers: "error on numbers !"},
      fr: {numbers: "erreur sur les nombres !"}
    };
    const wrapper = shallow(<FormTest messages={messages} />);
    const formTest = wrapper.instance();
    expect(formTest.messages).to.equal(messages);
  });

});
