/**********************************************************************
 * Copyright (c) 2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/

import { DevfileConverter } from './converter/devfile-converter';
import { InversifyBinding } from './inversify/inversify-binding';

import { che } from '@eclipse-che/api';
import { Devfile } from './api/devfile';

const inversifyBinding = new InversifyBinding();
const container = inversifyBinding.initBindings();

async function v2ToV1(
  devfileV2: Devfile,
  externalContentAccess?: (filename: string) => Promise<string>
): Promise<che.workspace.devfile.Devfile> {
  const converter = container.get(DevfileConverter);
  return converter.devfileV2toDevfileV1(devfileV2, externalContentAccess);
}

async function v1ToV2(devfileV1: che.workspace.devfile.Devfile): Promise<Devfile> {
  const converter = container.get(DevfileConverter);
  return converter.devfileV1toDevfileV2(devfileV1);
}

export { v1ToV2, v2ToV1 };
