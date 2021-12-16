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

import * as devfileConverter from '../src/index';

describe('Test converter', () => {
  beforeEach(() => {});

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('v1ToV2', async () => {
    const devfileV2 = await devfileConverter.v1ToV2({ apiVersion: '1.0.0' });
    expect(devfileV2).toStrictEqual({
      attributes: {},
      commands: [],
      components: [],
      metadata: {},
      projects: [],
      schemaVersion: '2.1.0',
    });
  });

  test('v2ToV1', async () => {
    const devfileV1 = await devfileConverter.v2ToV1({
      schemaVersion: '2.1.0',
      metadata: {
        name: 'spring-petclinic',
      },
    });
    expect(devfileV1).toStrictEqual({ apiVersion: '1.0.0', metadata: { generateName: 'spring-petclinic' } });
  });
});
