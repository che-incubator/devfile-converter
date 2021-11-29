/**********************************************************************
 * Copyright (c) 2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/

import { InversifyBinding } from './inversify/inversify-binding';

export class Main {
  protected async doStart(): Promise<void> {
    const inversifyBinbding = new InversifyBinding();
    await inversifyBinbding.initBindings();
  }

  async start(): Promise<boolean> {
    try {
      await this.doStart();
      return true;
    } catch (error) {
      console.error('stack=' + error.stack);
      console.error('Unable to start', error);
      return false;
    }
  }
}
