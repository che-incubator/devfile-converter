/**********************************************************************
 * Copyright (c) 2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { InversifyBinding } from '../src/inversify/inversify-binding';
import { Main } from '../src/main';
import fs from 'fs-extra';

describe('Test Main with stubs', () => {
  const originalConsoleError = console.error;
  const mockedConsoleError = jest.fn();

  const originalConsoleLog = console.log;
  const mockedConsoleLog = jest.fn();

  const generateMethod = jest.fn();
  const originalArgs = process.argv;
  const selfMock = {
    inSingletonScope: jest.fn(),
  };
  const toSelfMethod = jest.fn();
  const bindMock = {
    toSelf: toSelfMethod,
  };
  const generateMock = {
    generate: generateMethod as any,
  };

  const containerBindMethod = jest.fn();
  const containerGetMethod = jest.fn();
  const container = {
    bind: containerBindMethod,
    get: containerGetMethod,
  } as any;
  let spyInitBindings;

  const readFileSpy = jest.spyOn(fs, 'readFile');

  beforeEach(() => {
    // mock devfile and editor
    readFileSpy.mockResolvedValueOnce('');
    readFileSpy.mockResolvedValueOnce('');

    spyInitBindings = jest.spyOn(InversifyBinding.prototype, 'initBindings');
    spyInitBindings.mockImplementation(() => Promise.resolve(container));
    toSelfMethod.mockReturnValue(selfMock), containerBindMethod.mockReturnValue(bindMock);
    containerGetMethod.mockReturnValue(generateMock);
  });

  afterEach(() => {
    process.argv = originalArgs;
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  beforeEach(() => {
    console.error = mockedConsoleError;
    console.log = mockedConsoleLog;
  });
  afterEach(() => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  test('success', async () => {
    const main = new Main();
    const returnCode = await main.start();
    expect(mockedConsoleError).toBeCalledTimes(0);

    expect(returnCode).toBeTruthy();
  });

  test('error', async () => {
    jest.spyOn(InversifyBinding.prototype, 'initBindings').mockImplementation(() => {
      throw new Error('Dummy error');
    });
    const main = new Main();
    const returnCode = await main.start();
    expect(mockedConsoleError).toBeCalled();
    expect(returnCode).toBeFalsy();
    expect(generateMethod).toBeCalledTimes(0);
  });
});
