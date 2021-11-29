/**********************************************************************
 * Copyright (c) 2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/
import 'reflect-metadata';

import { Container } from 'inversify';
import { DevfileConverter } from '../converter/devfile-converter';

/**
 * Manage all bindings for inversify
 */
export class InversifyBinding {
  private container: Container;

  public initBindings(): Container {
    this.container = new Container();

    this.container.bind(DevfileConverter).toSelf().inSingletonScope();
    return this.container;
  }
}
